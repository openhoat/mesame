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

export function analyzeStyle(text: string): StyleAnalysis {
  return {
    tfidf: extractTfIdf(text),
    bigrams: extractNGrams(text, 2),
    trigrams: extractNGrams(text, 3),
    metrics: computeLinguisticMetrics(text),
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
