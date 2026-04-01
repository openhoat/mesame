import cors from '@fastify/cors'
import type { FastifyError, FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import { prisma } from './db.js'

async function loadEnvIfNeeded(): Promise<void> {
  // Load environment variables from .env.test if in test mode
  if (process.env.NODE_ENV === 'test') {
    const { config: dotenvConfig } = await import('dotenv')
    dotenvConfig({ path: '.env.test' })
  }
}

export const buildWebApp = async (): Promise<FastifyInstance> => {
  const { logger } = await import('./logger.js')

  logger.info('Building Web Server...')

  // Web server port (different from proxy)
  const webPort = Number(process.env.MESAME_WEB_PORT) || 3001
  const webHost = process.env.MESAME_WEB_HOST ?? '0.0.0.0'

  const logLevel = process.env.MESAME_LOG_LEVEL ?? 'info'
  const loggerConfig =
    logLevel === 'silent'
      ? false
      : {
          level: logLevel,
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          },
        }

  const app = Fastify({
    logger: loggerConfig,
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
    origin: true,
    credentials: true,
  })

  // Import and register routes
  const { configRoute } = await import('./routes/config.js')
  const { conversationsRoute } = await import('./routes/conversations.js')
  const { healthRoute } = await import('./routes/health.js')
  const { logsRoute } = await import('./routes/logs.js')
  const { providerRoutes } = await import('./routes/providers.js')
  const { sourcesRoute } = await import('./routes/sources.js')
  const { styleProfileRoute } = await import('./routes/styleProfile.js')
  const { uiRoutes } = await import('./routes/ui.js')

  await app.register(configRoute)
  await app.register(conversationsRoute)
  await app.register(healthRoute)
  await app.register(logsRoute)
  await app.register(providerRoutes)
  await app.register(sourcesRoute)
  await app.register(styleProfileRoute)
  await app.register(uiRoutes)

  appLogger.info('✅ Web routes registered')

  // Prisma cleanup on close
  app.addHook('onClose', async () => {
    appLogger.info('Closing Prisma connection...')
    await prisma.$disconnect()
    appLogger.info('✅ Prisma disconnected')
  })

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
if (process.argv[1] === import.meta.filename) {
  startWebServer().catch(err => {
    process.stderr.write(`${String(err)}\n`)
    process.exit(1)
  })
}
