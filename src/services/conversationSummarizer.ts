import { createHash } from 'node:crypto'
import { logger } from '../logger.js'
import type { ChatMessage } from '../types/openai.js'
import { convertToLangChainMessages, getChatModelFromModelId } from './llmProvider.js'

const summaryCache = new Map<string, { summary: string; timestamp: number }>()
const SUMMARY_TTL = 30 * 60 * 1000 // 30 minutes

const hashMessages = (messages: ChatMessage[]): string =>
  createHash('sha256').update(JSON.stringify(messages)).digest('hex')

/**
 * Summarize dropped conversation messages using the LLM.
 * Results are cached to avoid redundant LLM calls.
 */
export const summarizeDroppedMessages = async (
  modelId: string,
  droppedMessages: ChatMessage[]
): Promise<string> => {
  if (droppedMessages.length === 0) return ''

  const cacheKey = hashMessages(droppedMessages)
  const cached = summaryCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < SUMMARY_TTL) {
    logger.debug('Conversation summary cache hit')
    return cached.summary
  }

  logger.debug(`Summarizing ${droppedMessages.length} dropped messages`)

  const summaryPrompt: ChatMessage[] = [
    {
      role: 'system',
      content:
        'Summarize the following conversation concisely, preserving key facts, decisions, and context. Output only the summary, no preamble.',
    },
    ...droppedMessages,
    {
      role: 'user',
      content: 'Provide a brief summary of the above conversation.',
    },
  ]

  const chatModel = await getChatModelFromModelId(modelId, false)
  const langchainMessages = convertToLangChainMessages(summaryPrompt)
  const response = await chatModel.invoke(langchainMessages)
  const summary = typeof response.content === 'string' ? response.content : ''

  summaryCache.set(cacheKey, { summary, timestamp: Date.now() })

  // Evict old entries
  const now = Date.now()
  for (const [key, entry] of summaryCache) {
    if (now - entry.timestamp > SUMMARY_TTL) {
      summaryCache.delete(key)
    }
  }

  return summary
}

/**
 * Clear the summary cache.
 */
export const clearSummaryCache = (): void => {
  summaryCache.clear()
}
