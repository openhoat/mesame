import { describe, expect, test } from 'vitest'
import { generatePersonaPrompt } from './personaPromptGenerator.js'
import type { StyleAnalysis } from './styleAnalyzer.js'

function createAnalysis(overrides: Partial<StyleAnalysis> = {}): StyleAnalysis {
  return {
    tfidf: [
      { term: 'typescript', score: 5 },
      { term: 'programming', score: 4 },
      { term: 'development', score: 3 },
      { term: 'language', score: 2.5 },
      { term: 'features', score: 2 },
      { term: 'code', score: 1.5 },
    ],
    bigrams: [
      { gram: 'object oriented', count: 3 },
      { gram: 'type checking', count: 2 },
      { gram: 'static typing', count: 2 },
      { gram: 'large applications', count: 1 },
    ],
    trigrams: [{ gram: 'class based object', count: 2 }],
    metrics: {
      sentenceCount: 5,
      wordCount: 50,
      averageSentenceLength: 15,
      lexicalRichness: 0.6,
      vocabularySize: 30,
      nounRatio: 0.25,
      verbRatio: 0.15,
      adjectiveRatio: 0.08,
    },
    ...overrides,
  }
}

describe('personaPromptGenerator', () => {
  test('should generate a non-empty persona prompt', () => {
    const prompt = generatePersonaPrompt(createAnalysis())

    expect(prompt).toBeTruthy()
    expect(prompt.length).toBeGreaterThan(50)
  })

  test('should include the MeSame introduction', () => {
    const prompt = generatePersonaPrompt(createAnalysis())

    expect(prompt).toContain('MeSame')
    expect(prompt).toContain('style preferences')
  })

  describe('sentence style', () => {
    test('should recommend short sentences for low average length', () => {
      const prompt = generatePersonaPrompt(
        createAnalysis({
          metrics: { ...createAnalysis().metrics, averageSentenceLength: 8 },
        })
      )

      expect(prompt).toContain('short')
    })

    test('should recommend moderate sentences for medium average length', () => {
      const prompt = generatePersonaPrompt(
        createAnalysis({
          metrics: { ...createAnalysis().metrics, averageSentenceLength: 15 },
        })
      )

      expect(prompt).toContain('moderate')
    })

    test('should recommend longer sentences for high average length', () => {
      const prompt = generatePersonaPrompt(
        createAnalysis({
          metrics: { ...createAnalysis().metrics, averageSentenceLength: 25 },
        })
      )

      expect(prompt).toContain('develop ideas more fully')
    })
  })

  describe('vocabulary style', () => {
    test('should recommend rich vocabulary for high lexical richness', () => {
      const prompt = generatePersonaPrompt(
        createAnalysis({
          metrics: { ...createAnalysis().metrics, lexicalRichness: 0.8 },
        })
      )

      expect(prompt).toContain('varied')
    })

    test('should recommend balanced vocabulary for moderate richness', () => {
      const prompt = generatePersonaPrompt(
        createAnalysis({
          metrics: { ...createAnalysis().metrics, lexicalRichness: 0.5 },
        })
      )

      expect(prompt).toContain('balanced')
    })

    test('should recommend simple vocabulary for low richness', () => {
      const prompt = generatePersonaPrompt(
        createAnalysis({
          metrics: { ...createAnalysis().metrics, lexicalRichness: 0.3 },
        })
      )

      expect(prompt).toContain('straightforward')
    })
  })

  describe('tone profile', () => {
    test('should detect descriptive tone from high adjective ratio', () => {
      const prompt = generatePersonaPrompt(
        createAnalysis({
          metrics: {
            ...createAnalysis().metrics,
            adjectiveRatio: 0.15,
            nounRatio: 0.1,
            verbRatio: 0.1,
          },
        })
      )

      expect(prompt).toContain('descriptive')
    })

    test('should detect factual tone from high noun ratio', () => {
      const prompt = generatePersonaPrompt(
        createAnalysis({
          metrics: {
            ...createAnalysis().metrics,
            nounRatio: 0.35,
            verbRatio: 0.1,
            adjectiveRatio: 0.05,
          },
        })
      )

      expect(prompt).toContain('factual')
    })

    test('should detect action-oriented tone from high verb ratio', () => {
      const prompt = generatePersonaPrompt(
        createAnalysis({
          metrics: {
            ...createAnalysis().metrics,
            verbRatio: 0.25,
            nounRatio: 0.1,
            adjectiveRatio: 0.05,
          },
        })
      )

      expect(prompt).toContain('action-oriented')
    })

    test('should default to neutral tone when no trait is dominant', () => {
      const prompt = generatePersonaPrompt(
        createAnalysis({
          metrics: {
            ...createAnalysis().metrics,
            nounRatio: 0.1,
            verbRatio: 0.1,
            adjectiveRatio: 0.05,
          },
        })
      )

      expect(prompt).toContain('neutral')
    })
  })

  describe('style priority and context constraints', () => {
    test('should include subtle style priority instructions', () => {
      const prompt = generatePersonaPrompt(createAnalysis())

      expect(prompt).toContain('light touches')
      expect(prompt).toContain('natural and helpful')
    })

    test('should present style as preferences not strict rules', () => {
      const prompt = generatePersonaPrompt(createAnalysis())

      expect(prompt).toContain('subtle style preferences')
      expect(prompt).toContain('prioritize clarity and accuracy')
    })

    test('should not include language instruction', () => {
      const prompt = generatePersonaPrompt(createAnalysis())

      // Style profile should NOT contain language instruction
      expect(prompt).not.toContain('Language:')
      expect(prompt).not.toContain('MUST respond')
    })
  })
})
