import type { AIMessageChunk } from '@langchain/core/messages'
import type { FastifyPluginAsync } from 'fastify'
import { getPreferredLanguage } from '../services/languageService.js'
import { convertToLangChainMessages, getChatModelFromModelId } from '../services/llmProvider.js'
import { listAllModels } from '../services/modelDiscovery.js'
import { injectStylePrompt } from '../services/styleInjector.js'
import { getActiveStyleProfile } from '../services/styleProfileService.js'
import type {
  ChatCompletionRequest,
  ModelsListResponse,
  OpenAIErrorResponse,
} from '../types/openai.js'

export const proxyRoute: FastifyPluginAsync = async app => {
  // GET /v1/models - OpenAI-compatible model discovery endpoint
  app.get('/v1/models', async (_request, reply) => {
    try {
      const models = await listAllModels()
      const response: ModelsListResponse = {
        object: 'list',
        data: models,
      }
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorResponse: OpenAIErrorResponse = {
        error: {
          message: `Failed to list models: ${errorMessage}`,
          type: 'api_error',
          param: null,
          code: 'provider_unavailable',
        },
      }
      reply.status(500)
      return errorResponse
    }
  })

  app.post<{ Body: ChatCompletionRequest }>('/v1/chat/completions', async (request, reply) => {
    const body = request.body

    // Validate required model field (OpenAI API compliance)
    if (!body.model) {
      const errorResponse: OpenAIErrorResponse = {
        error: {
          message: 'Missing required field: model',
          type: 'invalid_request_error',
          param: 'model',
          code: 'missing_required_field',
        },
      }
      reply.status(400)
      return errorResponse
    }

    // Inject style persona into messages with user's preferred language
    const styleProfile = await getActiveStyleProfile()
    const preferredLanguage = await getPreferredLanguage()
    const modifiedMessages = injectStylePrompt(body.messages, styleProfile, preferredLanguage)

    // Convert OpenAI format to LangChain messages
    const langchainMessages = convertToLangChainMessages(modifiedMessages)

    // Get LangChain chat model with the requested model (multi-provider)
    const chatModel = await getChatModelFromModelId(body.model, body.stream ?? false)

    if (body.stream) {
      // Streaming response
      let headersSent = false

      try {
        reply.raw.writeHead(200, {
          'content-type': 'text/event-stream',
          'cache-control': 'no-cache',
          connection: 'keep-alive',
        })
        headersSent = true

        const stream = await chatModel.stream(langchainMessages)

        for await (const chunk of stream) {
          const aiChunk = chunk as AIMessageChunk
          if (aiChunk.content) {
            // Format as OpenAI-compatible SSE
            const sseData = {
              id: `chatcmpl-${Date.now()}`,
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model: body.model,
              choices: [
                {
                  index: 0,
                  delta: {
                    content: aiChunk.content,
                  },
                  finish_reason: null,
                },
              ],
            }
            reply.raw.write(`data: ${JSON.stringify(sseData)}\n\n`)
          }
        }

        // Send final chunk
        reply.raw.write('data: [DONE]\n\n')
        reply.raw.end()
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        if (headersSent) {
          // Headers already sent, send error as SSE event
          const errorData = {
            id: `chatcmpl-${Date.now()}`,
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model: body.model,
            error: {
              message: errorMessage,
              type: 'langchain_error',
            },
          }
          reply.raw.write(`data: ${JSON.stringify(errorData)}\n\n`)
          reply.raw.end()
        } else {
          // Headers not sent yet, send normal error response
          reply.status(500)
          return reply.send({
            error: {
              message: errorMessage,
              type: 'langchain_error',
            },
          })
        }
      }
      return
    }

    // Non-streaming response
    try {
      const response = await chatModel.invoke(langchainMessages)
      return {
        id: `chatcmpl-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: body.model,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: response.content,
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      reply.status(500)
      return reply.send({
        error: {
          message: errorMessage,
          type: 'langchain_error',
        },
      })
    }
  })
}
