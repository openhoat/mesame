import { afterEach, describe, expect, test, vi } from 'vitest'
import { buildApp } from './app.js'

vi.mock('./services/styleProfileService.js', () => ({
  ensureDefaultProfile: vi.fn().mockResolvedValue(undefined),
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
