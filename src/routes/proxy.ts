import type { FastifyPluginAsync } from 'fastify'
import { config } from '../config.js'
import { injectStylePrompt } from '../services/styleInjector.js'
import { getActiveStyleProfile } from '../services/styleProfileService.js'
import type { ChatCompletionRequest } from '../types/openai.js'

export const proxyRoute: FastifyPluginAsync = async app => {
  app.post<{ Body: ChatCompletionRequest }>('/v1/chat/completions', async (request, reply) => {
    const body = request.body

    // Inject style persona into messages
    const styleProfile = await getActiveStyleProfile()
    const modifiedMessages = injectStylePrompt(body.messages, styleProfile)
    const modifiedBody = { ...body, model: config.model, messages: modifiedMessages }

    const upstreamUrl = `${config.targetBaseUrl}/v1/chat/completions`

    const headers: Record<string, string> = {
      'content-type': 'application/json',
    }
    if (config.targetApiKey) {
      headers.authorization = `Bearer ${config.targetApiKey}`
    }

    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(modifiedBody),
    })

    if (!upstreamResponse.ok) {
      reply.status(upstreamResponse.status)
      const errorBody = await upstreamResponse.text()
      return reply.send(errorBody)
    }

    if (body.stream) {
      reply.raw.writeHead(200, {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
        connection: 'keep-alive',
      })

      const reader = upstreamResponse.body?.getReader()
      if (!reader) {
        reply.raw.end()
        return reply
      }

      const pump = async (): Promise<void> => {
        const { done, value } = await reader.read()
        if (done) {
          reply.raw.end()
          return
        }
        reply.raw.write(value)
        return pump()
      }

      await pump()
      return reply
    }

    const data = await upstreamResponse.json()
    return data
  })
}
