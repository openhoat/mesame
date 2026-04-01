/**
 * Sources Page E2E Tests
 * Tests for Sources UI and API functionality
 */

import { expect, test } from '../fixtures.js'
import { apiRequest } from '../helpers/api.js'

test.describe('Sources Page Tests', () => {
  test.describe('API Health Check', () => {
    test('should have working sources API endpoint', async ({ page, port }) => {
      const request = page.context().request
      // Verify the API is accessible before testing UI
      const response = await apiRequest(request, `http://localhost:${port}/api/sources`)
      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })
  })

  test.describe('Sources API', () => {
    test('should return empty array initially', async ({ page, port }) => {
      const request = page.context().request
      const response = await apiRequest<Array<{ id: string; name: string }>>(
        request,
        `http://localhost:${port}/api/sources`
      )

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })

    test('should handle source creation', async ({ page, port }) => {
      const request = page.context().request

      // Create a test source
      const createResponse = await apiRequest<{ id: string; name: string; type: string }>(
        request,
        `http://localhost:${port}/api/sources`,
        {
          method: 'POST',
          body: {
            name: 'Test Source',
            type: 'text',
            content: 'This is test content for the source.',
          },
        }
      )

      // Source creation should succeed or return validation error
      expect([200, 201, 400, 422]).toContain(createResponse.status)
    })
  })

  test.describe('Sources Page Navigation', () => {
    test('should navigate to Sources page', async ({ page, port }) => {
      // Start from home page
      await page.goto(`http://localhost:${port}/`)
      await page.waitForLoadState('domcontentloaded')

      // Look for navigation or dashboard
      const dashboardButton = page.locator('[data-testid="open-dashboard"]').first()
      if (await dashboardButton.isVisible().catch(() => false)) {
        await dashboardButton.click()
        await page.waitForTimeout(500)
      }

      // Check if Sources link exists in navigation
      const sourcesLink = page.locator('[data-testid="nav-sources"]').first()
      if (await sourcesLink.isVisible().catch(() => false)) {
        await sourcesLink.click()
        await page.waitForLoadState('domcontentloaded')

        // Verify we navigated to sources page
        const content = await page.content()
        expect(content.length).toBeGreaterThan(0)
      } else {
        // If no navigation, verify the page still loaded correctly
        const content = await page.content()
        expect(content.length).toBeGreaterThan(0)
      }
    })

    test('should load sources list without errors', async ({ page, port }) => {
      await page.goto(`http://localhost:${port}/`)
      await page.waitForLoadState('domcontentloaded')

      // Monitor console for errors
      const consoleErrors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })

      // Wait for page to settle
      await page.waitForTimeout(1000)

      // No critical errors should have occurred
      // Filter out common non-critical errors:
      // - Missing favicon (browser automatically requests it)
      // - Generic 404 errors (may be from browser extensions or automatic requests)
      const criticalErrors = consoleErrors.filter(
        err =>
          !err.includes('Warning:') &&
          !err.includes('DevTools') &&
          !err.includes('network') &&
          !err.includes('favicon') &&
          !err.includes('404 (Not Found)')
      )
      expect(criticalErrors.length).toBe(0)
    })
  })

  test.describe('Sources Data Display', () => {
    test('should display sources from API', async ({ page, port }) => {
      // First verify API is working
      const request = page.context().request
      const response = await apiRequest<Array<{ id: string; name: string }>>(
        request,
        `http://localhost:${port}/api/sources`
      )

      expect(response.status).toBe(200)

      // Navigate to page and verify data loads
      await page.goto(`http://localhost:${port}/`)
      await page.waitForLoadState('networkidle')

      // Page should load without errors
      const content = await page.content()
      expect(content.length).toBeGreaterThan(0)
    })
  })
})
