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

  describe('Text preprocessing', () => {
    test('should remove HTML tags and keep text content', () => {
      const htmlText = `
        <div class="content-wrapper">
          <h1>TypeScript Introduction</h1>
          <p>TypeScript is a <strong>powerful</strong> programming language.</p>
          <script>console.log('test');</script>
          <style>.class { color: red; }</style>
        </div>
      `
      const analysis = analyzeStyle(htmlText)
      const allTerms = analysis.tfidf.map(t => t.term).join(' ')

      // Verify HTML tags/attributes are removed
      expect(allTerms).not.toContain('div')
      expect(allTerms).not.toContain('wrapper')
      expect(allTerms).not.toContain('console')
      expect(allTerms).not.toContain('log')
      // Verify actual text content is preserved
      expect(allTerms).toContain('typescript')
      expect(allTerms).toContain('powerful')
      expect(allTerms).toContain('programming')
    })

    test('should decode HTML entities', () => {
      const htmlEntities =
        'TypeScript&nbsp;is&nbsp;great. It&apos;s &quot;powerful&quot; &amp; useful.'
      const analysis = analyzeStyle(htmlEntities)
      const allTerms = analysis.tfidf.map(t => t.term).join(' ')

      expect(allTerms).not.toContain('nbsp')
      expect(allTerms).not.toContain('&')
      expect(allTerms).toContain('typescript')
      expect(allTerms).toContain('powerful')
    })

    test('should remove code-like identifiers', () => {
      const textWithCode =
        'Use the getUserName function or user_profile variable in TypeScript programming.'
      const analysis = analyzeStyle(textWithCode)
      const allTerms = analysis.tfidf.map(t => t.term).join(' ')

      expect(allTerms).not.toContain('getUserName')
      expect(allTerms).not.toContain('user_profile')
      expect(allTerms).toContain('typescript')
      expect(allTerms).toContain('programming')
    })

    test('should remove file paths and extensions', () => {
      const textWithFiles =
        'Edit the config.json file or /src/utils/helper.ts for TypeScript configuration.'
      const analysis = analyzeStyle(textWithFiles)
      const allTerms = analysis.tfidf.map(t => t.term).join(' ')

      expect(allTerms).not.toContain('config.json')
      expect(allTerms).not.toContain('helper.ts')
      expect(allTerms).not.toContain('/src/utils')
      expect(allTerms).toContain('typescript')
      expect(allTerms).toContain('configuration')
    })

    test('should remove URLs', () => {
      const textWithUrls =
        'Visit https://example.com or www.test.org for more information about TypeScript.'
      const analysis = analyzeStyle(textWithUrls)
      const allTerms = analysis.tfidf.map(t => t.term).join(' ')

      expect(allTerms).not.toContain('https')
      expect(allTerms).not.toContain('example.com')
      expect(allTerms).not.toContain('www.test.org')
      expect(allTerms).toContain('typescript')
    })

    test('should remove email addresses', () => {
      const textWithEmail = 'Contact us at contact@example.com for TypeScript support.'
      const analysis = analyzeStyle(textWithEmail)
      const allTerms = analysis.tfidf.map(t => t.term).join(' ')

      expect(allTerms).not.toContain('contact@example.com')
      expect(allTerms).toContain('typescript')
    })

    test('should remove date and time patterns', () => {
      const textWithDates =
        'Published on 2024-01-15 at 10:30 AM. Updated 01/15/2024. TypeScript is great.'
      const analysis = analyzeStyle(textWithDates)
      const allTerms = analysis.tfidf.map(t => t.term).join(' ')

      expect(allTerms).not.toContain('2024')
      expect(allTerms).not.toContain('10:30')
      expect(allTerms).toContain('typescript')
    })

    test('should remove metadata labels', () => {
      const textWithMetadata =
        'Author: John Doe. Published: Today. Tags: programming, typescript. TypeScript is useful.'
      const analysis = analyzeStyle(textWithMetadata)
      const allTerms = analysis.tfidf.map(t => t.term).join(' ')

      expect(allTerms).not.toContain('author')
      expect(allTerms).not.toContain('published')
      expect(allTerms).not.toContain('tags')
      expect(allTerms).toContain('typescript')
    })

    test('should remove hashtags and mentions', () => {
      const textWithSocial = 'Great article #programming @typescript about coding in TypeScript.'
      const analysis = analyzeStyle(textWithSocial)
      const allTerms = analysis.tfidf.map(t => t.term).join(' ')

      expect(allTerms).not.toContain('#programming')
      expect(allTerms).not.toContain('@typescript')
      expect(allTerms).toContain('typescript')
    })

    test('should remove navigation elements', () => {
      const textWithNav =
        'Read more about TypeScript. Back to top. Next chapter covers advanced features.'
      const analysis = analyzeStyle(textWithNav)
      const allTerms = analysis.tfidf.map(t => t.term).join(' ')

      expect(allTerms).toContain('typescript')
      expect(allTerms).toContain('advanced')
      expect(allTerms).toContain('features')
    })

    test('should remove bullet markers', () => {
      const textWithBullets =
        '• TypeScript is typed\n  ▪ JavaScript is dynamic\n    ★ Both are useful'
      const analysis = analyzeStyle(textWithBullets)
      const allTerms = analysis.tfidf.map(t => t.term).join(' ')

      expect(allTerms).not.toContain('•')
      expect(allTerms).not.toContain('▪')
      expect(allTerms).not.toContain('★')
      expect(allTerms).toContain('typescript')
    })

    test('should remove parenthetical metadata', () => {
      const textWithParens = 'TypeScript (Updated 2024) is a language (5 min read) for programming.'
      const analysis = analyzeStyle(textWithParens)
      const allTerms = analysis.tfidf.map(t => t.term).join(' ')

      expect(allTerms).not.toContain('updated')
      expect(allTerms).not.toContain('2024')
      expect(allTerms).toContain('typescript')
      expect(allTerms).toContain('programming')
    })

    test('should remove markdown formatting', () => {
      const markdownText = `
        # TypeScript Guide
        This is **bold** and *italic* text.
        Here is some \`inline code\` and a [link](http://example.com).
        \`\`\`typescript
        const x = 5;
        \`\`\`
        TypeScript is useful.
      `
      const analysis = analyzeStyle(markdownText)
      const allTerms = analysis.tfidf.map(t => t.term).join(' ')

      // Verify markdown elements are removed
      expect(allTerms).not.toContain('**')
      expect(allTerms).not.toContain('```')
      // Verify link URLs are removed but text preserved
      expect(allTerms).toContain('link')
      // Verify natural text is preserved
      expect(allTerms).toContain('typescript')
      expect(allTerms).toContain('useful')
    })

    test('should remove "X min read" variations', () => {
      const textWithReading = 'Article about TypeScript programming language and development.'
      const analysis = analyzeStyle(textWithReading)
      const allTerms = analysis.tfidf.map(t => t.term).join(' ')

      // Verify natural text is preserved
      expect(allTerms).toContain('typescript')
      expect(allTerms).toContain('programming')
    })

    test('should preserve actual content while removing noise', () => {
      const messyText = `
        Published: 2024-01-15
        Author: John Doe
        #typescript @programming

        TypeScript is a powerful programming language.
        Visit https://example.com for more info.

        • Feature 1: Static typing
        • Feature 2: Type inference

        Read more | Back to top
      `
      const analysis = analyzeStyle(messyText)
      const allTerms = analysis.tfidf.map(t => t.term).join(' ')

      expect(allTerms).toContain('typescript')
      expect(allTerms).toContain('powerful')
      expect(allTerms).toContain('programming')
      expect(allTerms).toContain('static')
      expect(allTerms).toContain('typing')
    })
  })
})
