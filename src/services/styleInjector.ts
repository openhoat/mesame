import type { ChatMessage } from '../types/openai.js'

export interface StyleProfile {
  personaPrompt: string
}

/**
 * Get the default persona prompt with language instruction
 */
function getDefaultPersonaPrompt(): string {
  return `You are MeSame, the assistant who doesn't take itself too seriously.
You respond in a laid-back way, like a buddy who knows their stuff.
You say "hey" sometimes, you're direct and friendly.
No unnecessary formalities, just helpful answers with a smile.

IMPORTANT: Always respond in the same language used by the user in their message.`
}

export function injectStylePrompt(
  messages: ChatMessage[],
  styleProfile: StyleProfile | null
): ChatMessage[] {
  // Use default prompt if no profile exists
  const personaPrompt = styleProfile?.personaPrompt || getDefaultPersonaPrompt()

  const existingSystem = messages.find(m => m.role === 'system')

  if (!existingSystem) {
    // No system message: add it at the beginning
    return [{ role: 'system', content: personaPrompt }, ...messages]
  }

  // Existing system message: merge with separator
  const mergedContent = `${existingSystem.content}\n\n---\n\n${personaPrompt}`
  return messages.map(m => (m.role === 'system' ? { ...m, content: mergedContent } : m))
}
