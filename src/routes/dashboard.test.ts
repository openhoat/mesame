import type { FastifyInstance } from 'fastify'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { buildApp } from '../app.js'
import * as logBufferModule from '../services/logBuffer.js'

// Mock styleProfileService (ensureDefaultProfile is called at app startup)
vi.mock('../services/styleProfileService.js', () => ({
  ensureDefaultProfile: vi.fn().mockResolvedValue(undefined),
}))

// Mock the logBuffer module
vi.mock('../services/logBuffer.js', () => ({
  logBuffer: {
    getRecent: vi.fn(),
    getAll: vi.fn(),
  },
}))

// Mock Prisma
vi.mock('../db.js', () => ({
  prisma: {
    conversation: {
      count: vi.fn(),
    },
    styleProfile: {
      count: vi.fn(),
    },
    $disconnect: vi.fn(),
  },
}))

describe('Dashboard Route', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    vi.clearAllMocks()
    app = await buildApp()
  })

  afterEach(async () => {
    await app.close()
  })

  describe('GET /api/stats', () => {
    test('should return dashboard statistics', async () => {
      // Mock database responses
      const { prisma } = await import('../db.js')
      vi.mocked(prisma.conversation.count).mockResolvedValueOnce(10)
      vi.mocked(prisma.styleProfile.count).mockResolvedValueOnce(2)

      // Mock logBuffer
      vi.mocked(logBufferModule.logBuffer.getRecent).mockReturnValue([])
      vi.mocked(logBufferModule.logBuffer.getAll).mockReturnValue([])

      const response = await app.inject({
        method: 'GET',
        url: '/api/stats',
      })

      expect(response.statusCode).toBe(200)
      const data = response.json()

      // Verify response structure
      expect(data).toHaveProperty('totalRequests')
      expect(data).toHaveProperty('activeProfiles')
      expect(data).toHaveProperty('avgResponseTime')
      expect(data).toHaveProperty('uptime')
      expect(data).toHaveProperty('recentActivity')

      // Verify types
      expect(typeof data.totalRequests).toBe('number')
      expect(typeof data.activeProfiles).toBe('number')
      expect(typeof data.avgResponseTime).toBe('number')
      expect(typeof data.uptime).toBe('string')
      expect(Array.isArray(data.recentActivity)).toBe(true)

      // Verify values
      expect(data.totalRequests).toBe(10)
      expect(data.activeProfiles).toBe(2)
    })

    test('should return uptime in correct format', async () => {
      const { prisma } = await import('../db.js')
      vi.mocked(prisma.conversation.count).mockResolvedValueOnce(0)
      vi.mocked(prisma.styleProfile.count).mockResolvedValueOnce(0)
      vi.mocked(logBufferModule.logBuffer.getRecent).mockReturnValue([])
      vi.mocked(logBufferModule.logBuffer.getAll).mockReturnValue([])

      const response = await app.inject({
        method: 'GET',
        url: '/api/stats',
      })

      const data = response.json()
      // Uptime should match format like "0h 0m" or "1h 30m"
      expect(data.uptime).toMatch(/^\d+h \d+m$/)
    })

    test('should return empty recentActivity when no logs', async () => {
      const { prisma } = await import('../db.js')
      vi.mocked(prisma.conversation.count).mockResolvedValueOnce(0)
      vi.mocked(prisma.styleProfile.count).mockResolvedValueOnce(0)
      vi.mocked(logBufferModule.logBuffer.getRecent).mockReturnValue([])
      vi.mocked(logBufferModule.logBuffer.getAll).mockReturnValue([])

      const response = await app.inject({
        method: 'GET',
        url: '/api/stats',
      })

      const data = response.json()
      expect(data.recentActivity).toBeDefined()
      expect(Array.isArray(data.recentActivity)).toBe(true)
      expect(data.recentActivity).toHaveLength(0)
    })

    test('should extract activity from logs', async () => {
      const { prisma } = await import('../db.js')
      vi.mocked(prisma.conversation.count).mockResolvedValueOnce(5)
      vi.mocked(prisma.styleProfile.count).mockResolvedValueOnce(1)

      // Mock logBuffer with activity
      vi.mocked(logBufferModule.logBuffer.getRecent).mockReturnValue([
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'proxy request with model gpt-4o',
        },
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'style profile updated',
        },
      ])
      vi.mocked(logBufferModule.logBuffer.getAll).mockReturnValue([])

      const response = await app.inject({
        method: 'GET',
        url: '/api/stats',
      })

      const data = response.json()
      expect(data.recentActivity).toBeDefined()
      expect(Array.isArray(data.recentActivity)).toBe(true)
    })
  })
})
