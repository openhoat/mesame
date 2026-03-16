import { afterEach, describe, expect, test, vi } from 'vitest'

describe('config', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = originalEnv
    vi.resetModules()
  })

  test('should use default values when env vars are not set', async () => {
    process.env = { ...originalEnv }
    delete process.env.PORT
    delete process.env.HOST
    delete process.env.TARGET_BASE_URL
    delete process.env.TARGET_API_KEY
    delete process.env.LOG_LEVEL

    const { loadConfig } = await import('./config.js')
    const cfg = loadConfig()

    expect(cfg.port).toBe(3000)
    expect(cfg.host).toBe('127.0.0.1')
    expect(cfg.targetBaseUrl).toBe('https://api.openai.com')
    expect(cfg.targetApiKey).toBeUndefined()
    expect(cfg.logLevel).toBe('info')
  })

  test('should read values from environment variables', async () => {
    process.env = {
      ...originalEnv,
      PORT: '8080',
      HOST: '0.0.0.0',
      TARGET_BASE_URL: 'https://custom.api.com',
      TARGET_API_KEY: 'sk-test-key',
      LOG_LEVEL: 'debug',
    }

    const { loadConfig } = await import('./config.js')
    const cfg = loadConfig()

    expect(cfg.port).toBe(8080)
    expect(cfg.host).toBe('0.0.0.0')
    expect(cfg.targetBaseUrl).toBe('https://custom.api.com')
    expect(cfg.targetApiKey).toBe('sk-test-key')
    expect(cfg.logLevel).toBe('debug')
  })
})
