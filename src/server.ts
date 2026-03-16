import { buildApp } from './app.js'
import { config } from './config.js'

const start = async (): Promise<void> => {
  const app = await buildApp()

  // Temporarily disable logger for listen to avoid duplicate logs
  const logger = app.log
  const logLevel = logger.level
  logger.level = 'silent'

  await app.listen({ port: config.port, host: config.host })

  // Restore logger and log the custom message
  logger.level = logLevel
  logger.info(`Server listening at http://localhost:${config.port}`)
}

start().catch(err => {
  process.stderr.write(`${String(err)}\n`)
  process.exit(1)
})
