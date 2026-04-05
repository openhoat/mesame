import { afterEach, describe, expect, test, vi } from 'vitest'
import { buildApp } from './app.js'

vi.mock('./services/styleProfileService.js', () => ({
  ensureDefaultProfile: vi.fn().mockResolvedValue(undefined),
}))

// Mock userSettingsService
vi.mock('./services/userSettingsService.js', () => ({
  getUserSettings: vi.fn().mockResolvedValue({
    id: 1,
    language: null,
    llmUrl: null,
    logLevel: null,
    optimizationsEnabled: false,
    slidingWindowSize: 10,
  }),
}))

describe('app', () => {
  let app: Awaited<ReturnType<typeof buildApp>>

  afterEach(async () => {
    await app.close()
  })

  test('should return status ok on GET /health', async () => {
    app = await buildApp()

    const response = await app.inject({
      method: 'GET',
      url: '/health',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ status: 'ok' })
  })
})
