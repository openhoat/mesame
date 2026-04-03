import { resolve } from 'node:path'
import { buildApp } from './app.js'
import { config } from './config.js'

async function loadEnvIfNeeded(): Promise<void> {
  // Load environment variables from .env.test if in test mode
  // MUST be done before Prisma connects
  if (process.env.NODE_ENV === 'test') {
    const { config: dotenvConfig } = await import('dotenv')
    dotenvConfig({ path: '.env.test' })
  }
}

export const startServer = async (): Promise<void> => {
  // Load environment variables first
  await loadEnvIfNeeded()

  const app = await buildApp()

  // Temporarily disable logger for listen to avoid duplicate logs
  const logger = app.log
  const logLevel = logger.level
  logger.level = 'silent'

  await app.listen({ port: config.llmPort, host: config.llmHost })

  // Restore logger and log the custom message
  logger.level = logLevel
  logger.info(`Server listening at http://${config.llmHost}:${config.llmPort}`)
}

// Only start server if this file is run directly (not imported)
const isMain = process.argv[1] && resolve(process.argv[1]) === import.meta.filename
if (isMain) {
  startServer().catch(err => {
    process.stderr.write(`${String(err)}\n`)
    process.exit(1)
  })
}
