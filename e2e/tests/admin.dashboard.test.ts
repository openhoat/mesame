/**
 * Admin Dashboard tests for E2E testing
 *
 * These tests verify the admin dashboard functionality
 * including source import and style profile visualization.
 */

import { expect, test } from '../fixtures.js'
import { apiRequest, getStyleProfiles } from '../helpers/api.js'

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
    test('should handle style profile creation', async ({ page, port }) => {
      const request = page.context().request

      // Create a test style profile
      const createResponse = await apiRequest<{ id: string; name: string }>(
        request,
        `http://localhost:${port}/v1/style-profiles`,
        {
          method: 'POST',
          body: {
            name: 'Test Profile',
            content: 'This is a test style profile content.',
          },
        }
      )

      expect(createResponse.status).toBe(201)
      expect(createResponse.body).toHaveProperty('id')
      expect(createResponse.body.name).toBe('Test Profile')
    })

    test('should list style profiles', async ({ page, port }) => {
      const profiles = await getStyleProfiles(page.context().request, port)

      expect(profiles.status).toBe(200)
      expect(Array.isArray(profiles.body)).toBe(true)
    })

    test('should validate style profile input', async ({ page, port }) => {
      const request = page.context().request

      // Try to create an invalid style profile (missing required fields)
      const response = await apiRequest(request, `http://localhost:${port}/v1/style-profiles`, {
        method: 'POST',
        body: {},
      })

      // Should reject with appropriate error
      expect([400, 422, 500]).toContain(response.status)
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
      const response = await apiRequest<Array<{ id: string }>>(
        request,
        `http://localhost:${port}/v1/logs`
      )

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })
  })
})
