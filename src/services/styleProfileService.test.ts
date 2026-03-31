import { beforeEach, describe, expect, test, vi } from 'vitest'
import { prisma } from '../db.js'
import * as sourceService from './sourceService.js'
import * as styleAnalyzer from './styleAnalyzer.js'
import {
  generateStyleProfile,
  getActiveStyleProfile,
  saveStyleProfile,
} from './styleProfileService.js'
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

  describe('saveStyleProfile', () => {
    test('should save a new style profile', async () => {
      const personaPrompt = 'You are MeSame'
      const metrics = '{"averageSentenceLength": 15}'
      const mockProfile = {
        id: '1',
        name: 'Default',
        personaPrompt,
        metrics,
        isActive: true,
        updatedAt: new Date(),
        createdAt: new Date(),
      }

      vi.mocked(prisma.styleProfile.upsert).mockResolvedValueOnce(mockProfile)

      const result = await saveStyleProfile(personaPrompt, metrics)

      expect(result).toEqual({ personaPrompt })
      expect(prisma.styleProfile.upsert).toHaveBeenCalledWith({
        where: { id: 1 },
        create: { personaPrompt, metrics },
        update: { personaPrompt, metrics },
      })
    })
  })

  describe('generateStyleProfile', () => {
    test('should generate style profile from sources', async () => {
      const mockSources = [
        { id: '1', title: 'Doc 1', content: 'Sample text one.', createdAt: new Date() },
        { id: '2', title: 'Doc 2', content: 'Sample text two.', createdAt: new Date() },
      ]

      const mockAnalysis = {
        tfidf: [],
        bigrams: [{ gram: 'sample text', count: 2 }],
        trigrams: [{ gram: 'sample text one', count: 1 }],
        transitions: [],
        metrics: {
          sentenceCount: 2,
          wordCount: 6,
          averageSentenceLength: 3,
          lexicalRichness: 0.8,
          vocabularySize: 5,
          nounRatio: 0.5,
          verbRatio: 0.3,
          adjectiveRatio: 0.2,
          pronounFirstPersonRatio: 0.1,
          pronounSecondPersonRatio: 0.1,
          questionRatio: 0.1,
          exclamationRatio: 0.1,
        },
      }

      const mockPersonaPrompt = 'You are MeSame, mirroring user style.'

      const mockProfile = {
        id: '1',
        name: 'Default',
        personaPrompt: mockPersonaPrompt,
        metrics: JSON.stringify(mockAnalysis.metrics),
        isActive: true,
        updatedAt: new Date(),
        createdAt: new Date(),
      }

      vi.mocked(sourceService.getAllSources).mockResolvedValueOnce(mockSources)
      vi.mocked(styleAnalyzer.analyzeStyle).mockReturnValueOnce(mockAnalysis)
      vi.mocked(styleRefiner.refineStyleAnalysis).mockResolvedValueOnce(mockPersonaPrompt)
      vi.mocked(prisma.styleProfile.upsert).mockResolvedValueOnce(mockProfile)

      const result = await generateStyleProfile()

      expect(result).toEqual({ personaPrompt: mockPersonaPrompt })
      expect(sourceService.getAllSources).toHaveBeenCalled()
      expect(styleAnalyzer.analyzeStyle).toHaveBeenCalledWith(
        'Sample text one.\n\nSample text two.'
      )
      expect(styleRefiner.refineStyleAnalysis).toHaveBeenCalledWith(mockAnalysis)
    })

    test('should throw error when no sources available', async () => {
      vi.mocked(sourceService.getAllSources).mockResolvedValueOnce([])

      await expect(generateStyleProfile()).rejects.toThrow(
        'No sources available for style analysis'
      )
    })
  })
})
