import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { buildApp } from '../app.js'
import { resetConfig } from '../config.js'

// Mock the source service
vi.mock('../services/sourceService.js', () => ({
  createSource: vi.fn(),
  getAllSources: vi.fn(),
  getSourceById: vi.fn(),
  deleteSource: vi.fn(),
}))

// Mock the style profile service (required by proxy route)
vi.mock('../services/styleProfileService.js', () => ({
  getActiveStyleProfile: vi.fn().mockResolvedValue(null),
}))

// Mock file parser
vi.mock('../services/fileParser.js', () => ({
  isSupportedFile: vi.fn(),
  extractText: vi.fn(),
  deriveTitleFromFilename: vi.fn(),
}))

// Import mocked modules after vi.mock
const { createSource, getAllSources, getSourceById, deleteSource } = await import(
  '../services/sourceService.js'
)
const { isSupportedFile, extractText, deriveTitleFromFilename } = await import(
  '../services/fileParser.js'
)

describe('sources route', () => {
  let app: Awaited<ReturnType<typeof buildApp>>

  beforeEach(async () => {
    vi.clearAllMocks()
    resetConfig()
    app = await buildApp()
  })

  afterEach(async () => {
    await app.close()
  })

  describe('POST /v1/sources', () => {
    test('should create a source from JSON body', async () => {
      const source = {
        id: 'uuid-1',
        title: 'Test',
        content: 'Hello',
        createdAt: new Date().toISOString(),
      }
      vi.mocked(createSource).mockResolvedValueOnce(source as never)

      const response = await app.inject({
        method: 'POST',
        url: '/v1/sources',
        payload: { title: 'Test', content: 'Hello' },
      })

      expect(response.statusCode).toBe(201)
      expect(response.json()).toEqual(source)
      expect(createSource).toHaveBeenCalledWith({ title: 'Test', content: 'Hello' })
    })

    test('should return 400 when title is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/sources',
        payload: { content: 'Hello' },
      })

      expect(response.statusCode).toBe(400)
      expect(response.json()).toEqual({ error: 'title and content are required' })
    })

    test('should return 400 when content is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/v1/sources',
        payload: { title: 'Test' },
      })

      expect(response.statusCode).toBe(400)
      expect(response.json()).toEqual({ error: 'title and content are required' })
    })
  })

  describe('GET /v1/sources', () => {
    test('should return all sources', async () => {
      const sources = [
        { id: 'uuid-1', title: 'Doc 1', content: 'a', createdAt: new Date().toISOString() },
        { id: 'uuid-2', title: 'Doc 2', content: 'b', createdAt: new Date().toISOString() },
      ]
      vi.mocked(getAllSources).mockResolvedValueOnce(sources as never)

      const response = await app.inject({
        method: 'GET',
        url: '/v1/sources',
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual(sources)
    })

    test('should return empty array when no sources exist', async () => {
      vi.mocked(getAllSources).mockResolvedValueOnce([] as never)

      const response = await app.inject({
        method: 'GET',
        url: '/v1/sources',
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual([])
    })
  })

  describe('GET /v1/sources/:id', () => {
    test('should return a source by id', async () => {
      const source = {
        id: 'uuid-1',
        title: 'Doc',
        content: 'text',
        createdAt: new Date().toISOString(),
      }
      vi.mocked(getSourceById).mockResolvedValueOnce(source as never)

      const response = await app.inject({
        method: 'GET',
        url: '/v1/sources/uuid-1',
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual(source)
    })

    test('should return 404 when source not found', async () => {
      vi.mocked(getSourceById).mockResolvedValueOnce(null as never)

      const response = await app.inject({
        method: 'GET',
        url: '/v1/sources/nonexistent',
      })

      expect(response.statusCode).toBe(404)
      expect(response.json()).toEqual({ error: 'Source not found' })
    })
  })

  describe('DELETE /v1/sources/:id', () => {
    test('should delete a source and return 204', async () => {
      const source = {
        id: 'uuid-1',
        title: 'Doc',
        content: 'text',
        createdAt: new Date().toISOString(),
      }
      vi.mocked(getSourceById).mockResolvedValueOnce(source as never)
      vi.mocked(deleteSource).mockResolvedValueOnce(source as never)

      const response = await app.inject({
        method: 'DELETE',
        url: '/v1/sources/uuid-1',
      })

      expect(response.statusCode).toBe(204)
    })

    test('should return 404 when deleting non-existent source', async () => {
      vi.mocked(getSourceById).mockResolvedValueOnce(null as never)

      const response = await app.inject({
        method: 'DELETE',
        url: '/v1/sources/nonexistent',
      })

      expect(response.statusCode).toBe(404)
      expect(response.json()).toEqual({ error: 'Source not found' })
    })
  })

  describe('POST /v1/sources/import', () => {
    test('should import a text file', async () => {
      vi.mocked(isSupportedFile).mockReturnValueOnce(true)
      vi.mocked(extractText).mockResolvedValueOnce('File content')
      vi.mocked(deriveTitleFromFilename).mockReturnValueOnce('test document')
      const source = {
        id: 'uuid-1',
        title: 'test document',
        content: 'File content',
        createdAt: new Date().toISOString(),
      }
      vi.mocked(createSource).mockResolvedValueOnce(source as never)

      const form = new FormData()
      form.append('file', new Blob(['File content'], { type: 'text/plain' }), 'test-document.txt')

      const response = await app.inject({
        method: 'POST',
        url: '/v1/sources/import',
        payload: form,
        headers: form instanceof FormData ? {} : { 'content-type': 'multipart/form-data' },
      })

      expect(response.statusCode).toBe(201)
      expect(response.json()).toEqual(source)
    })

    test('should reject unsupported file types', async () => {
      vi.mocked(isSupportedFile).mockReturnValueOnce(false)

      const form = new FormData()
      form.append('file', new Blob(['data'], { type: 'image/jpeg' }), 'photo.jpg')

      const response = await app.inject({
        method: 'POST',
        url: '/v1/sources/import',
        payload: form,
      })

      expect(response.statusCode).toBe(400)
      expect(response.json()).toEqual({
        error: 'Unsupported file type. Supported: .txt, .md, .pdf',
      })
    })
  })
})
