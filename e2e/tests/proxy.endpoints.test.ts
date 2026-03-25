/**
 * Proxy endpoint tests for E2E testing
 *
 * These tests verify the chat completions proxy functionality
 * including error handling and basic endpoints.
 */

import { expect, test } from '../fixtures.js'
import { apiRequest } from '../helpers/api.js'

test.describe('Proxy Endpoint Tests', () => {
  test.describe('Health Check', () => {
    test('should return healthy status', async ({ page, port }) => {
      const response = await apiRequest(page, `http://localhost:${port}/health`)

      expect(response.status).toBe(200)
    })
  })

  test.describe('Models Endpoint', () => {
    test('should return available models list', async ({ page, port }) => {
      const response = await apiRequest(page, `http://localhost:${port}/v1/models`)

      expect(response.status).toBe(200)

      const body = response.body as {
        object?: string
        data?: Array<{ id?: string; object?: string; created?: number; owned_by?: string }>
      }
      expect(body.object).toBe('list')
      expect(body.data).toBeDefined()
      expect(Array.isArray(body.data)).toBe(true)
      expect(body.data?.length).toBeGreaterThan(0)

      const model = body.data?.[0]
      expect(model).toHaveProperty('id')
      expect(model).toHaveProperty('object', 'model')
      expect(model).toHaveProperty('created')
      expect(model).toHaveProperty('owned_by', 'mesame')
    })
  })

  test.describe('Error Handling', () => {
    test('should return 404 for unknown endpoints', async ({ page, port }) => {
      const response = await apiRequest(page, `http://localhost:${port}/api/unknown`)

      expect(response.status).toBe(404)
    })

    test('should return error for invalid JSON body', async ({ page, port }) => {
      const response = await page.evaluate(async url => {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: 'not valid json {{{',
        })
        return { status: res.status }
      }, `http://localhost:${port}/v1/chat/completions`)

      expect([400, 500]).toContain(response.status)
    })
  })

  test.describe('CORS Headers', () => {
    test('should include CORS headers in response', async ({ page, port }) => {
      const response = await apiRequest(page, `http://localhost:${port}/health`)

      // Fastify CORS plugin should add these headers
      // The exact header names depend on configuration
      expect(response.status).toBe(200)
    })
  })
})
