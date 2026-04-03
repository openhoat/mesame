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
  return `Language preference: Respond in ${languageName}.`
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
  preferredLanguage: string | null = null
): ChatMessage[] {
  // Build the complete system prompt
  const basePrompt = styleProfile?.personaPrompt || getDefaultPersonaPrompt()

  // Only add language instruction if a preferred language is set
  const languageInstruction = preferredLanguage ? buildLanguageInstruction(preferredLanguage) : ''

  // Combine all parts
  const parts = [basePrompt]
  if (languageInstruction) {
    parts.push(languageInstruction)
  }

  const fullPrompt = parts.join('\n\n')

  const existingSystem = messages.find(m => m.role === 'system')

  if (!existingSystem) {
    // No system message: add it at the beginning
    return [{ role: 'system', content: fullPrompt }, ...messages]
  }

  // Existing system message: merge with separator
  const mergedContent = `${existingSystem.content}\n\n---\n\n${fullPrompt}`
  return messages.map(m => (m.role === 'system' ? { ...m, content: mergedContent } : m))
}
