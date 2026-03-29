import { PrismaClient } from '@prisma/client'
import { logger } from './logger.js'

logger.info('Initializing PrismaClient...')
logger.debug(`DATABASE_URL: ${process.env.DATABASE_URL || '(not set)'}`)

export const prisma = new PrismaClient({
  log: process.env.MESAME_LOG_LEVEL === 'debug' ? ['query', 'info', 'warn', 'error'] : ['error'],
})

logger.info('✅ PrismaClient initialized')
