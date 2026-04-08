import { AIMessage, AIMessageChunk } from '@langchain/core/messages'
import { describe, expect, test } from 'vitest'
import { extractStreamingTokenUsage, extractTokenUsage } from './tokenUsage.js'

describe('tokenUsage', () => {
  describe('extractTokenUsage', () => {
    test('should extract from LangChain usage_metadata', () => {
      const msg = new AIMessage({ content: 'test' })
      msg.usage_metadata = { input_tokens: 10, output_tokens: 20, total_tokens: 30 }

      const usage = extractTokenUsage(msg)
      expect(usage).toEqual({
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30,
      })
    })

    test('should extract from Anthropic response_metadata.usage', () => {
      const msg = new AIMessage({ content: 'test' })
      msg.response_metadata = {
        usage: {
          input_tokens: 15,
          output_tokens: 25,
          cache_creation_input_tokens: 5,
          cache_read_input_tokens: 3,
        },
      }

      const usage = extractTokenUsage(msg)
      expect(usage).toEqual({
        prompt_tokens: 15,
        completion_tokens: 25,
        total_tokens: 40,
        cache_creation_input_tokens: 5,
        cache_read_input_tokens: 3,
      })
    })

    test('should extract from OpenAI response_metadata.tokenUsage', () => {
      const msg = new AIMessage({ content: 'test' })
      msg.response_metadata = {
        tokenUsage: {
          promptTokens: 12,
          completionTokens: 22,
          totalTokens: 34,
        },
      }

      const usage = extractTokenUsage(msg)
      expect(usage).toEqual({
        prompt_tokens: 12,
        completion_tokens: 22,
        total_tokens: 34,
      })
    })

    test('should return zeros when no usage metadata available', () => {
      const msg = new AIMessage({ content: 'test' })

      const usage = extractTokenUsage(msg)
      expect(usage).toEqual({
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      })
    })

    test('should prefer usage_metadata over response_metadata', () => {
      const msg = new AIMessage({ content: 'test' })
      msg.usage_metadata = { input_tokens: 100, output_tokens: 200, total_tokens: 300 }
      msg.response_metadata = {
        tokenUsage: { promptTokens: 1, completionTokens: 2, totalTokens: 3 },
      }

      const usage = extractTokenUsage(msg)
      expect(usage.prompt_tokens).toBe(100)
    })
  })

  describe('extractStreamingTokenUsage', () => {
    test('should extract usage from chunk with usage_metadata', () => {
      const chunk = new AIMessageChunk({ content: '' })
      chunk.usage_metadata = { input_tokens: 50, output_tokens: 60, total_tokens: 110 }

      const usage = extractStreamingTokenUsage(chunk)
      expect(usage).toEqual({
        prompt_tokens: 50,
        completion_tokens: 60,
        total_tokens: 110,
      })
    })

    test('should return undefined when no usage metadata', () => {
      const chunk = new AIMessageChunk({ content: 'hello' })

      const usage = extractStreamingTokenUsage(chunk)
      expect(usage).toBeUndefined()
    })
  })
})
