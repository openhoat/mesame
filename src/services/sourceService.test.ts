import { beforeEach, describe, expect, test, vi } from 'vitest'
import { prisma } from '../db.js'
import { createSource, deleteSource, getAllSources, getSourceById } from './sourceService.js'

vi.mock('../db.js', () => ({
  prisma: {
    source: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

describe('sourceService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createSource', () => {
    test('should create a source with title and content', async () => {
      const data = { title: 'Test Document', content: 'Hello world' }
      const expected = { id: 'uuid-1', ...data, createdAt: new Date() }
      vi.mocked(prisma.source.create).mockResolvedValueOnce(expected)

      const result = await createSource(data)

      expect(result).toEqual(expected)
      expect(prisma.source.create).toHaveBeenCalledWith({ data })
    })
  })

  describe('getAllSources', () => {
    test('should return all sources ordered by creation date', async () => {
      const sources = [
        { id: 'uuid-2', title: 'Newer', content: 'b', createdAt: new Date('2026-01-02') },
        { id: 'uuid-1', title: 'Older', content: 'a', createdAt: new Date('2026-01-01') },
      ]
      vi.mocked(prisma.source.findMany).mockResolvedValueOnce(sources)

      const result = await getAllSources()

      expect(result).toEqual(sources)
      expect(prisma.source.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } })
    })

    test('should return empty array when no sources exist', async () => {
      vi.mocked(prisma.source.findMany).mockResolvedValueOnce([])

      const result = await getAllSources()

      expect(result).toEqual([])
    })
  })

  describe('getSourceById', () => {
    test('should return a source when found', async () => {
      const source = { id: 'uuid-1', title: 'Doc', content: 'text', createdAt: new Date() }
      vi.mocked(prisma.source.findUnique).mockResolvedValueOnce(source)

      const result = await getSourceById('uuid-1')

      expect(result).toEqual(source)
      expect(prisma.source.findUnique).toHaveBeenCalledWith({ where: { id: 'uuid-1' } })
    })

    test('should return null when source not found', async () => {
      vi.mocked(prisma.source.findUnique).mockResolvedValueOnce(null)

      const result = await getSourceById('nonexistent')

      expect(result).toBeNull()
    })
  })

  describe('deleteSource', () => {
    test('should delete a source by id', async () => {
      const source = { id: 'uuid-1', title: 'Doc', content: 'text', createdAt: new Date() }
      vi.mocked(prisma.source.delete).mockResolvedValueOnce(source)

      const result = await deleteSource('uuid-1')

      expect(result).toEqual(source)
      expect(prisma.source.delete).toHaveBeenCalledWith({ where: { id: 'uuid-1' } })
    })
  })
})
