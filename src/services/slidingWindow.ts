import type { ChatMessage } from '../types/openai.js'

/**
 * Apply sliding window to conversation messages.
 * Keeps the system message(s) and the last `windowSize` user/assistant exchanges.
 * An "exchange" is a pair of user + assistant messages.
 */
export const applySlidingWindow = (messages: ChatMessage[], windowSize: number): ChatMessage[] => {
  // Separate system messages from conversation messages
  const systemMessages = messages.filter(m => m.role === 'system')
  const conversationMessages = messages.filter(m => m.role !== 'system')

  // Count exchanges (each user message starts an exchange)
  const exchangeCount = conversationMessages.filter(m => m.role === 'user').length

  if (exchangeCount <= windowSize) {
    return messages
  }

  // Keep only the last `windowSize` exchanges
  // Walk backwards through conversation messages to find the cut point
  let userCount = 0
  let cutIndex = conversationMessages.length

  for (let i = conversationMessages.length - 1; i >= 0; i--) {
    const msg = conversationMessages[i]
    if (msg && msg.role === 'user') {
      userCount++
      if (userCount >= windowSize) {
        cutIndex = i
        break
      }
    }
  }

  const keptMessages = conversationMessages.slice(cutIndex)

  return [...systemMessages, ...keptMessages]
}
