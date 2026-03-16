import { afterEach, describe, expect, test } from 'vitest'
import { buildApp } from './app.js'

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
