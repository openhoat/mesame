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
      // 1. Remove HTML/Script/Style tags and entities
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z0-9#]+;/gi, ' ') // Clean HTML entities like &nbsp;
      // 2. Remove URLs and Emails
      .replace(/\b(?:https?|ftp|file):\/\/[^\s]+/gi, ' ')
      .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, ' ')
      // 3. Remove Markdown code blocks and formatting but keep content
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`[^`\n]+`/g, ' ')
      .replace(/#{1,6}\s+/g, ' ')
      .replace(/[*_~]{1,3}/g, ' ') // Simplified markdown clean
      // 4. Remove obvious metadata labels and dates
      .replace(/\b(updated|published|author|tags|categories|reading time)[\s:]+[\w\s,]+/gi, ' ')
      .replace(/\b\d{4}\b/g, ' ') // Years
      .replace(/\b\d{1,2}[/:.-]\d{1,2}[/:.-]\d{2,4}\b/g, ' ')
      // 5. Clean up non-word characters but KEEP French accents
      // We use a safe character set to avoid breaking UTF-8
      .replace(/[^\w\sàâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ.!?]/g, ' ')
      // 6. Collapse whitespaces
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
  'article',
  'articles',
  'premier',
  'première',
  'dernier',
  'dernière',
  'suivante',
  'précédente',
  'chapitre',
  'section',
  'contenu',
  'exemple',
  'exemples',
  'usage',
  'utiliser',
  'utilisant',
  'permet',
  'permettent',
  'moyen',
  'partie',
  'parties',
  'objet',
  'objets',
  'cas',
  'situations',
  'ordre',
  'niveau',
  'content',
  'type',
  'blog',
  'template',
  'view',
  'more',
  'search',
  'latest',
  'recent',
  'following',
  'header',
  'footer',
])

/**
 * White list of words that are true stylistic markers.
 * If an expression contains one of these, it's highly likely to be stylistic.
 */
const WEAK_EXPRESSIONS = new Set([
  'nous avons',
  'nous allons',
  'il y a',
  'faire un',
  'faire une',
  'dans ce',
  'dans cette',
  'pour le',
  'pour la',
  'avec le',
  'avec la',
  'est un',
  'est une',
  'sont des',
  'cela permet',
  'ceci permet',
  'pouvez utiliser',
  'va voir',
  'allez voir',
  'we have',
  'we will',
  'there is',
  'there are',
  'to be',
  'can use',
])

const STYLE_MARKERS = new Set([
  // Adverbs of manner/intensity
  'vraiment',
  'extrêmement',
  'particulièrement',
  'tellement',
  'absolument',
  'parfaitement',
  'totalement',
  'complètement',
  'véritablement',
  'clairement',
  'simplement',
  'juste',
  'assez',
  'trop',
  'plutôt',
  'très',
  'encore',
  'enfin',
  'enfin',
  'souvent',
  'toujours',
  'jamais',
  'parfois',
  'déjà',
  'presque',
  'évidemment',
  'heureusement',
  'malheureusement',
  // Judgment adjectives
  'intéressant',
  'crucial',
  'important',
  'difficile',
  'facile',
  'simple',
  'complexe',
  'élégant',
  'propre',
  'sale',
  'génial',
  'super',
  'top',
  'dommage',
  'incroyable',
  'efficace',
  'robuste',
  'fragile',
  'rapide',
  'lent',
  'utile',
  'inutile',
  'particulier',
  'unique',
  'rare',
  'commun',
  'classique',
  'moderne',
  'nouveau',
  'ancien',
  // Verbs of engagement/opinion
  'penser',
  'croire',
  'sembler',
  'paraître',
  'trouver',
  'aimer',
  'adorer',
  'détester',
  'préférer',
  'vouloir',
  'pouvoir',
  'devoir',
  'savoir',
  'comprendre',
  'ignorer',
  'espérer',
  'craindre',
  'noter',
  'remarquer',
  'oublier',
  'essayer',
  'tenter',
  // English equivalents for mix
  'actually',
  'really',
  'simply',
  'basically',
  'totally',
  'perfectly',
  'elegant',
  'clean',
  'dirty',
  'useful',
  'useless',
  'easy',
  'hard',
  'complex',
  'simple',
])

function extractNGrams(text: string, n: number, topN = 15): NGramEntry[] {
  // Use a regex that preserves French accents for tokenization
  const words = text
    .toLowerCase()
    .split(/[\s,;.:!?()[\]{}'"]+/)
    .filter(w => w.length >= 4)
    .filter(w => !STOP_WORDS.has(w))

  if (!words || words.length < n) return []

  // Function to check if a bigram/trigram has stylistic value
  const hasStylisticValue = (gram: string[]): boolean => {
    const combined = gram.join(' ')

    // 0. Exclude weak/common filler expressions
    if (WEAK_EXPRESSIONS.has(combined)) return false

    // 1. Check if at least ONE word is in our stylistic white list
    for (const word of gram) {
      if (STYLE_MARKERS.has(word)) return true
    }

    // 2. Fallback: check if it contains a qualitative adjective or adverb via NLP
    const doc = nlp(combined)

    // Safety: exclude expressions that look like English tech terms
    // (if they don't have a stylistic marker from the white list)
    const hasEnglishTech = doc.match(
      '(content|type|blog|post|page|user|data|code|api|server|app)'
    ).found
    if (hasEnglishTech) return false

    return doc.match('(#Adjective|#Adverb)').found && !doc.match('#ProperNoun').found
  }

  const rawGrams = n === 2 ? natural.NGrams.bigrams(words) : natural.NGrams.trigrams(words)

  // Filter grams: keep only those with stylistic markers or qualitative NLP tags
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
