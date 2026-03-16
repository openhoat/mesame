import { beforeEach, describe, expect, test, vi } from 'vitest'
import { prisma } from '../db.js'
import { getActiveStyleProfile } from './styleProfileService.js'

// Mock the prisma module
vi.mock('../db.js', () => ({
  prisma: {
    styleProfile: {
      findUnique: vi.fn(),
    },
  },
}))

describe('styleProfileService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getActiveStyleProfile', () => {
    test('should return null when no profile exists', async () => {
      vi.mocked(prisma.styleProfile.findUnique).mockResolvedValueOnce(null)

      const result = await getActiveStyleProfile()

      expect(result).toBeNull()
      expect(prisma.styleProfile.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      })
    })

    test('should return style profile when it exists', async () => {
      const mockProfile = {
        id: 1,
        personaPrompt: 'You are a helpful assistant.',
        metrics: '{}',
        updatedAt: new Date(),
      }

      vi.mocked(prisma.styleProfile.findUnique).mockResolvedValueOnce(mockProfile)

      const result = await getActiveStyleProfile()

      expect(result).toEqual({
        personaPrompt: 'You are a helpful assistant.',
      })
    })

    test('should return null when personaPrompt is empty', async () => {
      const mockProfile = {
        id: 1,
        personaPrompt: '',
        metrics: '{}',
        updatedAt: new Date(),
      }

      vi.mocked(prisma.styleProfile.findUnique).mockResolvedValueOnce(mockProfile)

      const result = await getActiveStyleProfile()

      expect(result).toEqual({ personaPrompt: '' })
    })

    test('should handle complex personaPrompt', async () => {
      const complexPrompt = `Tu es un assistant IA qui répond dans un style technique et précis.

Tes réponses doivent être:
1. Structurées avec des titres
2. Concises mais informatives
3. Axées sur des exemples concrets`

      const mockProfile = {
        id: 1,
        personaPrompt: complexPrompt,
        metrics: '{}',
        updatedAt: new Date(),
      }

      vi.mocked(prisma.styleProfile.findUnique).mockResolvedValueOnce(mockProfile)

      const result = await getActiveStyleProfile()

      expect(result).toEqual({
        personaPrompt: complexPrompt,
      })
    })
  })
})
