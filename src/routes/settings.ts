import type { FastifyInstance } from 'fastify'
import { getUserSettings, updateUserSettings } from '../services/userSettingsService.js'

/**
 * Settings management routes
 */
export async function settingsRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/settings - Get user settings
  app.get('/api/settings', async () => {
    const settings = await getUserSettings()
    return settings
  })

  // PUT /api/settings - Update user settings
  app.put<{ Body: { language?: string } }>('/api/settings', async (request, reply) => {
    const data = request.body

    // Validate language if provided
    if (data.language !== undefined) {
      const validLanguages = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'ko']
      if (!validLanguages.includes(data.language)) {
        return reply.status(400).send({
          error: `Invalid language. Valid languages: ${validLanguages.join(', ')}`,
        })
      }
    }

    const settings = await updateUserSettings(data)
    return settings
  })
}
