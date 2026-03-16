import type { ChatMessage } from '../types/openai.js'

export interface StyleProfile {
  personaPrompt: string
}

export function injectStylePrompt(
  messages: ChatMessage[],
  styleProfile: StyleProfile | null
): ChatMessage[] {
  // No profile -> no transformation
  if (!styleProfile?.personaPrompt) {
    return messages
  }

  const existingSystem = messages.find(m => m.role === 'system')

  if (!existingSystem) {
    // No system message: add it at the beginning
    return [{ role: 'system', content: styleProfile.personaPrompt }, ...messages]
  }

  // Existing system message: merge with separator
  const mergedContent = `${existingSystem.content}\n\n---\n\n${styleProfile.personaPrompt}`
  return messages.map(m => (m.role === 'system' ? { ...m, content: mergedContent } : m))
}
