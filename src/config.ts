export type Provider = 'openai' | 'anthropic' | 'google' | 'ollama'

export interface ProviderConfig {
  name: string
  defaultBaseUrl: string
  apiKeyEnvVar: string
  requiresApiKey: boolean
}

const PROVIDER_CONFIGS: Record<Provider, ProviderConfig> = {
  openai: {
    name: 'OpenAI',
    defaultBaseUrl: 'https://api.openai.com',
    apiKeyEnvVar: 'OPENAI_API_KEY',
    requiresApiKey: true,
  },
  anthropic: {
    name: 'Anthropic',
    defaultBaseUrl: 'https://api.anthropic.com',
    apiKeyEnvVar: 'ANTHROPIC_API_KEY',
    requiresApiKey: true,
  },
  google: {
    name: 'Google',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com',
    apiKeyEnvVar: 'GOOGLE_API_KEY',
    requiresApiKey: true,
  },
  ollama: {
    name: 'Ollama',
    defaultBaseUrl: 'http://localhost:11434',
    apiKeyEnvVar: '',
    requiresApiKey: false,
  },
}

export interface AppConfig {
  port: number
  host: string
  provider: Provider
  targetBaseUrl: string
  targetApiKey: string | undefined
  model: string
  logLevel: string
  language: string
}

function getProviderApiKey(provider: Provider): string | undefined {
  const config = PROVIDER_CONFIGS[provider]
  if (!config.requiresApiKey) return undefined
  return process.env[config.apiKeyEnvVar]
}

function parseProvider(value: string | undefined): Provider {
  if (!value) return 'ollama'
  if (['openai', 'anthropic', 'google', 'ollama'].includes(value)) {
    return value as Provider
  }
  throw new Error(`Unknown provider: ${value}. Valid providers: openai, anthropic, google, ollama`)
}

function detectLanguage(): string {
  if (process.env.MESAME_LANGUAGE) {
    return process.env.MESAME_LANGUAGE
  }

  // Try to extract language from LANG (e.g., "fr_FR.UTF-8" -> "fr")
  const lang = process.env.LANG || process.env.LC_ALL
  if (lang) {
    const parts = lang.split('_')[0]
    if (parts) {
      const languageCode = parts.split('.')[0]?.toLowerCase()
      if (languageCode) {
        return languageCode
      }
    }
  }

  return 'en'
}

export function loadConfig(): AppConfig {
  const provider = parseProvider(process.env.MESAME_PROVIDER)
  const providerConfig = PROVIDER_CONFIGS[provider]

  // Default model based on provider
  const defaultModel = provider === 'ollama' ? 'gemma3:1b' : 'gpt-4o'

  return {
    port: Number(process.env.MESAME_PORT) || 3000,
    host: process.env.MESAME_HOST ?? 'localhost',
    provider,
    targetBaseUrl: process.env.MESAME_TARGET_BASE_URL ?? providerConfig.defaultBaseUrl,
    targetApiKey: getProviderApiKey(provider),
    model: process.env.MESAME_MODEL ?? defaultModel,
    logLevel: process.env.MESAME_LOG_LEVEL ?? 'info',
    language: detectLanguage(),
  }
}

// Lazy-loaded config singleton
let _config: AppConfig | undefined

export function getConfig(): AppConfig {
  if (!_config) {
    _config = loadConfig()
  }
  return _config
}

// Reset config (useful for testing)
export function resetConfig(): void {
  _config = undefined
}

// Lazy config proxy - defers loading until first access
// This prevents errors at module import time for invalid MESAME_PROVIDER values
export const config: AppConfig = new Proxy({} as AppConfig, {
  get(_, prop: keyof AppConfig) {
    return getConfig()[prop]
  },
})
