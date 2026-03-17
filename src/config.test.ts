import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

describe('config', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    process.env = originalEnv
    vi.resetModules()
  })

  test('should use default values when env vars are not set', async () => {
    process.env = { ...originalEnv }
    delete process.env.MESAME_PORT
    delete process.env.MESAME_HOST
    delete process.env.MESAME_PROVIDER
    delete process.env.MESAME_TARGET_BASE_URL
    delete process.env.OPENAI_API_KEY
    delete process.env.MESAME_MODEL
    delete process.env.MESAME_LOG_LEVEL

    const { loadConfig } = await import('./config.js')
    const cfg = loadConfig()

    expect(cfg.port).toBe(3000)
    expect(cfg.host).toBe('localhost')
    expect(cfg.provider).toBe('openai')
    expect(cfg.targetBaseUrl).toBe('https://api.openai.com')
    expect(cfg.targetApiKey).toBeUndefined()
    expect(cfg.model).toBe('gpt-4o')
    expect(cfg.logLevel).toBe('info')
  })

  test('should read values from environment variables', async () => {
    process.env = {
      ...originalEnv,
      MESAME_PORT: '8080',
      MESAME_HOST: '0.0.0.0',
      MESAME_PROVIDER: 'openai',
      MESAME_TARGET_BASE_URL: 'https://custom.api.com',
      OPENAI_API_KEY: 'sk-test-key',
      MESAME_MODEL: 'gpt-4',
      MESAME_LOG_LEVEL: 'debug',
    }

    const { loadConfig } = await import('./config.js')
    const cfg = loadConfig()

    expect(cfg.port).toBe(8080)
    expect(cfg.host).toBe('0.0.0.0')
    expect(cfg.provider).toBe('openai')
    expect(cfg.targetBaseUrl).toBe('https://custom.api.com')
    expect(cfg.targetApiKey).toBe('sk-test-key')
    expect(cfg.model).toBe('gpt-4')
    expect(cfg.logLevel).toBe('debug')
  })

  describe('provider configurations', () => {
    test('should configure OpenAI provider', async () => {
      process.env = {
        ...originalEnv,
        MESAME_PROVIDER: 'openai',
        OPENAI_API_KEY: 'sk-openai-key',
      }

      const { loadConfig } = await import('./config.js')
      const cfg = loadConfig()

      expect(cfg.provider).toBe('openai')
      expect(cfg.targetBaseUrl).toBe('https://api.openai.com')
      expect(cfg.targetApiKey).toBe('sk-openai-key')
    })

    test('should configure Anthropic provider', async () => {
      process.env = {
        ...originalEnv,
        MESAME_PROVIDER: 'anthropic',
        ANTHROPIC_API_KEY: 'sk-ant-key',
      }

      const { loadConfig } = await import('./config.js')
      const cfg = loadConfig()

      expect(cfg.provider).toBe('anthropic')
      expect(cfg.targetBaseUrl).toBe('https://api.anthropic.com')
      expect(cfg.targetApiKey).toBe('sk-ant-key')
    })

    test('should configure Google provider', async () => {
      process.env = {
        ...originalEnv,
        MESAME_PROVIDER: 'google',
        GOOGLE_API_KEY: 'google-api-key',
      }

      const { loadConfig } = await import('./config.js')
      const cfg = loadConfig()

      expect(cfg.provider).toBe('google')
      expect(cfg.targetBaseUrl).toBe('https://generativelanguage.googleapis.com')
      expect(cfg.targetApiKey).toBe('google-api-key')
    })

    test('should configure Ollama provider (no API key required)', async () => {
      process.env = {
        ...originalEnv,
        MESAME_PROVIDER: 'ollama',
      }

      const { loadConfig } = await import('./config.js')
      const cfg = loadConfig()

      expect(cfg.provider).toBe('ollama')
      expect(cfg.targetBaseUrl).toBe('http://localhost:11434')
      expect(cfg.targetApiKey).toBeUndefined()
    })

    test('should allow custom base URL override', async () => {
      process.env = {
        ...originalEnv,
        MESAME_PROVIDER: 'ollama',
        MESAME_TARGET_BASE_URL: 'http://192.168.1.100:11434',
      }

      const { loadConfig } = await import('./config.js')
      const cfg = loadConfig()

      expect(cfg.targetBaseUrl).toBe('http://192.168.1.100:11434')
    })

    test('should throw error for unknown provider', async () => {
      process.env = {
        ...originalEnv,
        MESAME_PROVIDER: 'unknown-provider',
      }

      const { loadConfig } = await import('./config.js')

      expect(() => loadConfig()).toThrow(
        'Unknown provider: unknown-provider. Valid providers: openai, anthropic, google, ollama'
      )
    })
  })
})
