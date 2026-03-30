import nlp from 'compromise'
import natural from 'natural'

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
  pronounFirstPersonRatio: number // I, me, my, we, us, our
  pronounSecondPersonRatio: number // You, your
  questionRatio: number // Sentences ending with ?
  exclamationRatio: number // Sentences ending with !
}

export interface StyleAnalysis {
  tfidf: never[] // Kept for API compatibility but empty
  bigrams: NGramEntry[]
  trigrams: NGramEntry[]
  metrics: LinguisticMetrics
  transitions: NGramEntry[]
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
      // Remove any 4-digit numbers (likely years)
      .replace(/\b\d{4}\b/g, '')
      // Remove month names and years (e.g., "feb 2026", "October 17")
      .replace(
        /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,4}\b/gi,
        ''
      )
      .replace(/\b\d{1,4}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/gi, '')
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
      // Remove common programming keywords that might appear in plain text
      .replace(
        /\b(const|let|var|function|export|import|from|return|async|await|console|log)\b/g,
        ''
      )
      .replace(/\b(void|interface|type|class|private|public|protected|implements|extends)\b/g, '')
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

const TRANSITION_WORDS = [
  'donc',
  'ainsi',
  'cependant',
  'pourtant',
  'toutefois',
  'alors',
  'ensuite',
  'enfin',
  'pourtant',
  'parce que',
  'car',
  'mais',
  'donc',
  'or',
  'ni',
  'car',
  'en gros',
  'du coup',
  'en effet',
  'par exemple',
  'notamment',
  'finalement',
]

function extractTransitions(text: string): NGramEntry[] {
  const lowerText = text.toLowerCase()
  const found: NGramEntry[] = []

  for (const word of TRANSITION_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'g')
    const count = (lowerText.match(regex) || []).length
    if (count > 0) {
      found.push({ gram: word, count })
    }
  }

  return found.sort((a, b) => b.count - a.count).slice(0, 10)
}

export function analyzeStyle(text: string): StyleAnalysis {
  const cleanedText = preprocessText(text)

  return {
    tfidf: [], // TF-IDF is no longer used to avoid thematic noise
    bigrams: extractNGrams(cleanedText, 2),
    trigrams: extractNGrams(cleanedText, 3),
    metrics: computeLinguisticMetrics(cleanedText),
    transitions: extractTransitions(cleanedText),
  }
}

const STOP_WORDS = new Set([
  // French
  'le',
  'la',
  'les',
  'un',
  'une',
  'des',
  'de',
  'du',
  'd’',
  'l’',
  'et',
  'ou',
  'où',
  'mais',
  'donc',
  'car',
  'ni',
  'si',
  'se',
  'ce',
  'cette',
  'ces',
  'mon',
  'ma',
  'mes',
  'ton',
  'ta',
  'tes',
  'son',
  'sa',
  'ses',
  'notre',
  'nos',
  'votre',
  'vos',
  'leur',
  'leurs',
  'qui',
  'que',
  'quoi',
  'dont',
  'dans',
  'sur',
  'pour',
  'par',
  'avec',
  'sans',
  'sous',
  'chez',
  'entre',
  'depuis',
  'pendant',
  'vers',
  'avant',
  'après',
  'pourtant',
  'pendant',
  'parce',
  'quand',
  'comme',
  'si',
  'alors',
  'ici',
  'tout',
  'toute',
  'tous',
  'toutes',
  'bien',
  'très',
  'assez',
  'peu',
  'plus',
  'moins',
  'trop',
  'jamais',
  'toujours',
  'déjà',
  'encore',
  'aussi',
  'maintenant',
  'après',
  'comment',
  'pourquoi',
  'être',
  'avoir',
  'est',
  'sont',
  'était',
  'été',
  'suis',
  'avez',
  'notamment',
  // English
  'the',
  'and',
  'for',
  'with',
  'from',
  'that',
  'this',
  'they',
  'their',
  'which',
  // Tech noise (thematic instead of stylistic)
  'code',
  'tech',
  'web',
  'mobile',
  'app',
  'apps',
  'server',
  'serveur',
  'backend',
  'frontend',
  'api',
  'apis',
  'framework',
  'library',
  'librairie',
  'module',
  'package',
  'route',
  'routes',
  'data',
  'données',
  'user',
  'utilisateur',
  'users',
  'utilisateurs',
  'client',
  'service',
  'services',
  'cloud',
  'docker',
  'node',
  'nodejs',
  'deno',
  'fastify',
  'svelte',
  'react',
  'vue',
  'angular',
  'typescript',
  'javascript',
  'python',
  'rust',
  'golang',
  'netlify',
  'kubernetes',
  'cluster',
  'design',
  'base',
  'hello',
  'niji',
  'ensemble',
  'name',
  'forms',
  'simple',
  'serve',
  'signal',
  'express',
  'plan',
  'post',
  'star',
  'wars',
  'method',
  'get',
])

function extractNGrams(text: string, n: number, topN = 15): NGramEntry[] {
  const tokenizer = new natural.WordTokenizer()
  const words = tokenizer
    .tokenize(text)
    ?.map(w => w.toLowerCase())
    .filter(w => w.length > 2)
    .filter(w => !STOP_WORDS.has(w))

  if (!words || words.length < n) return []

  // Function to check if a bigram/trigram has stylistic value
  const hasStylisticValue = (gram: string[]): boolean => {
    const doc = nlp(gram.join(' '))
    // It must contain at least one adjective or adverb to be considered truly "stylistic"
    // We exclude verbs here to avoid tech actions like "process data"
    return doc.match('(#Adjective|#Adverb)').found
  }

  const rawGrams = n === 2 ? natural.NGrams.bigrams(words) : natural.NGrams.trigrams(words)

  // Filter grams: keep only those with stylistic markers
  const grams = rawGrams.filter(hasStylisticValue)

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

  // Pronoun analysis (French/English mix for safety, though corpus is French)
  const firstPerson = doc
    .match('(je|me|moi|mon|ma|mes|nous|notre|nos|i|me|my|mine|we|us|our|ours)')
    .out('array').length
  const secondPerson = doc
    .match('(tu|te|toi|ton|ta|tes|vous|votre|vos|you|your|yours)')
    .out('array').length

  // Punctuation analysis
  const questions = (text.match(/\?/g) || []).length
  const exclamations = (text.match(/!/g) || []).length

  return {
    sentenceCount,
    wordCount,
    averageSentenceLength: Math.round((wordCount / sentenceCount) * 100) / 100,
    lexicalRichness: Math.round((vocabularySize / wordCount) * 100) / 100,
    vocabularySize,
    nounRatio: Math.round((nouns / wordCount) * 100) / 100,
    verbRatio: Math.round((verbs / wordCount) * 100) / 100,
    adjectiveRatio: Math.round((adjectives / wordCount) * 100) / 100,
    pronounFirstPersonRatio: Math.round((firstPerson / wordCount) * 100) / 100,
    pronounSecondPersonRatio: Math.round((secondPerson / wordCount) * 100) / 100,
    questionRatio: Math.round((questions / sentenceCount) * 100) / 100,
    exclamationRatio: Math.round((exclamations / sentenceCount) * 100) / 100,
  }
}
