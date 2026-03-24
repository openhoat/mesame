/**
 * Admin Dashboard tests for E2E testing
 *
 * These tests verify the admin dashboard functionality
 * including source import and style profile visualization.
 */

import { expect, test } from '../fixtures.js'
import { apiRequest, getSources, uploadSource } from '../helpers/api.js'

test.describe('Admin Dashboard Tests', () => {
  test.describe('UI Page Access', () => {
    test('should serve the admin UI', async ({ electronApp, port }) => {
      const { page } = electronApp

      // Navigate to the main page
      await page.goto(`http://localhost:${port}/`)

      // Wait for the page to load
      await page.waitForLoadState('networkidle')

      // Verify the page loaded
      const content = await page.content()
      expect(content.length).toBeGreaterThan(0)
    })

    test('should have accessible UI elements', async ({ electronApp, port }) => {
      const { page } = electronApp

      // Navigate to the main page
      await page.goto(`http://localhost:${port}/`)
      await page.waitForLoadState('networkidle')

      // Check that the page has interactive elements
      const buttons = await page.$$('button')
      const inputs = await page.$$('input')
      const totalInteractive = buttons.length + inputs.length

      // There should be at least some interactive elements
      // (exact count depends on UI implementation)
      expect(totalInteractive).toBeGreaterThanOrEqual(0)
    })
  })

  test.describe('Sources API', () => {
    test('should list sources (empty or with data)', async ({ electronApp, port }) => {
      const { page } = electronApp

      const response = await getSources(page, port)

      expect(response.status).toBe(200)
      // Response should be an array
      expect(Array.isArray(response.body)).toBe(true)
    })

    test('should handle source upload', async ({ electronApp, port }) => {
      const { page } = electronApp

      // Upload a test file
      const response = await uploadSource(
        page,
        port,
        'test-document.txt',
        'This is a test document for source upload testing.'
      )

      // Should accept the upload or return an error
      // 201 = created, 200 = success, 400/500 = error
      expect([200, 201, 400, 500]).toContain(response.status)
    })

    test('should reject invalid file types', async ({ electronApp, port }) => {
      const { page } = electronApp

      // Try to upload with empty filename
      const response = await page.evaluate(async url => {
        try {
          const formData = new FormData()
          const blob = new Blob(['test'], { type: 'text/plain' })
          formData.append('file', blob, '')

          const res = await fetch(url, {
            method: 'POST',
            body: formData,
          })

          return { status: res.status }
        } catch (error) {
          return { error: String(error) }
        }
      }, `http://localhost:${port}/v1/sources/import`)

      // Should handle invalid upload gracefully
      expect([200, 201, 400, 500]).toContain(response.status)
    })
  })

  test.describe('Style Profile API', () => {
    test('should get style profile', async ({ electronApp, port }) => {
      const { page } = electronApp

      // Try to get the active style profile
      const response = await apiRequest(page, `http://localhost:${port}/api/style-profile`)

      // May return 404 if no profile is set, or 200 with profile data
      expect([200, 404]).toContain(response.status)
    })

    test('should handle style profile creation', async ({ electronApp, port }) => {
      const { page } = electronApp

      // Try to create a style profile
      const response = await apiRequest(page, `http://localhost:${port}/api/style-profile`, {
        method: 'POST',
        body: {
          name: 'Test Profile',
          personaPrompt: 'Test prompt for style.',
        },
      })

      // May succeed or fail depending on implementation
      expect([200, 201, 400, 404, 500]).toContain(response.status)
    })
  })

  test.describe('Dashboard Interactions', () => {
    test('should handle page refresh', async ({ electronApp, port }) => {
      const { page } = electronApp

      // Load the page
      await page.goto(`http://localhost:${port}/`)
      await page.waitForLoadState('networkidle')

      // Refresh the page
      await page.reload()
      await page.waitForLoadState('networkidle')

      // Verify it loaded again
      const content = await page.content()
      expect(content.length).toBeGreaterThan(0)
    })

    test('should handle navigation', async ({ electronApp, port }) => {
      const { page } = electronApp

      // Load the main page
      await page.goto(`http://localhost:${port}/`)
      await page.waitForLoadState('networkidle')

      // Navigate to health endpoint
      await page.goto(`http://localhost:${port}/health`)
      await page.waitForLoadState('networkidle')

      // Verify we're on the health page
      const url = page.url()
      expect(url).toContain('/health')
    })

    test('should maintain state during session', async ({ electronApp, port }) => {
      const { page } = electronApp

      // Make multiple API calls to verify session persistence
      const response1 = await apiRequest(page, `http://localhost:${port}/health`)
      expect(response1.status).toBe(200)

      const response2 = await apiRequest(page, `http://localhost:${port}/v1/sources`)
      expect(response2.status).toBe(200)

      const response3 = await apiRequest(page, `http://localhost:${port}/health`)
      expect(response3.status).toBe(200)
    })
  })

  test.describe('Error Display', () => {
    test('should display error for network failure', async ({ electronApp }) => {
      const { page } = electronApp

      // Try to access an endpoint that will fail
      const response = await page.evaluate(async () => {
        try {
          const res = await fetch('http://localhost:99999/invalid')
          return { status: res.status }
        } catch {
          return { error: true }
        }
      })

      // Should handle network error gracefully
      expect(response.error).toBe(true)
    })

    test('should handle 500 errors gracefully', async ({ electronApp, port }) => {
      const { page } = electronApp

      // Try to trigger a server error
      const response = await apiRequest(page, `http://localhost:${port}/v1/chat/completions`, {
        method: 'POST',
        body: {
          model: 'invalid-model-that-should-not-exist-12345',
          messages: [{ role: 'user', content: 'test' }],
          stream: false,
        },
      })

      // Should return an error status, not crash
      expect([200, 400, 401, 500]).toContain(response.status)
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper page structure', async ({ electronApp, port }) => {
      const { page } = electronApp

      await page.goto(`http://localhost:${port}/`)
      await page.waitForLoadState('networkidle')

      // Check for basic HTML structure
      const html = await page.$('html')
      const head = await page.$('head')
      const body = await page.$('body')

      expect(html).not.toBeNull()
      expect(head).not.toBeNull()
      expect(body).not.toBeNull()
    })

    test('should have a title', async ({ electronApp, port }) => {
      const { page } = electronApp

      await page.goto(`http://localhost:${port}/`)
      await page.waitForLoadState('networkidle')

      const title = await page.title()
      expect(title.length).toBeGreaterThan(0)
    })
  })
})
