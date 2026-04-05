import type { FastifyInstance } from 'fastify'
import { setLogLevel } from '../logger.js'
import { getUserSettings, updateUserSettings } from '../services/userSettingsService.js'

const VALID_LOG_LEVELS = ['error', 'warn', 'info', 'debug'] as const

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
  app.put<{
    Body: {
      language?: string | null
      llmUrl?: string | null
      logLevel?: string | null
      optimizationsEnabled?: boolean
      slidingWindowSize?: number
    }
  }>('/api/settings', async (request, reply) => {
    const data = request.body

    // Validate language if provided (null is allowed to clear the preference)
    if (data.language !== undefined && data.language !== null) {
      const validLanguages = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'ja', 'zh', 'ko']
      if (!validLanguages.includes(data.language)) {
        return reply.status(400).send({
          error: `Invalid language. Valid languages: ${validLanguages.join(', ')}`,
        })
      }
    }

    // Validate log level if provided
    if (data.logLevel !== undefined && data.logLevel !== null) {
      if (!VALID_LOG_LEVELS.includes(data.logLevel as (typeof VALID_LOG_LEVELS)[number])) {
        return reply.status(400).send({
          error: `Invalid log level. Valid levels: ${VALID_LOG_LEVELS.join(', ')}`,
        })
      }
    }

    // Validate slidingWindowSize if provided
    if (data.slidingWindowSize !== undefined) {
      if (!Number.isInteger(data.slidingWindowSize) || data.slidingWindowSize < 1) {
        return reply.status(400).send({
          error: 'slidingWindowSize must be a positive integer',
        })
      }
    }

    const settings = await updateUserSettings(data)

    // Apply log level change at runtime
    if (data.logLevel !== undefined) {
      setLogLevel(data.logLevel ?? 'info', app)
    }

    return settings
  })
}
