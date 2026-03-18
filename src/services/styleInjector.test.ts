import { describe, expect, test } from 'vitest'
import type { ChatMessage } from '../types/openai.js'
import { injectStylePrompt, type StyleProfile } from './styleInjector.js'

describe('injectStylePrompt', () => {
  const styleProfile: StyleProfile = {
    personaPrompt: 'Tu es un assistant IA qui répond dans un style technique et précis.',
  }

  test('should inject default prompt when no style profile is provided', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: 'Bonjour' },
      { role: 'assistant', content: 'Salut!' },
    ]

    const result = injectStylePrompt(messages, null)

    // Should inject default system prompt at the beginning
    expect(result).toHaveLength(3)
    expect(result[0]?.role).toBe('system')
    expect(result[0]?.content).toContain('MeSame')
    expect(result[1]).toEqual(messages[0])
    expect(result[2]).toEqual(messages[1])
  })

  test('should inject default prompt when personaPrompt is empty', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: 'Bonjour' },
      { role: 'assistant', content: 'Salut!' },
    ]

    const result = injectStylePrompt(messages, { personaPrompt: '' })

    // Should inject default system prompt at the beginning
    expect(result).toHaveLength(3)
    expect(result[0]?.role).toBe('system')
    expect(result[0]?.content).toContain('MeSame')
    expect(result[1]).toEqual(messages[0])
    expect(result[2]).toEqual(messages[1])
  })

  test('should inject system prompt at the beginning when no system message exists', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: 'Bonjour' },
      { role: 'assistant', content: 'Salut!' },
    ]

    const result = injectStylePrompt(messages, styleProfile)

    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ role: 'system', content: styleProfile.personaPrompt })
    expect(result[1]).toEqual(messages[0])
    expect(result[2]).toEqual(messages[1])
  })

  test('should merge with existing system message using separator', () => {
    const existingPrompt = 'You are a helpful assistant.'
    const messages: ChatMessage[] = [
      { role: 'system', content: existingPrompt },
      { role: 'user', content: 'Bonjour' },
    ]

    const result = injectStylePrompt(messages, styleProfile)

    expect(result).toHaveLength(2)
    expect(result[0]?.role).toBe('system')
    expect(result[0]?.content).toBe(`${existingPrompt}\n\n---\n\n${styleProfile.personaPrompt}`)
    expect(result[1]).toEqual(messages[1])
  })

  test('should not modify user and assistant messages', () => {
    const messages: ChatMessage[] = [
      { role: 'user', content: 'Question 1' },
      { role: 'assistant', content: 'Réponse 1' },
      { role: 'user', content: 'Question 2' },
    ]

    const result = injectStylePrompt(messages, styleProfile)

    // Check that user and assistant messages remain unchanged
    expect(result[1]).toEqual(messages[0])
    expect(result[2]).toEqual(messages[1])
    expect(result[3]).toEqual(messages[2])
  })

  test('should preserve other message properties', () => {
    const messages: ChatMessage[] = [{ role: 'user', content: 'Test' }]

    const result = injectStylePrompt(messages, styleProfile)

    expect(result[0]).toHaveProperty('role', 'system')
    expect(result[0]).toHaveProperty('content')
  })

  test('should work with single user message', () => {
    const messages: ChatMessage[] = [{ role: 'user', content: 'Hello' }]

    const result = injectStylePrompt(messages, styleProfile)

    expect(result).toHaveLength(2)
    expect(result[0]?.role).toBe('system')
    expect(result[1]?.role).toBe('user')
  })

  test('should handle complex persona prompt with formatting', () => {
    const complexProfile: StyleProfile = {
      personaPrompt: `Tu es un assistant IA qui répond dans un style technique et précis.

Tes réponses doivent être:
1. Structurées avec des titres et des listes à puces
2. Concises mais informatives
3. Axées sur des exemples concrets`,
    }

    const messages: ChatMessage[] = [{ role: 'user', content: 'Test' }]

    const result = injectStylePrompt(messages, complexProfile)

    expect(result[0]?.content).toBe(complexProfile.personaPrompt)
  })
})
