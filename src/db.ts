import { resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { logger } from './logger.js'

// Resolve database path relative to project root (where src/db.ts is located)
// This ensures the database path works regardless of the current working directory
const projectRoot = resolve(import.meta.dirname, '..')
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
