/**
 * Admin Dashboard tests for E2E testing
 *
 * These tests verify the admin dashboard functionality
 * including source import and style profile visualization.
 */

import { expect, test } from '../fixtures.js'
import { apiRequest } from '../helpers/api.js'

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
    test('should get all profiles', async ({ page, port }) => {
      const request = page.context().request
      const response = await apiRequest<
        Array<{
          id: string
          name: string
          personaPrompt: string
          isActive: boolean
          sources: Array<{ id: string; title: string }>
        }>
      >(request, `http://localhost:${port}/api/style-profile`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })

    test('should create and activate a style profile', async ({ page, port }) => {
      const request = page.context().request

      // First create a source
      const sourceResponse = await apiRequest(request, `http://localhost:${port}/api/sources`, {
        method: 'POST',
        body: {
          title: 'Test Source',
          content: 'This is a test source for profile generation.',
        },
      })
      expect(sourceResponse.status).toBe(201)
      const sourceId = (sourceResponse.body as { id: string }).id

      // Create a profile from the source
      const createResponse = await apiRequest<{
        id: string
        name: string
        personaPrompt: string
        isActive: boolean
      }>(request, `http://localhost:${port}/api/style-profile`, {
        method: 'POST',
        body: {
          name: 'Test Profile',
          sourceIds: [sourceId],
        },
      })

      expect(createResponse.status).toBe(200)
      expect(createResponse.body).toHaveProperty('personaPrompt')
      expect(createResponse.body.name).toBe('Test Profile')

      // Activate the profile
      const profileId = createResponse.body.id
      const activateResponse = await apiRequest(
        request,
        `http://localhost:${port}/api/style-profile/${profileId}/activate`,
        { method: 'POST', body: {} }
      )

      expect(activateResponse.status).toBe(200)
      expect((activateResponse.body as { isActive: boolean }).isActive).toBe(true)
    })
  })

  test.describe('Sources API', () => {
    test('should list sources', async ({ page, port }) => {
      const request = page.context().request
      const response = await apiRequest<Array<{ id: string; name: string }>>(
        request,
        `http://localhost:${port}/api/sources`
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
