import { ChatAnthropic } from '@langchain/anthropic'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { AIMessage, type BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { ChatOllama } from '@langchain/ollama'
import { ChatOpenAI } from '@langchain/openai'
import { config } from '../config.js'
import { MockChatModel } from './MockChatModel.js'

export type LLMProvider = 'openai' | 'anthropic' | 'ollama' | 'mock'

/**
 * Detect the LLM provider based on configuration
 * If MESAME_PROVIDER is set to 'mock', use mock provider
 * Otherwise detect based on the target base URL
 */
export function detectProvider(baseUrl: string): LLMProvider {
  // Check if mock provider is explicitly set
  if (config.provider === 'mock') {
    return 'mock'
  }

  const url = baseUrl.toLowerCase()
  if (url.includes('anthropic.com')) {
    return 'anthropic'
  }
  if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('ollama')) {
    return 'ollama'
  }
  return 'openai'
}

/**
 * Create a LangChain chat model instance based on the detected provider
 */
export function createChatModel(provider: LLMProvider, streaming = false): BaseChatModel {
  const baseConfig = {
    model: config.model,
    streaming,
  }

  switch (provider) {
    case 'mock':
      return new MockChatModel()

    case 'anthropic':
      return new ChatAnthropic({
        ...baseConfig,
        anthropicApiKey: config.targetApiKey,
        clientOptions: {
          baseURL: config.targetBaseUrl,
        },
      })

    case 'ollama':
      return new ChatOllama({
        ...baseConfig,
        baseUrl: config.targetBaseUrl,
      })
    default:
      return new ChatOpenAI({
        ...baseConfig,
        openAIApiKey: config.targetApiKey,
        configuration: {
          baseURL: config.targetBaseUrl,
        },
      })
  }
}

/**
 * Get the active LLM provider instance
 */
export function getLLMProvider(streaming = false): BaseChatModel {
  const provider = detectProvider(config.targetBaseUrl)
  return createChatModel(provider, streaming)
}

/**
 * Convert OpenAI-style messages to LangChain messages
 */
export function convertToLangChainMessages(
  messages: Array<{ role: string; content: string }>
): BaseMessage[] {
  return messages.map(msg => {
    switch (msg.role) {
      case 'system':
        return new SystemMessage(msg.content)
      case 'assistant':
        return new AIMessage(msg.content)
      default:
        return new HumanMessage(msg.content)
    }
  })
}
