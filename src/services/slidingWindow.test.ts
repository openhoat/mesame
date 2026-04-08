import { describe, expect, test } from 'vitest'
import type { ChatMessage } from '../types/openai.js'
import { applySlidingWindow, partitionSlidingWindow } from './slidingWindow.js'

describe('applySlidingWindow', () => {
  const systemMessage: ChatMessage = { role: 'system', content: 'You are a helpful assistant.' }

  test('should return all messages when exchanges fit within window', () => {
    const messages: ChatMessage[] = [
      systemMessage,
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
      { role: 'user', content: 'How are you?' },
      { role: 'assistant', content: 'I am fine.' },
    ]
    const result = applySlidingWindow(messages, 10)
    expect(result).toEqual(messages)
  })

  test('should return all messages when exchange count equals window size', () => {
    const messages: ChatMessage[] = [
      systemMessage,
      { role: 'user', content: 'msg1' },
      { role: 'assistant', content: 'reply1' },
      { role: 'user', content: 'msg2' },
      { role: 'assistant', content: 'reply2' },
    ]
    const result = applySlidingWindow(messages, 2)
    expect(result).toEqual(messages)
  })

  test('should keep only last N exchanges when conversation exceeds window', () => {
    const messages: ChatMessage[] = [
      systemMessage,
      { role: 'user', content: 'msg1' },
      { role: 'assistant', content: 'reply1' },
      { role: 'user', content: 'msg2' },
      { role: 'assistant', content: 'reply2' },
      { role: 'user', content: 'msg3' },
      { role: 'assistant', content: 'reply3' },
    ]
    const result = applySlidingWindow(messages, 2)
    expect(result).toEqual([
      systemMessage,
      { role: 'user', content: 'msg2' },
      { role: 'assistant', content: 'reply2' },
      { role: 'user', content: 'msg3' },
      { role: 'assistant', content: 'reply3' },
    ])
  })

  test('should preserve system messages and trim old exchanges', () => {
    const messages: ChatMessage[] = [
      systemMessage,
      { role: 'user', content: 'old1' },
      { role: 'assistant', content: 'old-reply1' },
      { role: 'user', content: 'old2' },
      { role: 'assistant', content: 'old-reply2' },
      { role: 'user', content: 'recent' },
      { role: 'assistant', content: 'recent-reply' },
    ]
    const result = applySlidingWindow(messages, 1)
    expect(result).toEqual([
      systemMessage,
      { role: 'user', content: 'recent' },
      { role: 'assistant', content: 'recent-reply' },
    ])
  })

  test('should work with no system message', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: 'msg1' },
      { role: 'assistant', content: 'reply1' },
      { role: 'user', content: 'msg2' },
      { role: 'assistant', content: 'reply2' },
    ]
    const result = applySlidingWindow(messages, 1)
    expect(result).toEqual([
      { role: 'user', content: 'msg2' },
      { role: 'assistant', content: 'reply2' },
    ])
  })

  test('should handle trailing user message without assistant reply', () => {
    const messages: ChatMessage[] = [
      systemMessage,
      { role: 'user', content: 'msg1' },
      { role: 'assistant', content: 'reply1' },
      { role: 'user', content: 'msg2' },
      { role: 'assistant', content: 'reply2' },
      { role: 'user', content: 'msg3' },
    ]
    const result = applySlidingWindow(messages, 2)
    expect(result).toEqual([
      systemMessage,
      { role: 'user', content: 'msg2' },
      { role: 'assistant', content: 'reply2' },
      { role: 'user', content: 'msg3' },
    ])
  })

  test('should return empty conversation with system message for empty input', () => {
    const messages: ChatMessage[] = [systemMessage]
    const result = applySlidingWindow(messages, 5)
    expect(result).toEqual([systemMessage])
  })
})

describe('partitionSlidingWindow', () => {
  const systemMessage: ChatMessage = { role: 'system', content: 'You are a helpful assistant.' }

  test('should return all messages as kept when within window', () => {
    const messages: ChatMessage[] = [
      systemMessage,
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi' },
    ]
    const { kept, dropped } = partitionSlidingWindow(messages, 5)
    expect(kept).toEqual(messages)
    expect(dropped).toEqual([])
  })

  test('should partition messages correctly when exceeding window', () => {
    const messages: ChatMessage[] = [
      systemMessage,
      { role: 'user', content: 'msg1' },
      { role: 'assistant', content: 'reply1' },
      { role: 'user', content: 'msg2' },
      { role: 'assistant', content: 'reply2' },
      { role: 'user', content: 'msg3' },
      { role: 'assistant', content: 'reply3' },
    ]
    const { kept, dropped } = partitionSlidingWindow(messages, 2)

    expect(dropped).toEqual([
      { role: 'user', content: 'msg1' },
      { role: 'assistant', content: 'reply1' },
    ])
    expect(kept).toEqual([
      systemMessage,
      { role: 'user', content: 'msg2' },
      { role: 'assistant', content: 'reply2' },
      { role: 'user', content: 'msg3' },
      { role: 'assistant', content: 'reply3' },
    ])
  })

  test('should preserve system messages in kept set only', () => {
    const messages: ChatMessage[] = [
      systemMessage,
      { role: 'user', content: 'old' },
      { role: 'assistant', content: 'old-reply' },
      { role: 'user', content: 'new' },
      { role: 'assistant', content: 'new-reply' },
    ]
    const { kept, dropped } = partitionSlidingWindow(messages, 1)

    expect(dropped).toEqual([
      { role: 'user', content: 'old' },
      { role: 'assistant', content: 'old-reply' },
    ])
    expect(kept).toEqual([
      systemMessage,
      { role: 'user', content: 'new' },
      { role: 'assistant', content: 'new-reply' },
    ])
  })
})
