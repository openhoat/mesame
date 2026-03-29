import nlp from 'compromise'
import natural from 'natural'

export interface TfIdfTerm {
  term: string
  score: number
}

export interface NGramEntry {
  gram: string
  count: number
}

export interface LinguisticMetrics {
  sentenceCount: number
  wordCount: number
  averageSentenceLength: number
  lexicalRichness: number
  vocabularySize: number
  nounRatio: number
  verbRatio: number
  adjectiveRatio: number
}

export interface StyleAnalysis {
  tfidf: TfIdfTerm[]
  bigrams: NGramEntry[]
  trigrams: NGramEntry[]
  metrics: LinguisticMetrics
}

/**
 * Clean text noise that doesn't contribute to writing style analysis
 * Removes HTML, metadata, navigation elements, special characters, and structural noise
 * Keeps only natural language text from sentences
 */
function preprocessText(text: string): string {
  return (
    text
      // Remove HTML/XML comments
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '')
      // Remove script and style tags with their content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      // Remove all HTML tags (including attributes)
      .replace(/<[^>]+>/g, ' ')
      // Decode common HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&#?\w+;/g, '')
      // Remove CSS class names and IDs (leftover from attribute stripping)
      .replace(/\b(class|id|style|data-[\w-]+)[\s]*=[\s]*["'][^"']*["']/gi, '')
      // Remove URLs (any protocol)
      .replace(/\b(?:https?|ftp|file):\/\/[^\s]+/gi, '')
      .replace(/\bwww\.[^\s]+/gi, '')
      // Remove email addresses
      .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, '')
      // Remove common date/time patterns
      .replace(/\b\d{1,2}[/:.-]\d{1,2}[/:.-]\d{2,4}\b/g, '')
      .replace(/\b\d{4}[/:.-]\d{1,2}[/:.-]\d{1,2}\b/g, '')
      .replace(/\b\d{1,2}:\d{2}(:\d{2})?\s*(AM|PM|am|pm)?\b/gi, '')
      // Remove standalone numbers (page numbers, IDs, etc.) but keep numbers in context
      .replace(/\b\d+\s*$/gm, '')
      .replace(/^\s*\d+\b/gm, '')
      // Remove common metadata labels
      .replace(/\b(updated|published|posted|created|modified|edited)[\s:]+[\w\s,]+/gi, '')
      .replace(/\b(author|written by|by|posted by|created by|editor)[\s:]+[\w\s]+/gi, '')
      .replace(/\b(tags?|categories|filed under|reading time)[\s:]+[\w\s,]+/gi, '')
      // Remove hashtags and @mentions
      .replace(/#\w+/g, '')
      .replace(/@\w+/g, '')
      // Remove repeated special characters (e.g., "---", "***", "===")
      .replace(/([*_\-=~`]){3,}/g, '')
      // Remove common navigation/structural elements
      .replace(
        /\b(next|previous|back to top|read more|continue reading|share|tweet|comment)\b/gi,
        ''
      )
      // Remove bullet point markers at line starts
      .replace(/^[\s]*[•·▪▫■□★☆→►▸◆◇○●◉◎⦿⦾]*[\s]*/gm, '')
      // Remove parenthetical metadata (e.g., "(Updated 2024)", "(5 min)")
      .replace(/\([^)]*\d{4}[^)]*\)/g, '')
      .replace(/\([^)]*\d+\s*(min|minute|hour|page|chapter)[^)]*\)/gi, '')
      // Remove markdown code blocks FIRST (before other markdown)
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`[^`\n]+`/g, ' ')
      // Remove "X min/minute read" patterns (more patterns)
      .replace(/\d+[\s-]*(?:min|mins|minute|minutes)[\s-]*(?:read|reading|to read|time)?/gi, ' ')
      .replace(/(?:read|reading|time)[\s-]*\d+[\s-]*(?:min|mins|minute|minutes)/gi, ' ')
      // Remove markdown formatting
      .replace(/#{1,6}\s+/g, '') // Headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
      .replace(/\*([^*]+)\*/g, '$1') // Italic
      .replace(/__([^_]+)__/g, '$1') // Bold alt
      .replace(/_([^_]+)_/g, '$1') // Italic alt
      .replace(/~~([^~]+)~~/g, '$1') // Strikethrough
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links [text](url)
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Images
      // Remove code-like patterns (camelCase, snake_case identifiers without spaces)
      .replace(/\b[a-z]+([A-Z][a-z]*)+\b/g, '')
      .replace(/\b[a-z]+_[a-z_]+\b/g, '')
      // Remove file paths and extensions
      .replace(/\b[\w-]+\.(js|ts|tsx|jsx|css|html|json|xml|yml|yaml|md|txt|pdf)\b/gi, '')
      .replace(/\/[\w/-]+/g, '')
      // Collapse multiple whitespaces/newlines
      .replace(/\s+/g, ' ')
      .trim()
  )
}

export function analyzeStyle(text: string): StyleAnalysis {
  const cleanedText = preprocessText(text)

  return {
    tfidf: extractTfIdf(cleanedText),
    bigrams: extractNGrams(cleanedText, 2),
    trigrams: extractNGrams(cleanedText, 3),
    metrics: computeLinguisticMetrics(cleanedText),
  }
}

function extractTfIdf(text: string, topN = 20): TfIdfTerm[] {
  const tfidf = new natural.TfIdf()
  tfidf.addDocument(text)

  const terms: TfIdfTerm[] = []
  for (const item of tfidf.listTerms(0)) {
    terms.push({ term: item.term, score: item.tfidf })
  }

  return terms.slice(0, topN)
}

function extractNGrams(text: string, n: number, topN = 15): NGramEntry[] {
  const tokenizer = new natural.WordTokenizer()
  const words = tokenizer
    .tokenize(text)
    ?.map(w => w.toLowerCase())
    .filter(w => w.length > 2)

  if (!words || words.length < n) return []

  const grams = n === 2 ? natural.NGrams.bigrams(words) : natural.NGrams.trigrams(words)

  // Count occurrences
  const counts = new Map<string, number>()
  for (const gram of grams) {
    const key = gram.join(' ')
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([gram, count]) => ({ gram, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN)
}

function computeLinguisticMetrics(text: string): LinguisticMetrics {
  const doc = nlp(text)
  const sentences = doc.sentences().out('array') as string[]
  const sentenceCount = sentences.length || 1

  const tokenizer = new natural.WordTokenizer()
  const words = tokenizer.tokenize(text) ?? []
  const wordCount = words.length || 1

  const uniqueWords = new Set(words.map(w => w.toLowerCase()))
  const vocabularySize = uniqueWords.size

  const nouns = (doc.nouns().out('array') as string[]).length
  const verbs = (doc.verbs().out('array') as string[]).length
  const adjectives = (doc.adjectives().out('array') as string[]).length

  return {
    sentenceCount,
    wordCount,
    averageSentenceLength: Math.round((wordCount / sentenceCount) * 100) / 100,
    lexicalRichness: Math.round((vocabularySize / wordCount) * 100) / 100,
    vocabularySize,
    nounRatio: Math.round((nouns / wordCount) * 100) / 100,
    verbRatio: Math.round((verbs / wordCount) * 100) / 100,
    adjectiveRatio: Math.round((adjectives / wordCount) * 100) / 100,
  }
}
