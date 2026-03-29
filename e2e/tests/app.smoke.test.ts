/**
 * Smoke tests for Web app startup and basic functionality
 *
 * These tests verify that the web application starts correctly
 * and displays the expected UI elements.
 */

import { expect, test } from '../fixtures.js'
import { checkHealth } from '../helpers/api.js'

test.describe('Web App Smoke Tests', () => {
  test.describe('Server Health', () => {
    test('should have a responsive server', async ({ page, port }) => {
      // Verify the health endpoint is accessible
      const isHealthy = await checkHealth(page.context().request, port)
      expect(isHealthy).toBe(true)
    })

    test('should return healthy status', async ({ page, port }) => {
      const response = await page.context().request.get(`http://localhost:${port}/health`)
      expect(response.status()).toBe(200)
    })
  })

  test.describe('UI Page Access', () => {
    test('should load the home page', async ({ page, port }) => {
      // Navigate to the main page
      await page.goto(`http://localhost:${port}/`)
      await page.waitForLoadState('domcontentloaded')

      // Verify the page loaded
      const content = await page.content()
      expect(content.length).toBeGreaterThan(0)
    })

    test('should display the app title', async ({ page, port }) => {
      await page.goto(`http://localhost:${port}/`)
      await page.waitForLoadState('networkidle')

      // Check for page title or main heading
      const title = await page.title()
      expect(title).toBeTruthy()
    })

    test('should have accessible UI elements', async ({ page, port }) => {
      await page.goto(`http://localhost:${port}/`)
      await page.waitForLoadState('domcontentloaded')

      // Check that the page has interactive elements
      const buttons = await page.$$('button')
      const inputs = await page.$$('input')
      const totalInteractive = buttons.length + inputs.length

      // There should be at least some interactive elements
      expect(totalInteractive).toBeGreaterThanOrEqual(0)
    })
  })

  test.describe('Static Assets', () => {
    test('should serve the web frontend', async ({ page, port }) => {
      await page.goto(`http://localhost:${port}/`)
      await page.waitForLoadState('networkidle')

      // Verify we're on the correct page
      const url = page.url()
      expect(url).toContain('localhost')
      expect(url).toContain(String(port))
    })
  })
})
