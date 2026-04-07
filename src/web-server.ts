import { resolve } from 'node:path'
import cors from '@fastify/cors'
import websocket from '@fastify/websocket'
import type { FastifyError, FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import { config } from './config.js'
import { parseCorsOrigin } from './corsConfig.js'
import { prisma } from './db.js'
import { logBuffer } from './services/logBuffer.js'

async function loadEnvIfNeeded(): Promise<void> {
  // Load environment variables from .env.test if in test mode
  if (process.env.NODE_ENV === 'test') {
    const { config: dotenvConfig } = await import('dotenv')
    dotenvConfig({ path: '.env.test' })
  }
}

export const buildWebApp = async (): Promise<FastifyInstance> => {
  const { logger, getFastifyLoggerConfig } = await import('./logger.js')

  logger.info('Building Web Server...')

  // Web server port (different from proxy)
  const webPort = Number(process.env.MESAME_WEB_PORT) || 3000
  const webHost = process.env.MESAME_WEB_HOST ?? 'localhost'

  const logLevel = process.env.MESAME_LOG_LEVEL ?? 'info'

  const app = Fastify({
    logger: getFastifyLoggerConfig(logLevel),
  })

  // Handle 404 errors
  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).type('text/plain').send('404 - Not Found')
  })

  // Return human-friendly text errors
  app.setErrorHandler((error: FastifyError, _request, reply) => {
    const status = error.statusCode ?? 500
    const message = error.message || 'Internal Server Error'
    reply.status(status).type('text/plain').send(`${status} - ${message}`)
  })

  const { logger: appLogger } = await import('./logger.js')

  appLogger.info('Registering web routes...')
  await app.register(cors, {
    origin: parseCorsOrigin(),
    credentials: true,
  })
  await app.register(websocket)

  // Capture all HTTP requests into logBuffer for dashboard display
  app.addHook('onResponse', (request, reply, done) => {
    // Skip internal/static routes to reduce noise
    if (!request.url.startsWith('/assets') && !request.url.startsWith('/favicon')) {
      logBuffer.add({
        timestamp: new Date().toISOString(),
        level: reply.statusCode >= 400 ? 'error' : 'info',
        message: `${request.method} ${request.url} ${reply.statusCode}`,
        responseTime: reply.elapsedTime,
      })
    }
    done()
  })

  // Import routes
  const { configRoute } = await import('./routes/config.js')
  const { checkpointsRoute } = await import('./routes/checkpoints.js')
  const { conversationsRoute } = await import('./routes/conversations.js')
  const { dashboardRoute } = await import('./routes/dashboard.js')
  const { healthRoute } = await import('./routes/health.js')
  const { logsRoute } = await import('./routes/logs.js')
  const { logsWsRoute } = await import('./routes/logsWs.js')
  const { providerRoutes } = await import('./routes/providers.js')
  const { settingsRoutes } = await import('./routes/settings.js')
  const { sourcesRoute } = await import('./routes/sources.js')
  const { styleProfileRoute } = await import('./routes/styleProfile.js')
  const { uiRoutes } = await import('./routes/ui.js')

  // Register routes
  await app.register(checkpointsRoute)
  await app.register(configRoute)
  await app.register(conversationsRoute)
  await app.register(dashboardRoute)
  await app.register(healthRoute)
  await app.register(logsRoute)
  await app.register(logsWsRoute)
  await app.register(providerRoutes)
  await app.register(settingsRoutes)
  await app.register(sourcesRoute)
  await app.register(styleProfileRoute)
  await app.register(uiRoutes)

  // Proxy LLM routes to LLM server
  appLogger.info(`Proxying /v1/chat/completions and /v1/models to ${config.llmUrl}`)

  // Proxy POST /v1/chat/completions
  app.post('/v1/chat/completions', async (request, reply) => {
    try {
      const { getUserSettings } = await import('./services/userSettingsService.js')
      const userSettings = await getUserSettings()
      const targetUrl = userSettings.llmUrl || config.llmUrl

      const response = await fetch(`${targetUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(request.headers.authorization
            ? { authorization: request.headers.authorization }
            : {}),
        },
        body: JSON.stringify(request.body),
      })

      // Handle streaming responses
      const contentType = response.headers.get('content-type') || ''
      if (
        contentType.includes('text/event-stream') ||
        contentType.includes('application/x-ndjson')
      ) {
        reply.raw.writeHead(response.status, Object.entries(response.headers))
        if (response.body) {
          const reader = response.body.getReader()
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            reply.raw.write(value)
          }
        }
        reply.raw.end()
        return
      }

      // Handle JSON responses
      const data = await response.text()
      return reply.status(response.status).send(data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      appLogger.error(`Proxy error: ${errorMessage}`)
      return reply.status(502).send({ error: `LLM server unavailable: ${errorMessage}` })
    }
  })

  // Proxy GET /v1/models
  app.get('/v1/models', async (_request, reply) => {
    try {
      const { getUserSettings } = await import('./services/userSettingsService.js')
      const userSettings = await getUserSettings()
      const targetUrl = userSettings.llmUrl || config.llmUrl

      const response = await fetch(`${targetUrl}/v1/models`)
      const data = await response.text()
      return reply.status(response.status).send(data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      appLogger.error(`Proxy error: ${errorMessage}`)
      return reply.status(502).send({ error: `LLM server unavailable: ${errorMessage}` })
    }
  })

  appLogger.info('✅ Web routes registered')

  // Prisma cleanup on close
  app.addHook('onClose', async () => {
    appLogger.info('Closing Prisma connection...')
    await prisma.$disconnect()
    appLogger.info('✅ Prisma disconnected')
  })

  // Auto-create default style profile on first startup
  const { ensureDefaultProfile } = await import('./services/styleProfileService.js')
  await ensureDefaultProfile()

  // Apply log level from database settings if available
  const { getUserSettings } = await import('./services/userSettingsService.js')
  const { setLogLevel } = await import('./logger.js')
  const userSettings = await getUserSettings()
  if (userSettings.logLevel) {
    setLogLevel(userSettings.logLevel, app)
    appLogger.info(`Log level set to '${userSettings.logLevel}' from saved settings`)
  }

  appLogger.info('✅ Web application built successfully')

  // Store port for access
  app.decorate('webPort', webPort)
  app.decorate('webHost', webHost)

  return app
}

export const startWebServer = async (): Promise<void> => {
  await loadEnvIfNeeded()

  const app = await buildWebApp()

  const logger = app.log
  const logLevel = logger.level
  logger.level = 'silent'

  const webPort = (app as FastifyInstance & { webPort: number }).webPort
  const webHost = (app as FastifyInstance & { webHost: string }).webHost

  await app.listen({ port: webPort, host: webHost })

  logger.level = logLevel
  logger.info(`🌐 Web Server listening at http://${webHost}:${webPort}`)
  logger.info(`📊 Dashboard: http://${webHost}:${webPort}`)
  logger.info(`💬 Chat: http://${webHost}:${webPort}/chat`)
}

// Only start server if this file is run directly
const isMain = process.argv[1] && resolve(process.argv[1]) === import.meta.filename
if (isMain) {
  process.stdout.write(`>>> [MAIN] Starting MeSame Web Server from ${import.meta.filename}\n`)
  startWebServer().catch(err => {
    process.stderr.write(`>>> [CRITICAL ERROR] Failed to start Web Server: ${String(err)}\n`)
    if (err instanceof Error && err.stack) {
      process.stderr.write(`${err.stack}\n`)
    }
    process.exit(1)
  })
}
