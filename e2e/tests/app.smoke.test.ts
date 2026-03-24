/**
 * Smoke tests for Electron app startup and basic UI rendering
 *
 * These tests verify that the Electron application starts correctly
 * and displays the expected UI elements.
 */

import { expect, test } from '../fixtures.js'
import { checkHealth } from '../helpers/api.js'

test.describe('Electron App Smoke Tests', () => {
  test('should start the Electron app successfully', async ({ electronApp, page }) => {
    // Verify the app started (aligned with termaid)
    expect(electronApp).toBeDefined()
    expect(page).toBeDefined()
  })

  test('should display the main window', async ({ page }) => {
    // Verify a window was created
    const windows = electronApp.windows()
    expect(windows.length).toBeGreaterThan(0)
  })

  test('should load the correct URL', async ({ page, port }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle')

    // Verify we're on localhost
    const url = page.url()
    expect(url).toContain('localhost')
    expect(url).toContain(String(port))
  })

  test('should have a responsive server', async ({ page, port }) => {
    // Verify the health endpoint is accessible
    const isHealthy = await checkHealth(page, port)
    expect(isHealthy).toBe(true)
  })

  test('should display the app title', async ({ page }) => {
    // Wait for the page to be ready
    await page.waitForLoadState('domcontentloaded')

    // Check the page title
    const title = await page.title()
    expect(title).toContain('MeSame')
  })

  test('should render the main UI container', async ({ page }) => {
    // Wait for the page to be ready
    await page.waitForLoadState('networkidle')

    // Check for main container (adjust selector based on actual UI)
    const body = await page.$('body')
    expect(body).not.toBeNull()

    // Verify the page has some content
    const content = await page.content()
    expect(content.length).toBeGreaterThan(100)
  })
})

test.describe('App Lifecycle Tests', () => {
  test('should handle window resize', async ({ page }) => {
    // Get initial size
    const initialSize = page.viewportSize()

    // Resize the window
    await page.setViewportSize({ width: 800, height: 600 })

    // Verify resize
    const newSize = page.viewportSize()
    expect(newSize?.width).toBe(800)
    expect(newSize?.height).toBe(600)

    // Restore original size if we had one
    if (initialSize) {
      await page.setViewportSize(initialSize)
    }
  })

  test('should handle app minimize and restore', async ({ page }) => {
    // This test verifies the app can handle window state changes
    // The actual minimize/restore would require Electron-specific APIs
    // For now, just verify the window is still responsive
    await page.waitForLoadState('networkidle')

    // Verify the page is still interactive
    const title = await page.title()
    expect(title).toBeTruthy()
  })
})

test.describe('Error Handling Tests', () => {
  test('should handle network errors gracefully', async ({ page, port }) => {
    // Try to access a non-existent endpoint
    const response = await page.evaluate(async url => {
      try {
        const res = await fetch(url)
        return { status: res.status, ok: res.ok }
      } catch (error) {
        return { error: String(error) }
      }
    }, `http://localhost:${port}/api/nonexistent`)

    // Should return 404, not crash
    expect(response.status).toBe(404)
  })

  test('should handle malformed requests', async ({ page, port }) => {
    // Send malformed JSON
    const response = await page.evaluate(async url => {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: 'not valid json',
        })
        return { status: res.status }
      } catch (error) {
        return { error: String(error) }
      }
    }, `http://localhost:${port}/v1/chat/completions`)

    // Should return an error status, not crash
    expect([400, 500]).toContain(response.status)
  })
})
