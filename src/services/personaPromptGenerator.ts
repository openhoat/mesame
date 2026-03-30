import type { StyleAnalysis } from './styleAnalyzer.js'

export function generatePersonaPrompt(analysis: StyleAnalysis): string {
  const sections = [
    buildIntroduction(),
    buildSentenceStyle(analysis.metrics.averageSentenceLength),
    buildVocabularyStyle(analysis.metrics.lexicalRichness),
    buildToneProfile(analysis.metrics),
    buildLexiconSection(analysis),
    buildTransitionSection(analysis.transitions),
    buildVoiceSection(analysis.metrics),
    buildStylePriorityInstruction(),
  ]

  return sections.filter(Boolean).join('\n')
}

function buildIntroduction(): string {
  return "You are MeSame, an AI assistant. Your goal is to mirror the user's unique writing style, voice, and reasoning patterns. Use the following stylistic guidelines to shape your responses, ensuring they feel authentic and familiar to the user."
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

  let tone =
    traits.length === 0
      ? 'Tone preference: neutral and balanced.'
      : `Tone preference: responses that feel ${traits.join(', ')} may resonate well.`

  if (metrics.questionRatio > 0.1) {
    tone += ' You often use rhetorical or engaging questions to guide the reader.'
  }
  if (metrics.exclamationRatio > 0.05) {
    tone += ' Your tone is enthusiastic, using exclamations for emphasis.'
  }

  return tone
}

function buildLexiconSection(analysis: StyleAnalysis): string {
  const topBigrams = analysis.bigrams.slice(0, 8).map(b => b.gram)

  if (topBigrams.length === 0) return ''

  let section = 'Signature Phrasing & Expressions:\n'
  section += `Naturally incorporate these recurring expressions when appropriate: ${topBigrams.join(', ')}.`
  return section
}

function buildTransitionSection(transitions: StyleAnalysis['transitions']): string {
  if (transitions.length === 0) return ''
  const list = transitions.map(t => t.gram).join(', ')
  return `Transitions & Connectors: You naturally use these words to link ideas: ${list}.`
}

function buildVoiceSection(metrics: StyleAnalysis['metrics']): string {
  if (metrics.pronounFirstPersonRatio > 0.02) {
    return 'Voice: Use a personal "I" or "We" perspective, as the user frequently writes from a direct, first-person standpoint.'
  }
  if (metrics.pronounSecondPersonRatio > 0.01) {
    return 'Voice: Engage the reader directly using "You", mirroring the user\'s interactive writing style.'
  }
  return 'Voice: Maintain a professional, objective distance (impersonal style).'
}

function buildStylePriorityInstruction(): string {
  return 'Core Directive: Do not explicitly mention these guidelines. Simply embody them. Prioritize helpfulness while maintaining this specific linguistic signature.'
}
