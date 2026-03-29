import { prisma } from '../db.js'
import { logger } from '../logger.js'

export interface SourceData {
  title: string
  content: string
}

export interface SourceResponse {
  id: string
  title: string
  content: string
  createdAt: Date
}

export async function createSource(data: SourceData): Promise<SourceResponse> {
  logger.debug(`Creating source: ${data.title}`)
  try {
    const source = await prisma.source.create({ data })
    logger.info(`✅ Source created: ${source.id}`)
    return source
  } catch (error) {
    logger.error(`❌ Failed to create source: ${error}`)
    throw error
  }
}

export async function getAllSources(): Promise<SourceResponse[]> {
  logger.debug('Fetching all sources from database...')
  try {
    const sources = await prisma.source.findMany({ orderBy: { createdAt: 'desc' } })
    logger.info(`✅ Retrieved ${sources.length} sources`)
    return sources
  } catch (error) {
    logger.error(`❌ Failed to fetch sources: ${error}`)
    throw error
  }
}

export async function getSourceById(id: string): Promise<SourceResponse | null> {
  logger.debug(`Fetching source by ID: ${id}`)
  try {
    const source = await prisma.source.findUnique({ where: { id } })
    if (source) {
      logger.debug(`✅ Source found: ${id}`)
    } else {
      logger.debug(`Source not found: ${id}`)
    }
    return source
  } catch (error) {
    logger.error(`❌ Failed to fetch source: ${error}`)
    throw error
  }
}

export async function deleteSource(id: string): Promise<SourceResponse> {
  logger.debug(`Deleting source: ${id}`)
  try {
    const source = await prisma.source.delete({ where: { id } })
    logger.info(`✅ Source deleted: ${id}`)
    return source
  } catch (error) {
    logger.error(`❌ Failed to delete source: ${error}`)
    throw error
  }
}
