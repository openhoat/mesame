import { resolve } from 'node:path'
import cors from '@fastify/cors'
import type { FastifyError, FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import { config } from './config.js'
import { parseCorsOrigin } from './corsConfig.js'

async function loadEnvIfNeeded(): Promise<void> {
  // Load environment variables from .env.test if in test mode
  if (process.env.NODE_ENV === 'test') {
    const { config: dotenvConfig } = await import('dotenv')
    dotenvConfig({ path: '.env.test' })
  }
}

export const buildLLMApp = async (): Promise<FastifyInstance> => {
  const { logger, logConfiguration, getFastifyLoggerConfig } = await import('./logger.js')

  logger.info('Building LLM API Server...')
  logConfiguration(config)

  const app = Fastify({
    logger: getFastifyLoggerConfig(config.logLevel),
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

  appLogger.info('Registering LLM API routes...')
  await app.register(cors, {
    origin: parseCorsOrigin(),
    credentials: true,
  })

  // Import and register routes
  const { proxyRoute } = await import('./routes/proxy.js')
  const { healthRoute } = await import('./routes/health.js')
  const { conversationsRoute } = await import('./routes/conversations.js')

  await app.register(proxyRoute)
  await app.register(healthRoute)
  await app.register(conversationsRoute)

  appLogger.info('✅ LLM API routes registered')
  appLogger.info('✅ LLM API server built successfully')

  return app
}

export const startLLMServer = async (): Promise<void> => {
  await loadEnvIfNeeded()

  const app = await buildLLMApp()

  const logger = app.log
  const logLevel = logger.level
  logger.level = 'silent'

  await app.listen({ port: config.llmPort, host: config.llmHost })

  logger.level = logLevel
  logger.info(`🚀 LLM API Server listening at ${config.llmUrl}`)
  logger.info(`📡 OpenAI-compatible endpoint: ${config.llmUrl}/v1/chat/completions`)
}

// Only start server if this file is run directly
const isMain = process.argv[1] && resolve(process.argv[1]) === import.meta.filename
if (isMain) {
  process.stdout.write(`>>> [MAIN] Starting MeSame LLM Server from ${import.meta.filename}\n`)
  startLLMServer().catch(err => {
    process.stderr.write(`>>> [CRITICAL ERROR] Failed to start LLM Server: ${String(err)}\n`)
    if (err instanceof Error && err.stack) {
      process.stderr.write(`${err.stack}\n`)
    }
    process.exit(1)
  })
}
