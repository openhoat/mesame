import type { FastifyInstance } from 'fastify'
import { config } from '../config.js'

export async function configRoute(app: FastifyInstance): Promise<void> {
  app.get('/api/config', async (_request, reply) => {
    return reply.send({
      port: config.port,
      host: config.host,
      provider: config.provider,
      targetBaseUrl: config.targetBaseUrl,
      model: config.model,
      logLevel: config.logLevel,
      // Don't expose API keys
      hasApiKey: !!config.targetApiKey,
    })
  })
}
