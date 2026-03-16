import { buildApp } from './app.js'
import { config } from './config.js'

const start = async (): Promise<void> => {
  const app = await buildApp()
  await app.listen({ port: config.port, host: config.host })
}

start().catch(err => {
  process.stderr.write(`${String(err)}\n`)
  process.exit(1)
})
