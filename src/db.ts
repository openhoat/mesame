import { resolve } from 'node:path'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from './generated/prisma/client.js'
import { logger } from './logger.js'

let prismaInstance: PrismaClient | null = null

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL ?? 'file:./data/mesame.db'

  // Resolve relative file paths to absolute paths
  if (databaseUrl.startsWith('file:./')) {
    const projectRoot = resolve(
      import.meta.dirname,
      import.meta.filename.includes('/dist/') ? '../..' : '..'
    )
    const relativePath = databaseUrl.slice('file:'.length)
    const absolutePath = resolve(projectRoot, relativePath)
    return `file:${absolutePath}`
  }

  return databaseUrl
}

function initializePrisma(): PrismaClient {
  const databaseUrl = getDatabaseUrl()

  logger.info('Initializing PrismaClient...')
  logger.debug(`DATABASE_URL: ${databaseUrl}`)

  // Create the libSQL adapter for SQLite
  const adapter = new PrismaLibSql({
    url: databaseUrl,
  })

  const client = new PrismaClient({
    adapter,
    log: process.env.MESAME_LOG_LEVEL === 'debug' ? ['query', 'info', 'warn', 'error'] : ['error'],
  })

  logger.info('✅ PrismaClient initialized')
  return client
}

// Lazy initialization: create client only when accessed
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!prismaInstance) {
      prismaInstance = initializePrisma()
    }
    return prismaInstance[prop as keyof PrismaClient]
  },
})
