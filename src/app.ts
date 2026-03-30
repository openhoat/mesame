import cors from '@fastify/cors'
import type { FastifyError, FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import { config } from './config.js'
import { prisma } from './db.js'
import { configRoute } from './routes/config.js'
import { conversationsRoute } from './routes/conversations.js'
import { healthRoute } from './routes/health.js'
import { logsRoute } from './routes/logs.js'
import { proxyRoute } from './routes/proxy.js'
import { sourcesRoute } from './routes/sources.js'
import { styleProfileRoute } from './routes/styleProfile.js'
import { uiRoutes } from './routes/ui.js'

export async function buildApp(): Promise<FastifyInstance> {
  const { logger, logConfiguration } = await import('./logger.js')

  logger.info('Building Fastify application...')

  // Display configuration on startup
  logConfiguration(config)

  const loggerConfig =
    config.logLevel === 'silent'
      ? false
      : {
          level: config.logLevel,
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

  // Handle 404 errors (route not found)
  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).type('text/plain').send('404 - Not Found')
  })

  // Return human-friendly text errors instead of JSON
  app.setErrorHandler((error: FastifyError, _request, reply) => {
    const status = error.statusCode ?? 500
    const message = error.message || 'Internal Server Error'
    reply.status(status).type('text/plain').send(`${status} - ${message}`)
  })

  const { logger: appLogger } = await import('./logger.js')

  appLogger.info('Registering routes...')
  await app.register(cors, {
    origin: true, // Allow all origins
    credentials: true, // Allow credentials (cookies, auth headers)
  })
  await app.register(configRoute)
  await app.register(conversationsRoute)
  await app.register(healthRoute)
  await app.register(logsRoute)
  await app.register(proxyRoute)
  await app.register(sourcesRoute)
  await app.register(styleProfileRoute)
  await app.register(uiRoutes)
  appLogger.info('✅ All routes registered')

  app.addHook('onClose', async () => {
    appLogger.info('Closing Prisma connection...')
    await prisma.$disconnect()
    appLogger.info('✅ Prisma disconnected')
  })

  appLogger.info('✅ Application built successfully')
  return app
}
