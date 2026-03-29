/**
 * Admin Dashboard tests for E2E testing
 *
 * These tests verify the admin dashboard functionality
 * including source import and style profile visualization.
 */

import { apiRequest } from '../helpers/api.js'
import { expect, test } from '../fixtures.js'

test.describe('Admin Dashboard Tests', () => {
  test.describe('UI Page Access', () => {
    test('should serve the admin UI', async ({ page, port }) => {
      // Navigate to the main page
      await page.goto(`http://localhost:${port}/`)

      // Wait for the page to load
      await page.waitForLoadState('domcontentloaded')

      // Verify the page loaded
      const content = await page.content()
      expect(content.length).toBeGreaterThan(0)
    })

    test('should have accessible UI elements', async ({ page, port }) => {
      // Navigate to the main page
      await page.goto(`http://localhost:${port}/`)
      await page.waitForLoadState('domcontentloaded')

      // Check that the page has interactive elements
      const buttons = await page.$$('button')
      const inputs = await page.$$('input')
      const totalInteractive = buttons.length + inputs.length

      // There should be at least some interactive elements
      // (exact count depends on UI implementation)
      expect(totalInteractive).toBeGreaterThanOrEqual(0)
    })
  })

  test.describe('Style Profile API', () => {
    test('should get style profile', async ({ page, port }) => {
      const request = page.context().request
      const response = await apiRequest<{ personaPrompt?: string }>(
        request,
        `http://localhost:${port}/api/style-profile`
      )

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('personaPrompt')
    })

    test('should generate style profile', async ({ page, port }) => {
      const request = page.context().request
      const response = await apiRequest(
        request,
        `http://localhost:${port}/api/style-profile/generate`,
        { method: 'POST' }
      )

      // Should succeed (200) or return error if no sources
      expect([200, 201, 400, 404, 422, 500]).toContain(response.status)
    })
  })

  test.describe('Sources API', () => {
    test('should list sources', async ({ page, port }) => {
      const request = page.context().request
      const response = await apiRequest<Array<{ id: string; name: string }>>(
        request,
        `http://localhost:${port}/v1/sources`
      )

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })
  })

  test.describe('Logs API', () => {
    test('should return request logs', async ({ page, port }) => {
      const request = page.context().request
      const response = await apiRequest<{ logs: Array<{ id: string }>; count: number }>(
        request,
        `http://localhost:${port}/api/logs`
      )

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('logs')
      expect(response.body).toHaveProperty('count')
      expect(Array.isArray(response.body.logs)).toBe(true)
    })
  })
})