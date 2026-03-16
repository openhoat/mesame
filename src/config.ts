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
}

function getProviderApiKey(provider: Provider): string | undefined {
  const config = PROVIDER_CONFIGS[provider]
  if (!config.requiresApiKey) return undefined
  return process.env[config.apiKeyEnvVar]
}

function parseProvider(value: string | undefined): Provider {
  if (!value) return 'openai'
  if (['openai', 'anthropic', 'google', 'ollama'].includes(value)) {
    return value as Provider
  }
  throw new Error(`Unknown provider: ${value}. Valid providers: openai, anthropic, google, ollama`)
}

export function loadConfig(): AppConfig {
  const provider = parseProvider(process.env.MESAME_PROVIDER)
  const providerConfig = PROVIDER_CONFIGS[provider]

  return {
    port: Number(process.env.MESAME_PORT) || 3000,
    host: process.env.MESAME_HOST ?? 'localhost',
    provider,
    targetBaseUrl: process.env.MESAME_TARGET_BASE_URL ?? providerConfig.defaultBaseUrl,
    targetApiKey: getProviderApiKey(provider),
    model: process.env.MESAME_MODEL ?? 'gpt-4o',
    logLevel: process.env.MESAME_LOG_LEVEL ?? 'info',
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
