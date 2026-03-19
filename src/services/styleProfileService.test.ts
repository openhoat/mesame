import { beforeEach, describe, expect, test, vi } from 'vitest'
import { prisma } from '../db.js'
import * as personaPromptGenerator from './personaPromptGenerator.js'
import * as sourceService from './sourceService.js'
import * as styleAnalyzer from './styleAnalyzer.js'
import {
  generateStyleProfile,
  getActiveStyleProfile,
  saveStyleProfile,
} from './styleProfileService.js'

// Mock the dependencies
vi.mock('../db.js', () => ({
  prisma: {
    styleProfile: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}))

vi.mock('./sourceService.js')
vi.mock('./styleAnalyzer.js')
vi.mock('./personaPromptGenerator.js')

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

  describe('saveStyleProfile', () => {
    test('should save a new style profile', async () => {
      const personaPrompt = 'You are MeSame'
      const metrics = '{"averageSentenceLength": 15}'
      const mockProfile = {
        id: 1,
        personaPrompt,
        metrics,
        updatedAt: new Date(),
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
        tfidf: [{ term: 'sample', score: 0.9 }],
        bigrams: [{ gram: 'sample text', count: 2 }],
        trigrams: [{ gram: 'sample text one', count: 1 }],
        metrics: {
          sentenceCount: 2,
          wordCount: 6,
          averageSentenceLength: 3,
          lexicalRichness: 0.8,
          vocabularySize: 5,
          nounRatio: 0.5,
          verbRatio: 0.3,
          adjectiveRatio: 0.2,
        },
      }

      const mockPersonaPrompt = 'You are MeSame, mirroring user style.'

      const mockProfile = {
        id: 1,
        personaPrompt: mockPersonaPrompt,
        metrics: JSON.stringify(mockAnalysis.metrics),
        updatedAt: new Date(),
      }

      vi.mocked(sourceService.getAllSources).mockResolvedValueOnce(mockSources)
      vi.mocked(styleAnalyzer.analyzeStyle).mockReturnValueOnce(mockAnalysis)
      vi.mocked(personaPromptGenerator.generatePersonaPrompt).mockReturnValueOnce(mockPersonaPrompt)
      vi.mocked(prisma.styleProfile.upsert).mockResolvedValueOnce(mockProfile)

      const result = await generateStyleProfile()

      expect(result).toEqual({ personaPrompt: mockPersonaPrompt })
      expect(sourceService.getAllSources).toHaveBeenCalled()
      expect(styleAnalyzer.analyzeStyle).toHaveBeenCalledWith(
        'Sample text one.\n\nSample text two.'
      )
      expect(personaPromptGenerator.generatePersonaPrompt).toHaveBeenCalledWith(mockAnalysis)
    })

    test('should throw error when no sources available', async () => {
      vi.mocked(sourceService.getAllSources).mockResolvedValueOnce([])

      await expect(generateStyleProfile()).rejects.toThrow(
        'No sources available for style analysis'
      )
    })
  })
})
