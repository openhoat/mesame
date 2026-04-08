import type { AIMessageChunk } from '@langchain/core/messages'
import type { FastifyPluginAsync } from 'fastify'
import { summarizeDroppedMessages } from '../services/conversationSummarizer.js'
import { getPreferredLanguage } from '../services/languageService.js'
import {
  applyCacheControl,
  convertToLangChainMessages,
  getChatModelFromModelId,
  resolveProviderType,
} from '../services/llmProvider.js'
import { logBuffer } from '../services/logBuffer.js'
import { listAllModels } from '../services/modelDiscovery.js'
import { getCachedResponse, setCachedResponse } from '../services/responseCache.js'
import { partitionSlidingWindow } from '../services/slidingWindow.js'
import { injectStylePrompt } from '../services/styleInjector.js'
import { getActiveStyleProfile } from '../services/styleProfileService.js'
import { extractStreamingTokenUsage, extractTokenUsage } from '../services/tokenUsage.js'
import { getUserSettings } from '../services/userSettingsService.js'
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
    const startTime = Date.now()

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

    // Apply sliding window with optional summarization
    const settings = await getUserSettings()
    let finalMessages = modifiedMessages

    if (settings.optimizationsEnabled) {
      const { kept, dropped } = partitionSlidingWindow(modifiedMessages, settings.slidingWindowSize)

      if (dropped.length > 0) {
        try {
          const summary = await summarizeDroppedMessages(body.model, dropped)
          if (summary) {
            // Insert summary as a system message after existing system messages
            const systemMsgs = kept.filter(m => m.role === 'system')
            const nonSystemMsgs = kept.filter(m => m.role !== 'system')
            finalMessages = [
              ...systemMsgs,
              {
                role: 'system' as const,
                content: `Previous conversation summary: ${summary}`,
              },
              ...nonSystemMsgs,
            ]
          } else {
            finalMessages = kept
          }
        } catch {
          // If summarization fails, fall back to plain sliding window
          finalMessages = kept
        }
      } else {
        finalMessages = kept
      }
    }

    // Check response cache for non-streaming requests
    if (!body.stream && settings.optimizationsEnabled) {
      const cached = getCachedResponse(body.model, finalMessages, body.temperature, body.max_tokens)
      if (cached) {
        const responseTime = Date.now() - startTime
        logBuffer.add({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `chat completion with model ${body.model} (cached)`,
          responseTime,
        })
        return {
          id: `chatcmpl-${Date.now()}`,
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: body.model,
          choices: [
            {
              index: 0,
              message: { role: 'assistant', content: cached.content },
              finish_reason: 'stop',
            },
          ],
          usage: cached.usage,
        }
      }
    }

    // Convert OpenAI format to LangChain messages
    let langchainMessages = convertToLangChainMessages(finalMessages)

    // Apply provider-level prompt caching (Anthropic cache_control)
    const providerType = await resolveProviderType(body.model)
    langchainMessages = applyCacheControl(langchainMessages, providerType)

    // Get LangChain chat model with the requested model (multi-provider)
    const modelOptions = {
      ...(body.temperature !== undefined && { temperature: body.temperature }),
      ...(body.max_tokens !== undefined && { maxTokens: body.max_tokens }),
    }
    const chatModel = await getChatModelFromModelId(body.model, body.stream ?? false, modelOptions)

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
        let streamUsage: ReturnType<typeof extractStreamingTokenUsage> | undefined

        for await (const chunk of stream) {
          const aiChunk = chunk as AIMessageChunk

          // Track usage metadata from streaming chunks
          const chunkUsage = extractStreamingTokenUsage(aiChunk)
          if (chunkUsage) {
            streamUsage = chunkUsage
          }

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

        // Send final chunk with finish_reason and usage if available
        const finalChunk = {
          id: `chatcmpl-${Date.now()}`,
          object: 'chat.completion.chunk',
          created: Math.floor(Date.now() / 1000),
          model: body.model,
          choices: [
            {
              index: 0,
              delta: {},
              finish_reason: 'stop',
            },
          ],
          ...(streamUsage && { usage: streamUsage }),
        }
        reply.raw.write(`data: ${JSON.stringify(finalChunk)}\n\n`)

        // Send final done marker
        reply.raw.write('data: [DONE]\n\n')
        reply.raw.end()

        // Log successful streaming completion
        const responseTime = Date.now() - startTime
        logBuffer.add({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `chat completion with model ${body.model}`,
          responseTime,
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        // Log error
        logBuffer.add({
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `chat completion error with model ${body.model}: ${errorMessage}`,
        })

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

      // Extract token usage from provider response
      const usage = extractTokenUsage(response)

      // Cache the response if optimizations are enabled
      if (settings.optimizationsEnabled) {
        const content = typeof response.content === 'string' ? response.content : ''
        setCachedResponse(
          body.model,
          finalMessages,
          content,
          usage,
          body.temperature,
          body.max_tokens
        )
      }

      // Log successful non-streaming completion
      const responseTime = Date.now() - startTime
      logBuffer.add({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `chat completion with model ${body.model}`,
        responseTime,
      })

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
        usage,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      // Log error
      logBuffer.add({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `chat completion error with model ${body.model}: ${errorMessage}`,
      })

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
