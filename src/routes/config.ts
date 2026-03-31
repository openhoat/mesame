import type { FastifyInstance } from 'fastify'
import { config } from '../config.js'

export async function configRoute(app: FastifyInstance): Promise<void> {
  app.get('/api/config', async (_request, reply) => {
    return reply.send({
      llmPort: config.llmPort,
      llmHost: config.llmHost,
      provider: config.provider,
      targetBaseUrl: config.targetBaseUrl,
      model: config.model,
      logLevel: config.logLevel,
      language: config.language,
      // Don't expose API keys
      hasApiKey: !!config.targetApiKey,
    })
  })
}
