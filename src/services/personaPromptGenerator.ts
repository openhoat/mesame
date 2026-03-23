import { config } from '../config.js'
import type { StyleAnalysis } from './styleAnalyzer.js'

/**
 * Language-specific instructions for the assistant
 */
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  ja: 'Japanese',
  zh: 'Chinese',
  ko: 'Korean',
}

export function generatePersonaPrompt(analysis: StyleAnalysis): string {
  const sections = [
    buildIntroduction(),
    buildSentenceStyle(analysis.metrics.averageSentenceLength),
    buildVocabularyStyle(analysis.metrics.lexicalRichness),
    buildToneProfile(analysis.metrics),
    buildKeyVocabulary(analysis.tfidf.map(t => t.term)),
    buildSignaturePhrases(analysis.bigrams.map(b => b.gram)),
    buildLanguageInstruction(),
  ]

  return sections.filter(Boolean).join('\n')
}

function buildLanguageInstruction(): string {
  const languageName = LANGUAGE_NAMES[config.language] || config.language
  return `IMPORTANT: Always respond in ${languageName}.`
}

function buildIntroduction(): string {
  return 'You are MeSame, an AI assistant that mirrors the writing style of the user.'
}

function buildSentenceStyle(averageSentenceLength: number): string {
  if (averageSentenceLength <= 10) {
    return 'Use short, punchy sentences. Be direct and concise.'
  }
  if (averageSentenceLength <= 20) {
    return 'Use sentences of moderate length. Balance clarity with detail.'
  }
  return 'Use longer, elaborated sentences. Develop your ideas fully with nuance and detail.'
}

function buildVocabularyStyle(lexicalRichness: number): string {
  if (lexicalRichness >= 0.7) {
    return 'Employ a rich and varied vocabulary. Avoid repeating the same words — use synonyms and diverse expressions.'
  }
  if (lexicalRichness >= 0.4) {
    return 'Use a balanced vocabulary with a moderate variety of words.'
  }
  return 'Keep your vocabulary simple and consistent. Favor familiar, everyday words.'
}

function buildToneProfile(metrics: StyleAnalysis['metrics']): string {
  const traits: string[] = []

  if (metrics.adjectiveRatio >= 0.1) {
    traits.push('descriptive and expressive')
  }
  if (metrics.nounRatio >= 0.3) {
    traits.push('factual and concrete')
  }
  if (metrics.verbRatio >= 0.2) {
    traits.push('action-oriented and dynamic')
  }

  if (traits.length === 0) {
    return 'Maintain a neutral, balanced tone.'
  }

  return `Adopt a tone that is ${traits.join(', ')}.`
}

function buildKeyVocabulary(terms: string[]): string {
  const topTerms = terms.slice(0, 5)
  if (topTerms.length === 0) {
    return ''
  }
  return `Naturally incorporate these key terms when relevant: ${topTerms.join(', ')}.`
}

function buildSignaturePhrases(bigrams: string[]): string {
  const topBigrams = bigrams.slice(0, 3)
  if (topBigrams.length === 0) {
    return ''
  }
  return `When appropriate, use these characteristic expressions: "${topBigrams.join('", "')}".`
}
