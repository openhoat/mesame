import { describe, expect, test } from 'vitest'
import type { StyleAnalysis } from './styleAnalyzer.js'
import { analyzeStyle } from './styleAnalyzer.js'

const SAMPLE_TEXT = `This approach is strongly oriented toward elegant solutions.
It provides flexible and reliable results for complex projects.
The method is designed for extreme efficiency and remarkable performance.
Many people prefer this because it helps achieve results quickly and effectively.
The system supports various features while adding powerful capabilities.
It is very efficient, reliable, and extremely flexible.`

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
    test('should return empty tfidf to avoid thematic noise', () => {
      analysis = analyzeStyle(SAMPLE_TEXT)
      expect(analysis.tfidf).toEqual([])
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

      expect(analysis.metrics.sentenceCount).toBe(6)
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

  describe('Text preprocessing', () => {
    test('should remove HTML tags and keep text content', () => {
      const htmlText = `
        <div class="content-wrapper">
          <h1>Introduction</h1>
          <p>This approach is <strong>powerful</strong> and <strong>efficient</strong>.</p>
          <script>console.log('test');</script>
          <style>.class { color: red; }</style>
        </div>
      `
      const analysis = analyzeStyle(htmlText)
      const allExpressions = analysis.bigrams.map(b => b.gram).join(' ')

      // Verify HTML tags/attributes are removed
      expect(allExpressions).not.toContain('div')
      expect(allExpressions).not.toContain('wrapper')
      expect(allExpressions).not.toContain('console')
      expect(allExpressions).not.toContain('log')
      // Verify actual text content is preserved in expressions
      expect(allExpressions).toContain('powerful')
      expect(allExpressions).toContain('efficient')
    })

    test('should decode HTML entities', () => {
      const htmlEntities = 'This&nbsp;is&nbsp;great. It\'s "powerful" & useful.'
      const analysis = analyzeStyle(htmlEntities)
      const allExpressions = analysis.bigrams.map(b => b.gram).join(' ')

      expect(allExpressions).not.toContain('nbsp')
      expect(allExpressions).not.toContain('&')
      expect(allExpressions).toContain('great')
      expect(allExpressions).toContain('powerful')
    })

    test('should remove code-like identifiers', () => {
      const textWithCode =
        'Use the getUserName function or user_profile variable. This is powerful programming.'
      const analysis = analyzeStyle(textWithCode)
      const allExpressions = analysis.bigrams.map(b => b.gram).join(' ')

      expect(allExpressions).not.toContain('getUserName')
      expect(allExpressions).not.toContain('user_profile')
      expect(allExpressions).toContain('powerful')
    })

    test('should remove URLs', () => {
      const textWithUrls =
        'Visit https://example.com or www.test.org for more information. This is very useful.'
      const analysis = analyzeStyle(textWithUrls)
      const allExpressions = analysis.bigrams.map(b => b.gram).join(' ')

      expect(allExpressions).not.toContain('https')
      expect(allExpressions).not.toContain('example.com')
      expect(allExpressions).not.toContain('www.test.org')
      expect(allExpressions).toContain('useful')
    })

    test('should remove date and time patterns', () => {
      const textWithDates =
        'Published on 2024-01-15 at 10:30 AM. Updated 01/15/2024. This is great and remarkable.'
      const analysis = analyzeStyle(textWithDates)
      const allExpressions = analysis.bigrams.map(b => b.gram).join(' ')

      expect(allExpressions).not.toContain('2024')
      expect(allExpressions).not.toContain('10:30')
      expect(allExpressions).toContain('great')
    })

    test('should remove markdown formatting', () => {
      const markdownText = `
        # Guide
        This is **bold** and *italic* text.
        Here is some \`inline code\` and a [link](http://example.com).
        \`\`\`typescript
        const x = 5;
        \`\`\`
        This is very useful and elegant.
      `
      const analysis = analyzeStyle(markdownText)
      const allExpressions = analysis.bigrams.map(b => b.gram).join(' ')

      // Verify markdown elements are removed
      expect(allExpressions).not.toContain('**')
      expect(allExpressions).not.toContain('```')
      // Verify natural text is preserved
      expect(allExpressions).toContain('useful')
      expect(allExpressions).toContain('elegant')
    })
  })
})
