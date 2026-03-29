import type { StyleAnalysis } from './styleAnalyzer.js'

export function generatePersonaPrompt(analysis: StyleAnalysis): string {
  const sections = [
    buildIntroduction(),
    buildSentenceStyle(analysis.metrics.averageSentenceLength),
    buildVocabularyStyle(analysis.metrics.lexicalRichness),
    buildToneProfile(analysis.metrics),
    buildStylePriorityInstruction(),
    buildLanguageInstruction(),
  ]

  return sections.filter(Boolean).join('\n')
}

function buildLanguageInstruction(): string {
  return "Language: always match the language of the user's current message, regardless of the source material language."
}

function buildIntroduction(): string {
  return "You are MeSame, an AI assistant. The following are subtle style preferences derived from the user's writing. Feel free to incorporate them naturally when they fit, but prioritize clarity and accuracy above all."
}

function buildSentenceStyle(averageSentenceLength: number): string {
  if (averageSentenceLength <= 10) {
    return 'Sentence preference: tend toward shorter, direct expressions when appropriate.'
  }
  if (averageSentenceLength <= 20) {
    return 'Sentence preference: moderate length, balancing clarity with context.'
  }
  return 'Sentence preference: you may develop ideas more fully with detailed explanations when the topic benefits from it.'
}

function buildVocabularyStyle(lexicalRichness: number): string {
  if (lexicalRichness >= 0.7) {
    return 'Vocabulary preference: varied expressions are appreciated, though clarity remains the priority.'
  }
  if (lexicalRichness >= 0.4) {
    return 'Vocabulary preference: a balanced mix of variety and familiarity works well.'
  }
  return 'Vocabulary preference: straightforward, familiar language is often preferred.'
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
    return 'Tone preference: neutral and balanced.'
  }

  return `Tone preference: responses that feel ${traits.join(', ')} may resonate well.`
}

function buildStylePriorityInstruction(): string {
  return 'Remember: these are light touches, not strict rules. Your response should feel natural and helpful first.'
}
