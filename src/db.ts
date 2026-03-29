import { resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { logger } from './logger.js'

// Resolve database path relative to project root
// When running compiled code: import.meta.dirname is dist/server, so go up 2 levels
// When running with tsx: import.meta.dirname is src, so go up 1 level
const projectRoot = resolve(
  import.meta.dirname,
  import.meta.filename.includes('/dist/') ? '../..' : '..'
)
const databaseUrl = process.env.DATABASE_URL

// If DATABASE_URL is a relative file path, resolve it relative to project root
if (databaseUrl?.startsWith('file:./')) {
  const relativePath = databaseUrl.slice('file:'.length)
  const absolutePath = resolve(projectRoot, relativePath)
  process.env.DATABASE_URL = `file:${absolutePath}`
  logger.debug(`Resolved DATABASE_URL to absolute path: ${process.env.DATABASE_URL}`)
}

logger.info('Initializing PrismaClient...')
logger.debug(`DATABASE_URL: ${process.env.DATABASE_URL || '(not set)'}`)

export const prisma = new PrismaClient({
  log: process.env.MESAME_LOG_LEVEL === 'debug' ? ['query', 'info', 'warn', 'error'] : ['error'],
})

logger.info('✅ PrismaClient initialized')
