import { ChatAnthropic } from '@langchain/anthropic'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { AIMessage, type BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatOllama } from '@langchain/ollama'
import { ChatOpenAI } from '@langchain/openai'
import { logger } from '../logger.js'
import { parseModelId } from '../types/provider.js'
import { MockChatModel } from './MockChatModel.js'
import { findProviderByType, getDefaultProvider } from './providerRegistry.js'

export type LLMProvider = 'openai' | 'anthropic' | 'ollama' | 'google' | 'mock'

export interface ModelOptions {
  temperature?: number
  maxTokens?: number
}

/**
 * Get the LangChain chat model for a specific provider
 */
export const createChatModelForProvider = (
  providerName: LLMProvider,
  model: string,
  baseUrl: string,
  apiKey: string | null,
  streaming = false,
  options?: ModelOptions
): BaseChatModel => {
  const baseConfig = {
    model,
    streaming,
    ...(options?.temperature !== undefined && { temperature: options.temperature }),
  }

  switch (providerName) {
    case 'mock':
      return new MockChatModel()

    case 'anthropic':
      return new ChatAnthropic({
        ...baseConfig,
        ...(options?.maxTokens !== undefined && { maxTokens: options.maxTokens }),
        anthropicApiKey: apiKey ?? undefined,
        clientOptions: {
          baseURL: baseUrl,
        },
      })

    case 'ollama':
      return new ChatOllama({
        ...baseConfig,
        baseUrl,
      })

    case 'google':
      return new ChatGoogleGenerativeAI({
        ...baseConfig,
        ...(options?.maxTokens !== undefined && { maxOutputTokens: options.maxTokens }),
        apiKey: apiKey ?? undefined,
        // Note: baseUrl is not typically used for Google GenAI, but we keep it for consistency
      })

    default:
      return new ChatOpenAI({
        ...baseConfig,
        ...(options?.maxTokens !== undefined && { maxTokens: options.maxTokens }),
        ...(streaming && { streamUsage: true }),
        openAIApiKey: apiKey ?? undefined,
        configuration: {
          baseURL: baseUrl,
        },
      })
  }
}

/**
 * Get chat model from provider name (for backward compatibility)
 * @deprecated Use getChatModelFromModelId instead
 */
export const getChatModel = (
  providerName: LLMProvider,
  model: string,
  baseUrl: string,
  apiKey: string | null,
  streaming = false
): BaseChatModel => {
  return createChatModelForProvider(providerName, model, baseUrl, apiKey, streaming)
}

/**
 * Get chat model from model ID (with provider prefix)
 * Format: "provider/model-name" or just "model-name" (uses default provider)
 */
export const getChatModelFromModelId = async (
  modelId: string,
  streaming = false,
  options?: ModelOptions
): Promise<BaseChatModel> => {
  // Get default provider for unprefixed models
  const defaultProvider = await getDefaultProvider()

  if (!defaultProvider) {
    throw new Error('No provider configured. Please enable at least one provider.')
  }

  // Parse model ID to extract provider type and model
  const parsed = parseModelId(modelId, defaultProvider.type)

  // Find the provider configuration by type
  const provider = await findProviderByType(parsed.provider)

  if (!provider) {
    throw new Error(`Provider '${parsed.provider}' not found or not enabled`)
  }

  if (!provider.enabled) {
    throw new Error(`Provider '${parsed.provider}' is not enabled`)
  }

  logger.debug(`Using provider ${provider.name} (${provider.type}) with model ${parsed.model}`)

  return createChatModelForProvider(
    provider.type as LLMProvider,
    parsed.model,
    provider.baseUrl,
    provider.apiKey,
    streaming,
    options
  )
}

/**
 * Resolve the provider type for a model ID without creating a model instance.
 */
export const resolveProviderType = async (modelId: string): Promise<LLMProvider> => {
  const defaultProvider = await getDefaultProvider()
  if (!defaultProvider) {
    throw new Error('No provider configured. Please enable at least one provider.')
  }
  return parseModelId(modelId, defaultProvider.type).provider as LLMProvider
}

/**
 * Apply Anthropic prompt caching to system messages.
 * Marks system messages with cache_control for ephemeral caching.
 * For non-Anthropic providers, returns messages unchanged.
 */
export const applyCacheControl = (
  messages: BaseMessage[],
  providerType: LLMProvider
): BaseMessage[] => {
  if (providerType !== 'anthropic') return messages

  return messages.map(msg => {
    if (msg instanceof SystemMessage && typeof msg.content === 'string') {
      return new SystemMessage({
        content: [
          {
            type: 'text' as const,
            text: msg.content,
            cache_control: { type: 'ephemeral' },
          },
        ],
      })
    }
    return msg
  })
}

/**
 * Detect LLM provider type from provider name
 */
export const detectProviderType = (providerName: string): LLMProvider => {
  switch (providerName.toLowerCase()) {
    case 'openai':
      return 'openai'
    case 'anthropic':
      return 'anthropic'
    case 'ollama':
      return 'ollama'
    case 'google':
      return 'google'
    case 'mock':
      return 'mock'
    default:
      return 'openai' // Default to OpenAI-compatible
  }
}

/**
 * Convert OpenAI-style messages to LangChain messages
 */
export const convertToLangChainMessages = (
  messages: Array<{ role: string; content: string }>
): BaseMessage[] => {
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
