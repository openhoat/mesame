import { describe, expect, test } from 'vitest'
import type { ChatMessage } from '../types/openai.js'
import { injectStylePrompt, type StyleProfile } from './styleInjector.js'

describe('injectStylePrompt', () => {
  const styleProfile: StyleProfile = {
    personaPrompt: 'You are an AI assistant with a technical and precise style.',
  }

  describe('basic functionality', () => {
    test('should inject default prompt when no style profile is provided', () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi!' },
      ]

      const result = injectStylePrompt(messages, null, 'en')

      // Should inject default system prompt at the beginning
      expect(result).toHaveLength(3)
      expect(result[0]?.role).toBe('system')
      expect(result[0]?.content).toContain('MeSame')
      expect(result[0]?.content).toContain('Language: You MUST respond in English')
      expect(result[1]).toEqual(messages[0])
      expect(result[2]).toEqual(messages[1])
    })

    test('should inject system prompt with language instruction', () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Bonjour' },
        { role: 'assistant', content: 'Salut!' },
      ]

      const result = injectStylePrompt(messages, styleProfile, 'fr')

      expect(result).toHaveLength(3)
      expect(result[0]?.role).toBe('system')
      expect(result[0]?.content).toContain(styleProfile.personaPrompt)
      expect(result[0]?.content).toContain('Language: You MUST respond in French')
      expect(result[1]).toEqual(messages[0])
      expect(result[2]).toEqual(messages[1])
    })

    test('should default to English when no language specified', () => {
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }]

      const result = injectStylePrompt(messages, styleProfile)

      expect(result[0]?.content).toContain('Language: You MUST respond in English')
    })

    test('should support different languages', () => {
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hola' }]

      const result = injectStylePrompt(messages, styleProfile, 'es')

      expect(result[0]?.content).toContain('Language: You MUST respond in Spanish')
    })
  })

  describe('merging with existing system messages', () => {
    test('should merge with existing system message using separator', () => {
      const existingPrompt = 'You are a helpful assistant.'
      const messages: ChatMessage[] = [
        { role: 'system', content: existingPrompt },
        { role: 'user', content: 'Bonjour' },
      ]

      const result = injectStylePrompt(messages, styleProfile, 'fr')

      expect(result).toHaveLength(2)
      expect(result[0]?.role).toBe('system')
      expect(result[0]?.content).toContain(existingPrompt)
      expect(result[0]?.content).toContain('---')
      expect(result[0]?.content).toContain(styleProfile.personaPrompt)
      expect(result[0]?.content).toContain('Language: You MUST respond in French')
      expect(result[1]).toEqual(messages[1])
    })

    test('should not modify user and assistant messages', () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Question 1' },
        { role: 'assistant', content: 'Response 1' },
        { role: 'user', content: 'Question 2' },
      ]

      const result = injectStylePrompt(messages, styleProfile, 'en')

      // Check that user and assistant messages remain unchanged
      expect(result[1]).toEqual(messages[0])
      expect(result[2]).toEqual(messages[1])
      expect(result[3]).toEqual(messages[2])
    })
  })

  describe('edge cases', () => {
    test('should work with single user message', () => {
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }]

      const result = injectStylePrompt(messages, styleProfile, 'en')

      expect(result).toHaveLength(2)
      expect(result[0]?.role).toBe('system')
      expect(result[1]?.role).toBe('user')
    })

    test('should handle complex persona prompt with formatting', () => {
      const complexProfile: StyleProfile = {
        personaPrompt: `You are an AI assistant with a technical style.

Your responses should be:
1. Structured with headers and bullet points
2. Concise but informative
3. Focused on concrete examples`,
      }

      const messages: ChatMessage[] = [{ role: 'user', content: 'Test' }]

      const result = injectStylePrompt(messages, complexProfile, 'fr')

      expect(result[0]?.content).toContain(complexProfile.personaPrompt)
      expect(result[0]?.content).toContain('Language: You MUST respond in French')
    })

    test('should inject default prompt when personaPrompt is empty', () => {
      const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }]

      const result = injectStylePrompt(messages, { personaPrompt: '' }, 'en')

      // Should inject default system prompt
      expect(result[0]?.content).toContain('MeSame')
      expect(result[0]?.content).toContain('Language: You MUST respond in English')
    })
  })
})
