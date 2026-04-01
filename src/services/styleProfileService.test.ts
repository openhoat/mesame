import { beforeEach, describe, expect, test, vi } from 'vitest'
import { prisma } from '../db.js'
import * as styleAnalyzer from './styleAnalyzer.js'
import { createProfile, getActiveStyleProfile, regenerateProfile } from './styleProfileService.js'
import * as styleRefiner from './styleRefiner.js'

// Mock the dependencies
vi.mock('../db.js', () => ({
  prisma: {
    styleProfile: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      upsert: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      findMany: vi.fn(),
    },
    profileSource: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    source: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('./sourceService.js')
vi.mock('./styleAnalyzer.js')
vi.mock('./styleRefiner.js')

describe('styleProfileService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getActiveStyleProfile', () => {
    test('should return null when no profile exists', async () => {
      vi.mocked(prisma.styleProfile.findFirst).mockResolvedValueOnce(null)

      const result = await getActiveStyleProfile()

      expect(result).toBeNull()
      expect(prisma.styleProfile.findFirst).toHaveBeenCalledWith({
        where: { isActive: true },
      })
    })

    test('should return style profile when it exists', async () => {
      const mockProfile = {
        id: '1',
        name: 'Profile 1',
        personaPrompt: 'You are a helpful assistant.',
        metrics: '{}',
        isActive: true,
        updatedAt: new Date(),
        createdAt: new Date(),
      }

      vi.mocked(prisma.styleProfile.findFirst).mockResolvedValueOnce(mockProfile)

      const result = await getActiveStyleProfile()

      expect(result).toEqual({
        personaPrompt: 'You are a helpful assistant.',
      })
    })
  })

  describe('createProfile', () => {
    test('should create a new style profile from sources', async () => {
      const mockSources = [
        { id: 's1', title: 'Doc 1', content: 'Sample text one.', createdAt: new Date() },
      ]

      const mockAnalysis = {
        tfidf: [],
        bigrams: [{ gram: 'sample text', count: 2 }],
        trigrams: [],
        transitions: [],
        metrics: {
          sentenceCount: 1,
          wordCount: 3,
          averageSentenceLength: 3,
          lexicalRichness: 1,
          vocabularySize: 3,
          nounRatio: 0.3,
          verbRatio: 0.3,
          adjectiveRatio: 0.3,
          pronounFirstPersonRatio: 0,
          pronounSecondPersonRatio: 0,
          questionRatio: 0,
          exclamationRatio: 0,
        },
      }

      const mockPersonaPrompt = 'Narrative style prompt'
      const mockProfile = {
        id: 'p1',
        name: 'My Profile',
        personaPrompt: mockPersonaPrompt,
        metrics: JSON.stringify(mockAnalysis.metrics),
        isActive: false,
        updatedAt: new Date(),
        createdAt: new Date(),
        sources: [{ source: { id: 's1', title: 'Doc 1' } }],
      }

      vi.mocked(prisma.source.findMany).mockResolvedValueOnce(mockSources)
      vi.mocked(styleAnalyzer.analyzeStyle).mockReturnValueOnce(mockAnalysis)
      vi.mocked(styleRefiner.refineStyleAnalysis).mockResolvedValueOnce(mockPersonaPrompt)
      vi.mocked(prisma.styleProfile.create).mockResolvedValueOnce(mockProfile as any)

      const result = await createProfile('My Profile', ['s1'])

      expect(result.id).toBe('p1')
      expect(result.personaPrompt).toBe(mockPersonaPrompt)
      expect(styleRefiner.refineStyleAnalysis).toHaveBeenCalledWith(mockAnalysis, undefined)
    })
  })

  describe('regenerateProfile', () => {
    test('should regenerate an existing profile', async () => {
      const mockProfileWithSources = {
        id: 'p1',
        name: 'My Profile',
        sources: [{ source: { id: 's1', content: 'Source content' } }],
      }

      const mockAnalysis = {
        metrics: {},
        bigrams: [],
        trigrams: [],
        transitions: [],
      }

      vi.mocked(prisma.styleProfile.findUnique).mockResolvedValueOnce(mockProfileWithSources as any)
      vi.mocked(styleAnalyzer.analyzeStyle).mockReturnValueOnce(mockAnalysis as any)
      vi.mocked(styleRefiner.refineStyleAnalysis).mockResolvedValueOnce('New Prompt')
      vi.mocked(prisma.styleProfile.update).mockResolvedValueOnce({
        id: 'p1',
        name: 'My Profile',
        personaPrompt: 'New Prompt',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        sources: [],
      } as any)

      const result = await regenerateProfile('p1')
      expect(result.personaPrompt).toBe('New Prompt')
      expect(styleRefiner.refineStyleAnalysis).toHaveBeenCalled()
    })
  })
})
