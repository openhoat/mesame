import { ChatAnthropic } from '@langchain/anthropic'
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatOllama } from '@langchain/ollama'
import { ChatOpenAI } from '@langchain/openai'
import { describe, expect, test, vi } from 'vitest'
import {
  applyCacheControl,
  convertToLangChainMessages,
  createChatModelForProvider,
  detectProviderType,
  getChatModel,
} from './llmProvider.js'

vi.mock('../config.js', () => ({
  config: {
    model: 'gpt-4',
    targetApiKey: 'test-key',
    targetBaseUrl: 'https://api.openai.com',
  },
}))

describe('llmProvider', () => {
  describe('detectProviderType', () => {
    test('should detect Anthropic provider', () => {
      expect(detectProviderType('anthropic')).toBe('anthropic')
    })

    test('should detect Ollama provider', () => {
      expect(detectProviderType('ollama')).toBe('ollama')
    })

    test('should detect OpenAI provider', () => {
      expect(detectProviderType('openai')).toBe('openai')
    })

    test('should detect Google provider', () => {
      expect(detectProviderType('google')).toBe('google')
    })

    test('should default to OpenAI for unknown providers', () => {
      expect(detectProviderType('unknown')).toBe('openai')
    })
  })

  describe('createChatModelForProvider', () => {
    test('should create ChatOpenAI instance', () => {
      const model = createChatModelForProvider(
        'openai',
        'gpt-4',
        'https://api.openai.com',
        'test-key',
        false
      )
      expect(model).toBeInstanceOf(ChatOpenAI)
    })

    test('should create ChatAnthropic instance', () => {
      const model = createChatModelForProvider(
        'anthropic',
        'claude-3',
        'https://api.anthropic.com',
        'test-key',
        false
      )
      expect(model).toBeInstanceOf(ChatAnthropic)
    })

    test('should create ChatOllama instance', () => {
      const model = createChatModelForProvider(
        'ollama',
        'llama3',
        'http://localhost:11434',
        null,
        false
      )
      expect(model).toBeInstanceOf(ChatOllama)
    })

    test('should create ChatGoogleGenerativeAI instance', () => {
      const model = createChatModelForProvider(
        'google',
        'gemini-1.5-flash',
        'https://generativelanguage.googleapis.com',
        'test-key',
        false
      )
      expect(model).toBeInstanceOf(ChatGoogleGenerativeAI)
    })

    test('should create streaming model when requested', () => {
      const model = createChatModelForProvider(
        'openai',
        'gpt-4',
        'https://api.openai.com',
        'test-key',
        true
      )
      expect(model).toBeInstanceOf(ChatOpenAI)
    })

    test('should pass temperature and maxTokens options', () => {
      const model = createChatModelForProvider(
        'openai',
        'gpt-4',
        'https://api.openai.com',
        'test-key',
        false,
        { temperature: 0.5, maxTokens: 200 }
      )
      expect(model).toBeInstanceOf(ChatOpenAI)
    })

    test('should pass options to Anthropic provider', () => {
      const model = createChatModelForProvider(
        'anthropic',
        'claude-3',
        'https://api.anthropic.com',
        'test-key',
        false,
        { temperature: 0.8, maxTokens: 500 }
      )
      expect(model).toBeInstanceOf(ChatAnthropic)
    })
  })

  describe('getChatModel', () => {
    test('should return a chat model instance', () => {
      const model = getChatModel('openai', 'gpt-4', 'https://api.openai.com', 'test-key', false)
      expect(model).toBeInstanceOf(ChatOpenAI)
    })
  })

  describe('applyCacheControl', () => {
    test('should add cache_control to system messages for Anthropic', () => {
      const messages = [new SystemMessage('You are helpful'), new HumanMessage('Hello')]
      const result = applyCacheControl(messages, 'anthropic')

      expect(result[0]).toBeInstanceOf(SystemMessage)
      expect(Array.isArray(result[0].content)).toBe(true)
      const content = result[0].content as Array<{
        type: string
        text: string
        cache_control?: unknown
      }>
      expect(content[0].cache_control).toEqual({ type: 'ephemeral' })
      expect(content[0].text).toBe('You are helpful')
      // HumanMessage should be unchanged
      expect(result[1]).toBeInstanceOf(HumanMessage)
      expect(result[1].content).toBe('Hello')
    })

    test('should not modify messages for non-Anthropic providers', () => {
      const messages = [new SystemMessage('You are helpful'), new HumanMessage('Hello')]
      const result = applyCacheControl(messages, 'openai')

      expect(result[0].content).toBe('You are helpful')
      expect(result).toEqual(messages)
    })
  })

  describe('convertToLangChainMessages', () => {
    test('should convert system message', () => {
      const messages = convertToLangChainMessages([{ role: 'system', content: 'You are helpful' }])
      expect(messages).toHaveLength(1)
      expect(messages[0]).toBeInstanceOf(SystemMessage)
      expect(messages[0].content).toBe('You are helpful')
    })

    test('should convert user message', () => {
      const messages = convertToLangChainMessages([{ role: 'user', content: 'Hello' }])
      expect(messages).toHaveLength(1)
      expect(messages[0]).toBeInstanceOf(HumanMessage)
      expect(messages[0].content).toBe('Hello')
    })

    test('should convert assistant message', () => {
      const messages = convertToLangChainMessages([{ role: 'assistant', content: 'Hi there' }])
      expect(messages).toHaveLength(1)
      expect(messages[0]).toBeInstanceOf(AIMessage)
      expect(messages[0].content).toBe('Hi there')
    })

    test('should convert multiple messages', () => {
      const messages = convertToLangChainMessages([
        { role: 'system', content: 'You are helpful' },
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi' },
      ])
      expect(messages).toHaveLength(3)
      expect(messages[0]).toBeInstanceOf(SystemMessage)
      expect(messages[1]).toBeInstanceOf(HumanMessage)
      expect(messages[2]).toBeInstanceOf(AIMessage)
    })
  })
})
