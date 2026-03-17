import { describe, expect, test } from 'vitest'
import type { StyleAnalysis } from './styleAnalyzer.js'
import { analyzeStyle } from './styleAnalyzer.js'

const SAMPLE_TEXT = `TypeScript is a strongly typed programming language that builds on JavaScript.
It provides optional static typing and class-based object-oriented programming.
TypeScript is designed for the development of large applications and transpiles to JavaScript.
Many developers prefer TypeScript because it helps catch errors early during development.
The language supports modern JavaScript features while adding powerful type checking capabilities.`

describe('styleAnalyzer', () => {
  let analysis: StyleAnalysis

  test('should return a complete analysis object', () => {
    analysis = analyzeStyle(SAMPLE_TEXT)

    expect(analysis).toHaveProperty('tfidf')
    expect(analysis).toHaveProperty('bigrams')
    expect(analysis).toHaveProperty('trigrams')
    expect(analysis).toHaveProperty('metrics')
  })

  describe('TF-IDF analysis', () => {
    test('should extract relevant terms with scores', () => {
      analysis = analyzeStyle(SAMPLE_TEXT)

      expect(analysis.tfidf.length).toBeGreaterThan(0)
      expect(analysis.tfidf[0]).toHaveProperty('term')
      expect(analysis.tfidf[0]).toHaveProperty('score')
      expect(analysis.tfidf[0]!.score).toBeGreaterThan(0)
    })

    test('should rank terms by relevance', () => {
      analysis = analyzeStyle(SAMPLE_TEXT)

      for (let i = 1; i < analysis.tfidf.length; i++) {
        expect(analysis.tfidf[i]!.score).toBeLessThanOrEqual(analysis.tfidf[i - 1]!.score)
      }
    })

    test('should include key terms from the text', () => {
      analysis = analyzeStyle(SAMPLE_TEXT)
      const terms = analysis.tfidf.map(t => t.term)

      expect(terms).toContain('typescript')
    })
  })

  describe('N-Grams analysis', () => {
    test('should extract bigrams with counts', () => {
      analysis = analyzeStyle(SAMPLE_TEXT)

      expect(analysis.bigrams.length).toBeGreaterThan(0)
      expect(analysis.bigrams[0]).toHaveProperty('gram')
      expect(analysis.bigrams[0]).toHaveProperty('count')
      expect(analysis.bigrams[0]!.count).toBeGreaterThanOrEqual(1)
    })

    test('should extract trigrams with counts', () => {
      analysis = analyzeStyle(SAMPLE_TEXT)

      expect(analysis.trigrams.length).toBeGreaterThan(0)
      expect(analysis.trigrams[0]).toHaveProperty('gram')
      expect(analysis.trigrams[0]).toHaveProperty('count')
    })

    test('should rank bigrams by frequency', () => {
      analysis = analyzeStyle(SAMPLE_TEXT)

      for (let i = 1; i < analysis.bigrams.length; i++) {
        expect(analysis.bigrams[i]!.count).toBeLessThanOrEqual(analysis.bigrams[i - 1]!.count)
      }
    })

    test('should return empty arrays for very short text', () => {
      const shortAnalysis = analyzeStyle('Hi')

      expect(shortAnalysis.bigrams).toEqual([])
      expect(shortAnalysis.trigrams).toEqual([])
    })
  })

  describe('linguistic metrics', () => {
    test('should compute sentence count', () => {
      analysis = analyzeStyle(SAMPLE_TEXT)

      expect(analysis.metrics.sentenceCount).toBe(5)
    })

    test('should compute word count', () => {
      analysis = analyzeStyle(SAMPLE_TEXT)

      expect(analysis.metrics.wordCount).toBeGreaterThan(30)
    })

    test('should compute average sentence length', () => {
      analysis = analyzeStyle(SAMPLE_TEXT)

      expect(analysis.metrics.averageSentenceLength).toBeGreaterThan(5)
      expect(analysis.metrics.averageSentenceLength).toBeLessThan(30)
    })

    test('should compute lexical richness between 0 and 1', () => {
      analysis = analyzeStyle(SAMPLE_TEXT)

      expect(analysis.metrics.lexicalRichness).toBeGreaterThan(0)
      expect(analysis.metrics.lexicalRichness).toBeLessThanOrEqual(1)
    })

    test('should compute vocabulary size', () => {
      analysis = analyzeStyle(SAMPLE_TEXT)

      expect(analysis.metrics.vocabularySize).toBeGreaterThan(0)
      expect(analysis.metrics.vocabularySize).toBeLessThanOrEqual(analysis.metrics.wordCount)
    })

    test('should compute POS ratios between 0 and 1', () => {
      analysis = analyzeStyle(SAMPLE_TEXT)

      expect(analysis.metrics.nounRatio).toBeGreaterThanOrEqual(0)
      expect(analysis.metrics.nounRatio).toBeLessThanOrEqual(1)
      expect(analysis.metrics.verbRatio).toBeGreaterThanOrEqual(0)
      expect(analysis.metrics.verbRatio).toBeLessThanOrEqual(1)
      expect(analysis.metrics.adjectiveRatio).toBeGreaterThanOrEqual(0)
      expect(analysis.metrics.adjectiveRatio).toBeLessThanOrEqual(1)
    })

    test('should handle single sentence text', () => {
      const singleAnalysis = analyzeStyle('This is a simple test sentence.')

      expect(singleAnalysis.metrics.sentenceCount).toBe(1)
      expect(singleAnalysis.metrics.averageSentenceLength).toBe(singleAnalysis.metrics.wordCount)
    })
  })
})
