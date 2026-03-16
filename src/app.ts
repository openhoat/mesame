import cors from '@fastify/cors'
import type { FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import { config } from './config.js'
import { prisma } from './db.js'
import { healthRoute } from './routes/health.js'
import { proxyRoute } from './routes/proxy.js'

export async function buildApp(): Promise<FastifyInstance> {
  const loggerConfig = config.logLevel === 'silent' ? false : { level: config.logLevel }

  const app = Fastify({
    logger: loggerConfig,
  })

  await app.register(cors)
  await app.register(healthRoute)
  await app.register(proxyRoute)

  app.addHook('onClose', async () => {
    await prisma.$disconnect()
  })

  return app
}
