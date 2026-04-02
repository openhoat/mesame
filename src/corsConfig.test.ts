import { afterEach, describe, expect, test } from 'vitest'
import { parseCorsOrigin } from './corsConfig.js'

describe('parseCorsOrigin', () => {
  const originalEnv = process.env.CORS_ORIGIN

  afterEach(() => {
    // Restore original env
    if (originalEnv === undefined) {
      delete process.env.CORS_ORIGIN
    } else {
      process.env.CORS_ORIGIN = originalEnv
    }
  })

  test('should return true when CORS_ORIGIN is not set', () => {
    delete process.env.CORS_ORIGIN
    expect(parseCorsOrigin()).toBe(true)
  })

  test('should return true when CORS_ORIGIN is wildcard', () => {
    process.env.CORS_ORIGIN = '*'
    expect(parseCorsOrigin()).toBe(true)
  })

  test('should return single origin as string', () => {
    process.env.CORS_ORIGIN = 'https://app.mesame.com'
    expect(parseCorsOrigin()).toBe('https://app.mesame.com')
  })

  test('should return multiple origins as array', () => {
    process.env.CORS_ORIGIN = 'https://app.mesame.com,https://admin.mesame.com'
    expect(parseCorsOrigin()).toEqual(['https://app.mesame.com', 'https://admin.mesame.com'])
  })

  test('should trim whitespace from origins', () => {
    process.env.CORS_ORIGIN = 'https://app.mesame.com , https://admin.mesame.com '
    expect(parseCorsOrigin()).toEqual(['https://app.mesame.com', 'https://admin.mesame.com'])
  })

  test('should filter empty origins', () => {
    process.env.CORS_ORIGIN = 'https://app.mesame.com,,https://admin.mesame.com'
    expect(parseCorsOrigin()).toEqual(['https://app.mesame.com', 'https://admin.mesame.com'])
  })
})
