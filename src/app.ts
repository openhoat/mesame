import cors from '@fastify/cors'
import type { FastifyError, FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import { config } from './config.js'
import { prisma } from './db.js'
import { healthRoute } from './routes/health.js'
import { proxyRoute } from './routes/proxy.js'
import { uiRoutes } from './routes/ui.js'

export async function buildApp(): Promise<FastifyInstance> {
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

  await app.register(cors)
  await app.register(healthRoute)
  await app.register(proxyRoute)
  await app.register(uiRoutes)

  app.addHook('onClose', async () => {
    await prisma.$disconnect()
  })

  return app
}
