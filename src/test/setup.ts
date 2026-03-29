import dotenv from 'dotenv'

// Load .env file silently (suppress dotenv logs)
dotenv.config({ quiet: true })

// Monkey-patch dotenv.config to always use quiet: true
// This prevents noisy logs from dependencies like 'natural' that call dotenv.config()
const originalConfig = dotenv.config.bind(dotenv)
dotenv.config = ((options?: Parameters<typeof dotenv.config>[0]) => {
  return originalConfig({ ...options, quiet: true })
}) as typeof dotenv.config

// Use SQLite in-memory database for tests (faster, isolated, no cleanup needed)
process.env.DATABASE_URL = 'file::memory:?cache=shared'

// Disable logging in test environment
process.env.MESAME_LOG_LEVEL = 'silent'
