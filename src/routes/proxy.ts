import type { AIMessageChunk } from '@langchain/core/messages'
import type { FastifyPluginAsync } from 'fastify'
import { config } from '../config.js'
import { convertToLangChainMessages, getLLMProvider } from '../services/llmProvider.js'
import { injectStylePrompt } from '../services/styleInjector.js'
import { getActiveStyleProfile } from '../services/styleProfileService.js'
import type { ChatCompletionRequest, ModelsListResponse } from '../types/openai.js'

export const proxyRoute: FastifyPluginAsync = async app => {
  // GET /v1/models - OpenAI-compatible model discovery endpoint
  app.get('/v1/models', async () => {
    const response: ModelsListResponse = {
      object: 'list',
      data: [
        {
          id: config.model,
          object: 'model',
          created: Math.floor(Date.now() / 1000),
          owned_by: 'mesame',
        },
      ],
    }
    return response
  })

  app.post<{ Body: ChatCompletionRequest }>('/v1/chat/completions', async (request, reply) => {
    const body = request.body

    // Inject style persona into messages
    const styleProfile = await getActiveStyleProfile()
    const modifiedMessages = injectStylePrompt(body.messages, styleProfile)

    // Convert OpenAI format to LangChain messages
    const langchainMessages = convertToLangChainMessages(modifiedMessages)

    // Get LangChain chat model
    const chatModel = getLLMProvider(body.stream)

    try {
      if (body.stream) {
        // Streaming response
        reply.raw.writeHead(200, {
          'content-type': 'text/event-stream',
          'cache-control': 'no-cache',
          connection: 'keep-alive',
        })

        const stream = await chatModel.stream(langchainMessages)

        for await (const chunk of stream) {
          const aiChunk = chunk as AIMessageChunk
          if (aiChunk.content) {
            // Format as OpenAI-compatible SSE
            const sseData = {
              id: `chatcmpl-${Date.now()}`,
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model: config.model,
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
        return reply
      }

      // Non-streaming response
      const response = await chatModel.invoke(langchainMessages)
      const openaiResponse = {
        id: `chatcmpl-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: config.model,
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
      return openaiResponse
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
