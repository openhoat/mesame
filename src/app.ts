import cors from '@fastify/cors'
import type { FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import { config } from './config.js'
import { prisma } from './db.js'
import { healthRoute } from './routes/health.js'
import { proxyRoute } from './routes/proxy.js'

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: config.logLevel,
    },
  })

  await app.register(cors)
  await app.register(healthRoute)
  await app.register(proxyRoute)

  app.addHook('onClose', async () => {
    await prisma.$disconnect()
  })

  return app
}
