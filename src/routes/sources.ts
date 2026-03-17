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
  app.post<{ Body: CreateSourceBody }>('/v1/sources', async (request, reply) => {
    const { title, content } = request.body

    if (!title || !content) {
      return reply.status(400).send({ error: 'title and content are required' })
    }

    const source = await createSource({ title, content })
    return reply.status(201).send(source)
  })

  // Import a source from file upload
  app.post('/v1/sources/import', async (request, reply) => {
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
  app.get('/v1/sources', async () => {
    return getAllSources()
  })

  // Get a source by ID
  app.get<{ Params: SourceParams }>('/v1/sources/:id', async (request, reply) => {
    const source = await getSourceById(request.params.id)

    if (!source) {
      return reply.status(404).send({ error: 'Source not found' })
    }

    return source
  })

  // Delete a source
  app.delete<{ Params: SourceParams }>('/v1/sources/:id', async (request, reply) => {
    const source = await getSourceById(request.params.id)

    if (!source) {
      return reply.status(404).send({ error: 'Source not found' })
    }

    await deleteSource(request.params.id)
    return reply.status(204).send()
  })
}
