import { ChatAnthropic } from '@langchain/anthropic'
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { ChatOllama } from '@langchain/ollama'
import { ChatOpenAI } from '@langchain/openai'
import { describe, expect, test, vi } from 'vitest'
import {
  convertToLangChainMessages,
  createChatModel,
  detectProvider,
  getLLMProvider,
} from './llmProvider.js'

vi.mock('../config.js', () => ({
  config: {
    model: 'gpt-4',
    targetApiKey: 'test-key',
    targetBaseUrl: 'https://api.openai.com',
  },
}))

describe('llmProvider', () => {
  describe('detectProvider', () => {
    test('should detect Anthropic provider', () => {
      expect(detectProvider('https://api.anthropic.com')).toBe('anthropic')
    })

    test('should detect Ollama provider from localhost', () => {
      expect(detectProvider('http://localhost:11434')).toBe('ollama')
    })

    test('should detect Ollama provider from URL', () => {
      expect(detectProvider('http://my-ollama-server:11434')).toBe('ollama')
    })

    test('should default to OpenAI provider', () => {
      expect(detectProvider('https://api.openai.com')).toBe('openai')
    })
  })

  describe('createChatModel', () => {
    test('should create ChatOpenAI instance', () => {
      const model = createChatModel('openai')
      expect(model).toBeInstanceOf(ChatOpenAI)
    })

    test('should create ChatAnthropic instance', () => {
      const model = createChatModel('anthropic')
      expect(model).toBeInstanceOf(ChatAnthropic)
    })

    test('should create ChatOllama instance', () => {
      const model = createChatModel('ollama')
      expect(model).toBeInstanceOf(ChatOllama)
    })

    test('should create streaming model when requested', () => {
      const model = createChatModel('openai', true)
      expect(model).toBeInstanceOf(ChatOpenAI)
    })
  })

  describe('getLLMProvider', () => {
    test('should return a chat model instance', () => {
      const model = getLLMProvider()
      expect(model).toBeInstanceOf(ChatOpenAI)
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
