import { AIMessage } from '@langchain/core/messages'
import { afterEach, describe, expect, test, vi } from 'vitest'
import type { ChatMessage } from '../types/openai.js'
import { clearSummaryCache, summarizeDroppedMessages } from './conversationSummarizer.js'

const mockInvoke = vi.fn()

vi.mock('./llmProvider.js', () => ({
  getChatModelFromModelId: vi.fn(() => ({ invoke: mockInvoke })),
  convertToLangChainMessages: vi.fn(messages => messages),
}))

vi.mock('../logger.js', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

describe('conversationSummarizer', () => {
  afterEach(() => {
    vi.clearAllMocks()
    clearSummaryCache()
  })

  const droppedMessages: ChatMessage[] = [
    { role: 'user', content: 'What is TypeScript?' },
    { role: 'assistant', content: 'TypeScript is a typed superset of JavaScript.' },
    { role: 'user', content: 'How does it compare to JavaScript?' },
    { role: 'assistant', content: 'It adds static typing and better tooling support.' },
  ]

  test('should return empty string for empty messages', async () => {
    const result = await summarizeDroppedMessages('model-1', [])
    expect(result).toBe('')
    expect(mockInvoke).not.toHaveBeenCalled()
  })

  test('should call LLM to summarize messages', async () => {
    mockInvoke.mockResolvedValueOnce(
      new AIMessage('Discussion about TypeScript vs JavaScript, covering typing and tooling.')
    )

    const result = await summarizeDroppedMessages('model-1', droppedMessages)
    expect(result).toBe('Discussion about TypeScript vs JavaScript, covering typing and tooling.')
    expect(mockInvoke).toHaveBeenCalledOnce()
  })

  test('should cache summary results', async () => {
    mockInvoke.mockResolvedValueOnce(new AIMessage('Cached summary'))

    await summarizeDroppedMessages('model-1', droppedMessages)
    const result = await summarizeDroppedMessages('model-1', droppedMessages)

    expect(result).toBe('Cached summary')
    expect(mockInvoke).toHaveBeenCalledOnce() // Only called once due to cache
  })

  test('should generate new summary for different messages', async () => {
    mockInvoke
      .mockResolvedValueOnce(new AIMessage('Summary A'))
      .mockResolvedValueOnce(new AIMessage('Summary B'))

    const different: ChatMessage[] = [{ role: 'user', content: 'Different question' }]

    await summarizeDroppedMessages('model-1', droppedMessages)
    await summarizeDroppedMessages('model-1', different)

    expect(mockInvoke).toHaveBeenCalledTimes(2)
  })
})
