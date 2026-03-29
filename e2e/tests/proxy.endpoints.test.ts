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
      const request = page.context().request
      const response = await apiRequest(request, `http://localhost:${port}/health`)

      expect(response.status).toBe(200)
    })
  })

  test.describe('Models Endpoint', () => {
    test('should return available models list', async ({ page, port }) => {
      const request = page.context().request
      const response = await apiRequest<{
        object?: string
        data?: Array<{ id?: string; object?: string; created?: number; owned_by?: string }>
      }>(request, `http://localhost:${port}/v1/models`)

      expect(response.status).toBe(200)

      const body = response.body
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

  test.describe('Config Endpoint', () => {
    test('should return configuration', async ({ page, port }) => {
      const request = page.context().request
      const response = await apiRequest<{
        provider?: string
        model?: string
        logLevel?: string
      }>(request, `http://localhost:${port}/v1/config`)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('provider')
      expect(response.body).toHaveProperty('model')
    })
  })

  test.describe('Error Handling', () => {
    test('should return 404 for unknown routes', async ({ page, port }) => {
      const request = page.context().request
      const response = await apiRequest(request, `http://localhost:${port}/unknown-route`)

      expect(response.status).toBe(404)
    })

    test('should handle invalid JSON in request body', async ({ page, port }) => {
      const request = page.context().request
      const response = await request.fetch(`http://localhost:${port}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: 'invalid json',
      })

      // Should either reject or handle gracefully
      expect([400, 500]).toContain(response.status())
    })
  })
})
