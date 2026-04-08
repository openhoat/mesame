import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  clearResponseCache,
  getCachedResponse,
  getResponseCacheStats,
  setCachedResponse,
} from './responseCache.js'

vi.mock('../logger.js', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

describe('responseCache', () => {
  afterEach(() => {
    clearResponseCache()
  })

  const messages = [{ role: 'user' as const, content: 'Hello' }]
  const usage = { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }

  test('should return undefined for cache miss', () => {
    const result = getCachedResponse('model-1', messages)
    expect(result).toBeUndefined()
  })

  test('should return cached response for cache hit', () => {
    setCachedResponse('model-1', messages, 'Hello back!', usage)

    const result = getCachedResponse('model-1', messages)
    expect(result).toBeDefined()
    expect(result?.content).toBe('Hello back!')
    expect(result?.usage).toEqual(usage)
  })

  test('should differentiate by model', () => {
    setCachedResponse('model-1', messages, 'Response A', usage)

    const result = getCachedResponse('model-2', messages)
    expect(result).toBeUndefined()
  })

  test('should differentiate by temperature', () => {
    setCachedResponse('model-1', messages, 'Response A', usage, 0.5)

    expect(getCachedResponse('model-1', messages, 0.5)).toBeDefined()
    expect(getCachedResponse('model-1', messages, 0.7)).toBeUndefined()
  })

  test('should differentiate by max_tokens', () => {
    setCachedResponse('model-1', messages, 'Response A', usage, undefined, 100)

    expect(getCachedResponse('model-1', messages, undefined, 100)).toBeDefined()
    expect(getCachedResponse('model-1', messages, undefined, 200)).toBeUndefined()
  })

  test('should clear cache', () => {
    setCachedResponse('model-1', messages, 'Response', usage)
    expect(getResponseCacheStats().size).toBe(1)

    clearResponseCache()
    expect(getResponseCacheStats().size).toBe(0)
  })

  test('should report cache stats', () => {
    const stats = getResponseCacheStats()
    expect(stats.size).toBe(0)
    expect(stats.maxSize).toBe(200)
  })
})
