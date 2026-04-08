import type { ChatMessage } from '../types/openai.js'

/**
 * Find the cut index for a sliding window of the given size.
 * Returns the index in conversationMessages where kept messages start.
 */
const findCutIndex = (conversationMessages: ChatMessage[], windowSize: number): number => {
  let userCount = 0
  for (let i = conversationMessages.length - 1; i >= 0; i--) {
    const msg = conversationMessages[i]
    if (msg && msg.role === 'user') {
      userCount++
      if (userCount >= windowSize) {
        return i
      }
    }
  }
  return 0
}

/**
 * Apply sliding window to conversation messages.
 * Keeps the system message(s) and the last `windowSize` user/assistant exchanges.
 * An "exchange" is a pair of user + assistant messages.
 */
export const applySlidingWindow = (messages: ChatMessage[], windowSize: number): ChatMessage[] => {
  const systemMessages = messages.filter(m => m.role === 'system')
  const conversationMessages = messages.filter(m => m.role !== 'system')

  const exchangeCount = conversationMessages.filter(m => m.role === 'user').length

  if (exchangeCount <= windowSize) {
    return messages
  }

  const cutIndex = findCutIndex(conversationMessages, windowSize)
  const keptMessages = conversationMessages.slice(cutIndex)

  return [...systemMessages, ...keptMessages]
}

/**
 * Partition messages into kept and dropped sets based on the sliding window.
 * Returns both sets for use with conversation summarization.
 */
export const partitionSlidingWindow = (
  messages: ChatMessage[],
  windowSize: number
): { kept: ChatMessage[]; dropped: ChatMessage[] } => {
  const systemMessages = messages.filter(m => m.role === 'system')
  const conversationMessages = messages.filter(m => m.role !== 'system')

  const exchangeCount = conversationMessages.filter(m => m.role === 'user').length

  if (exchangeCount <= windowSize) {
    return { kept: messages, dropped: [] }
  }

  const cutIndex = findCutIndex(conversationMessages, windowSize)
  const dropped = conversationMessages.slice(0, cutIndex)
  const kept = [...systemMessages, ...conversationMessages.slice(cutIndex)]

  return { kept, dropped }
}
