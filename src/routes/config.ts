import type { FastifyInstance } from 'fastify'
import { config } from '../config.js'
import { getUserSettings } from '../services/userSettingsService.js'

export async function configRoute(app: FastifyInstance): Promise<void> {
  app.get('/api/config', async (_request, reply) => {
    // Get user settings for language preference
    const userSettings = await getUserSettings()

    return reply.send({
      llmPort: config.llmPort,
      llmHost: config.llmHost,
      llmUrl: userSettings.llmUrl || config.llmUrl,
      provider: config.provider,
      targetBaseUrl: config.targetBaseUrl,
      model: config.model,
      logLevel: config.logLevel,
      language: userSettings.language, // Use language from user settings
      // Don't expose API keys
      hasApiKey: !!config.targetApiKey,
    })
  })
}
