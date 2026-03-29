import type { ChatMessage } from '../types/openai.js'

export interface StyleProfile {
  personaPrompt: string
}

/**
 * Language code to full name mapping
 */
const LANGUAGE_NAMES: Record<string, string> = {
  fr: 'French',
  en: 'English',
  es: 'Spanish',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
}

/**
 * Build the language instruction for the system prompt
 */
function buildLanguageInstruction(preferredLanguage: string): string {
  const languageName = LANGUAGE_NAMES[preferredLanguage] || 'English'
  return `Language: You MUST respond in ${languageName}. This is the user's preferred language. Always respond in ${languageName} regardless of the language used in the user's message.`
}

/**
 * Get the default persona prompt (when no style profile exists)
 */
function getDefaultPersonaPrompt(): string {
  return `You are MeSame, the assistant who doesn't take itself too seriously.
You respond in a laid-back way, like a buddy who knows their stuff.
You say "hey" sometimes, you're direct and friendly.
No unnecessary formalities, just helpful answers with a smile.`
}

export function injectStylePrompt(
  messages: ChatMessage[],
  styleProfile: StyleProfile | null,
  preferredLanguage: string = 'en'
): ChatMessage[] {
  // Build the complete system prompt
  const basePrompt = styleProfile?.personaPrompt || getDefaultPersonaPrompt()
  const languageInstruction = buildLanguageInstruction(preferredLanguage)
  const fullPrompt = `${basePrompt}\n\n${languageInstruction}`

  const existingSystem = messages.find(m => m.role === 'system')

  if (!existingSystem) {
    // No system message: add it at the beginning
    return [{ role: 'system', content: fullPrompt }, ...messages]
  }

  // Existing system message: merge with separator
  const mergedContent = `${existingSystem.content}\n\n---\n\n${fullPrompt}`
  return messages.map(m => (m.role === 'system' ? { ...m, content: mergedContent } : m))
}
