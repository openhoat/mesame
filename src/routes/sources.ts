import multipart from '@fastify/multipart'
import type { FastifyPluginAsync } from 'fastify'
import { deriveTitleFromFilename, extractText, isSupportedFile } from '../services/fileParser.js'
import {
  createSource,
  deleteSource,
  getAllSources,
  getSourceById,
} from '../services/sourceService.js'

interface CreateSourceBody {
  title: string
  content: string
}

interface SourceParams {
  id: string
}

export const sourcesRoute: FastifyPluginAsync = async app => {
  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB
    },
  })

  // Create a source from JSON
  app.post<{ Body: CreateSourceBody }>('/api/sources', async (request, reply) => {
    request.log.info('[Sources API] Creating new source...')
    const { title, content } = request.body

    if (!title || !content) {
      request.log.warn('[Sources API] Missing title or content')
      return reply.status(400).send({ error: 'title and content are required' })
    }

    try {
      const source = await createSource({ title, content })
      request.log.info(`[Sources API] ✅ Source created: ${source.id}`)
      return reply.status(201).send(source)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      request.log.error(`[Sources API] ❌ Failed to create source: ${errorMessage}`)
      throw error
    }
  })

  // Import a source from file upload
  app.post('/api/sources/import', async (request, reply) => {
    const file = await request.file()

    if (!file) {
      return reply.status(400).send({ error: 'No file uploaded' })
    }

    if (!isSupportedFile(file.filename, file.mimetype)) {
      return reply.status(400).send({
        error: 'Unsupported file type. Supported: .txt, .md, .pdf',
      })
    }

    const buffer = await file.toBuffer()
    const content = await extractText(buffer, file.filename, file.mimetype)

    if (!content.trim()) {
      return reply.status(400).send({ error: 'File is empty or contains no extractable text' })
    }

    const title = deriveTitleFromFilename(file.filename)
    const source = await createSource({ title, content })
    return reply.status(201).send(source)
  })

  // List all sources
  app.get('/api/sources', async request => {
    request.log.info('[Sources API] Fetching all sources...')
    try {
      const sources = await getAllSources()
      request.log.info(`[Sources API] ✅ Found ${sources.length} sources`)
      return sources
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      request.log.error(`[Sources API] ❌ Failed to fetch sources: ${errorMessage}`)
      throw error
    }
  })

  // Get a source by ID
  app.get<{ Params: SourceParams }>('/api/sources/:id', async (request, reply) => {
    const source = await getSourceById(request.params.id)

    if (!source) {
      return reply.status(404).send({ error: 'Source not found' })
    }

    return source
  })

  // Delete a source
  app.delete<{ Params: SourceParams }>('/api/sources/:id', async (request, reply) => {
    request.log.info(`[Sources API] Deleting source: ${request.params.id}`)
    const source = await getSourceById(request.params.id)

    if (!source) {
      request.log.warn(`[Sources API] Source not found: ${request.params.id}`)
      return reply.status(404).send({ error: 'Source not found' })
    }

    try {
      await deleteSource(request.params.id)
      request.log.info(`[Sources API] ✅ Source deleted: ${request.params.id}`)
      return reply.status(204).send()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      request.log.error(`[Sources API] ❌ Failed to delete source: ${errorMessage}`)
      throw error
    }
  })
}
