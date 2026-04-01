import { logger } from '../logger.js'
import type { Provider } from '../types/provider.js'
import { createModelId } from '../types/provider.js'
import { getAllProviders } from './providerRegistry.js'

/**
 * OpenAI-compatible model response
 */
export interface DiscoveredModel {
  id: string
  object: 'model'
  created: number
  owned_by: string
}

/**
 * OpenAI-compatible models list response
 */
export interface ModelsResponse {
  object: 'list'
  data: DiscoveredModel[]
}

/**
 * OpenAI-compatible error response
 */
export interface ModelsErrorResponse {
  error: {
    message: string
    type: string
    param: string | null
    code: string
  }
}

/**
 * Ollama API response format
 */
interface OllamaModelResponse {
  models: Array<{
    name: string
    modified_at: string
    size: number
    digest: string
    details?: {
      format?: string
      family?: string
      parameter_size?: string
      quantization_level?: string
    }
  }>
}

/**
 * Static list of known Anthropic models (April 2025)
 * See: https://docs.anthropic.com/en/docs/about-claude/models/all-models
 */
const ANTHROPIC_MODELS: DiscoveredModel[] = [
  // Latest generation (Claude 4.x)
  {
    id: 'claude-opus-4-6',
    object: 'model',
    created: 1743494400, // April 2025
    owned_by: 'anthropic',
  },
  {
    id: 'claude-sonnet-4-6',
    object: 'model',
    created: 1743494400, // April 2025
    owned_by: 'anthropic',
  },
  {
    id: 'claude-haiku-4-5-20251001',
    object: 'model',
    created: 1759315200, // October 2025
    owned_by: 'anthropic',
  },
  // Previous generation (Claude 3.x - still supported)
  {
    id: 'claude-3-7-sonnet-20250219',
    object: 'model',
    created: 1739923200, // February 2025
    owned_by: 'anthropic',
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    object: 'model',
    created: 1729555200, // October 2024
    owned_by: 'anthropic',
  },
  {
    id: 'claude-3-5-haiku-20241022',
    object: 'model',
    created: 1729555200, // October 2024
    owned_by: 'anthropic',
  },
]

/**
 * Static list of known Google models
 */
const GOOGLE_MODELS: DiscoveredModel[] = [
  {
    id: 'gemini-2.5-flash',
    object: 'model',
    created: 1740787200,
    owned_by: 'google',
  },
  {
    id: 'gemini-2.5-pro',
    object: 'model',
    created: 1740787200,
    owned_by: 'google',
  },
  {
    id: 'gemini-2.0-flash',
    object: 'model',
    created: 1735689600,
    owned_by: 'google',
  },
  {
    id: 'gemini-2.0-flash-lite',
    object: 'model',
    created: 1735689600,
    owned_by: 'google',
  },
]

/**
 * Static list for mock provider
 */
const MOCK_MODELS: DiscoveredModel[] = [
  {
    id: 'mock-model',
    object: 'model',
    created: 1704067200,
    owned_by: 'mesame',
  },
]

/**
 * Fetch models from Ollama API
 */
const fetchOllamaModels = async (baseUrl: string): Promise<DiscoveredModel[]> => {
  try {
    const response = await fetch(`${baseUrl}/api/tags`)
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`)
    }
    const data = (await response.json()) as OllamaModelResponse

    return data.models.map(model => ({
      id: model.name,
      object: 'model' as const,
      created: Math.floor(new Date(model.modified_at).getTime() / 1000),
      owned_by: 'ollama',
    }))
  } catch (error) {
    logger.error(`Failed to fetch Ollama models: ${error}`)
    throw error
  }
}

/**
 * Fetch models from OpenAI-compatible API
 */
const fetchOpenAIModels = async (baseUrl: string, apiKey?: string): Promise<DiscoveredModel[]> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`
    }

    const response = await fetch(`${baseUrl}/v1/models`, { headers })
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }
    const data = (await response.json()) as ModelsResponse

    return data.data
  } catch (error) {
    logger.error(`Failed to fetch OpenAI models: ${error}`)
    throw error
  }
}

/**
 * List models from a single provider
 */
export const listProviderModels = async (provider: Provider): Promise<DiscoveredModel[]> => {
  const providerType = provider.type

  switch (providerType) {
    case 'ollama':
      return fetchOllamaModels(provider.baseUrl)

    case 'openai':
      return fetchOpenAIModels(provider.baseUrl, provider.apiKey ?? undefined)

    case 'anthropic':
      return ANTHROPIC_MODELS

    case 'google':
      return GOOGLE_MODELS

    case 'mock':
      return MOCK_MODELS

    default:
      // Unknown provider type - treat as OpenAI-compatible
      logger.warn(`Unknown provider type: ${provider.type}, treating as OpenAI-compatible`)
      return fetchOpenAIModels(provider.baseUrl, provider.apiKey ?? undefined)
  }
}

/**
 * List all models from all enabled providers (with provider prefix)
 */
export const listAllModels = async (): Promise<DiscoveredModel[]> => {
  const providers = await getAllProviders()
  const allModels: DiscoveredModel[] = []

  for (const provider of providers) {
    try {
      const models = await listProviderModels(provider)

      // Add provider prefix to each model ID
      const prefixedModels = models.map(model => ({
        ...model,
        id: createModelId(provider.type, model.id),
      }))

      allModels.push(...prefixedModels)
    } catch (error) {
      logger.error(`Failed to fetch models from provider ${provider.name}: ${error}`)
      // Continue with other providers even if one fails
    }
  }

  return allModels
}

/**
 * List models from a specific provider (without prefix)
 * @deprecated Use listAllModels for multi-provider support
 */
export const listModels = async (
  provider: 'openai' | 'anthropic' | 'google' | 'ollama' | 'mock',
  baseUrl: string,
  apiKey?: string
): Promise<DiscoveredModel[]> => {
  switch (provider) {
    case 'ollama':
      return fetchOllamaModels(baseUrl)

    case 'openai':
      return fetchOpenAIModels(baseUrl, apiKey)

    case 'anthropic':
      return ANTHROPIC_MODELS

    case 'google':
      return GOOGLE_MODELS

    case 'mock':
      return MOCK_MODELS

    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}
