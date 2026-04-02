/**
 * Provider types for multi-provider support
 */

/**
 * Provider type identifiers
 */
export type ProviderType = 'openai' | 'anthropic' | 'google' | 'ollama' | 'mock'

/**
 * Provider type metadata
 */
export interface ProviderTypeInfo {
  type: ProviderType
  displayName: string
  defaultBaseUrl: string
  requiresApiKey: boolean
}

/**
 * Supported provider types with their metadata
 */
export const PROVIDER_TYPES: Record<ProviderType, ProviderTypeInfo> = {
  openai: {
    type: 'openai',
    displayName: 'OpenAI',
    defaultBaseUrl: 'https://api.openai.com',
    requiresApiKey: true,
  },
  anthropic: {
    type: 'anthropic',
    displayName: 'Anthropic',
    defaultBaseUrl: 'https://api.anthropic.com',
    requiresApiKey: true,
  },
  google: {
    type: 'google',
    displayName: 'Google',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com',
    requiresApiKey: true,
  },
  ollama: {
    type: 'ollama',
    displayName: 'Ollama',
    defaultBaseUrl: 'http://localhost:11434',
    requiresApiKey: false,
  },
  mock: {
    type: 'mock',
    displayName: 'Mock Provider',
    defaultBaseUrl: 'http://localhost:3001',
    requiresApiKey: false,
  },
}

/**
 * Provider configuration stored in database
 */
export interface Provider {
  id: number
  type: ProviderType
  name: string
  displayName: string
  baseUrl: string
  apiKey: string | null
  enabled: boolean
  priority: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Provider configuration for API requests
 */
export interface ProviderConfig {
  type: ProviderType
  name: string
  displayName: string
  baseUrl: string
  apiKey?: string
  enabled: boolean
  priority: number
}

/**
 * Provider response for API endpoints
 */
export interface ProviderResponse {
  type: ProviderType
  name: string
  displayName: string
  baseUrl: string
  enabled: boolean
  hasApiKey?: boolean
  modelsCount?: number
}

/**
 * Model ID with provider prefix
 * Format: "provider/model-name" (e.g., "openai/gpt-4o", "ollama/llama3.2")
 */
export interface ParsedModelId {
  provider: string
  model: string
  original: string
}

/**
 * Parse model ID to extract provider and model name
 * @param modelId - Model ID in format "provider/model" or just "model"
 * @param defaultProvider - Default provider to use if no prefix
 * @returns Parsed model ID
 */
export const parseModelId = (modelId: string, defaultProvider: string): ParsedModelId => {
  const parts = modelId.split('/')

  if (parts.length === 2) {
    return {
      provider: parts[0] ?? '',
      model: parts[1] ?? '',
      original: modelId,
    }
  }

  // No prefix, use default provider
  return {
    provider: defaultProvider,
    model: modelId,
    original: modelId,
  }
}

/**
 * Create model ID from provider and model name
 * @param provider - Provider name
 * @param model - Model name
 * @returns Model ID in format "provider/model"
 */
export const createModelId = (provider: string, model: string): string => {
  return `${provider}/${model}`
}
