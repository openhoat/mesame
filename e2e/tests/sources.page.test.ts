/**
 * Sources Page E2E Tests
 * Comprehensive tests for Sources UI and API to prevent freeze issues
 */

import { expect, test } from '../fixtures.js'
import { apiRequest } from '../helpers/api.js'

test.describe('Sources Page Tests', () => {
  test.describe('API Health Check', () => {
    test('should have working sources API endpoint', async ({ page, port }) => {
      // Verify the API is accessible before testing UI
      const response = await apiRequest(page, `http://localhost:${port}/v1/sources`)
      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
    })
  })

  test.describe('Sources Page Navigation', () => {
    test('should navigate to Sources page without freezing', async ({ page, port }) => {
      // Start from home page
      await page.goto(`http://localhost:${port}/`)
      await page.waitForLoadState('domcontentloaded')

      // Set up console log monitoring
      const consoleLogs: string[] = []
      page.on('console', msg => {
        if (msg.text().includes('[Sources Frontend]')) {
          consoleLogs.push(msg.text())
        }
      })

      // First, click on dashboard button if we're on chat page
      const dashboardButton = page
        .locator('button:has-text("tableau de bord"), button:has-text("dashboard")')
        .first()
      if (await dashboardButton.isVisible().catch(() => false)) {
        await dashboardButton.click()
        await page.waitForTimeout(1000)
      }

      // Look for Sources navigation link in sidebar
      const sourcesLink = page
        .locator(
          '[role="button"]:has-text("Sources"), a:has-text("Sources"), button:has-text("Sources")'
        )
        .first()
      await sourcesLink.waitFor({ state: 'visible', timeout: 5000 })

      // Click to navigate to Sources
      await sourcesLink.click()

      // Wait for Sources page to load (should not freeze)
      // If it freezes, this will timeout and fail the test
      await page.waitForSelector('text=Sources', { timeout: 10000 })

      // Verify console logs show proper fetch sequence
      await page.waitForTimeout(2000) // Give time for logs to appear
      console.log('Console logs captured:', consoleLogs)

      // Should see the component mounted log
      expect(consoleLogs.some(log => log.includes('Component mounted'))).toBe(true)
    })

    test('should load sources list without infinite loading', async ({ page, port }) => {
      await page.goto(`http://localhost:${port}/`)
      await page.waitForLoadState('domcontentloaded')

      // Open dashboard if on chat page
      const dashboardButton = page
        .locator('button:has-text("tableau de bord"), button:has-text("dashboard")')
        .first()
      if (await dashboardButton.isVisible().catch(() => false)) {
        await dashboardButton.click()
        await page.waitForTimeout(1000)
      }

      // Navigate to Sources
      const sourcesLink = page
        .locator(
          '[role="button"]:has-text("Sources"), a:has-text("Sources"), button:has-text("Sources")'
        )
        .first()
      await sourcesLink.click()

      // Wait for loading to complete (max 10s)
      // The loader should disappear, indicating loading finished
      const loader = page.locator('text=Chargement des sources').or(page.locator('text=Loading'))

      // Either loader appears and disappears, or sources list appears
      try {
        await loader.waitFor({ state: 'visible', timeout: 2000 })
        // If loader appeared, it should disappear
        await loader.waitFor({ state: 'hidden', timeout: 10000 })
      } catch {
        // Loader might not appear if sources load very quickly
        console.log('Loader did not appear (sources loaded instantly)')
      }

      // Verify we're not stuck in loading state
      const isStillLoading = await loader.isVisible().catch(() => false)
      expect(isStillLoading).toBe(false)

      // Should see either sources or empty state, not loading
      const hasContent =
        (await page
          .locator('text=Ajouter')
          .isVisible()
          .catch(() => false)) ||
        (await page
          .locator('button:has-text("Create")')
          .isVisible()
          .catch(() => false))
      expect(hasContent).toBe(true)
    })
  })

  test.describe('Sources List Display', () => {
    test('should display sources after API call completes', async ({ page, port }) => {
      // Create a source first via API
      await apiRequest(page, `http://localhost:${port}/v1/sources`, {
        method: 'POST',
        body: {
          title: 'E2E Test Source',
          content: 'This source should appear in the UI.',
        },
      })

      // Navigate to Sources page
      await page.goto(`http://localhost:${port}/`)
      const dashboardButton = page
        .locator('button:has-text("tableau de bord"), button:has-text("dashboard")')
        .first()
      if (await dashboardButton.isVisible().catch(() => false)) {
        await dashboardButton.click()
        await page.waitForTimeout(1000)
      }
      const sourcesLink = page
        .locator(
          '[role="button"]:has-text("Sources"), a:has-text("Sources"), button:has-text("Sources")'
        )
        .first()
      await sourcesLink.click()

      // Wait for sources to load
      await page.waitForTimeout(3000)

      // Should display at least one source
      const sourceCards = page.locator('text=E2E Test Source')
      const count = await sourceCards.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should display empty state when no sources exist', async ({ page, port }) => {
      // Ensure no sources exist by checking API
      const listResponse = await apiRequest(page, `http://localhost:${port}/v1/sources`)
      const sources = listResponse.body as Array<{ id: string }>

      // Delete all sources
      for (const source of sources) {
        await apiRequest(page, `http://localhost:${port}/v1/sources/${source.id}`, {
          method: 'DELETE',
        })
      }

      // Navigate to Sources page
      await page.goto(`http://localhost:${port}/`)
      const dashboardButton = page
        .locator('button:has-text("tableau de bord"), button:has-text("dashboard")')
        .first()
      if (await dashboardButton.isVisible().catch(() => false)) {
        await dashboardButton.click()
        await page.waitForTimeout(1000)
      }
      const sourcesLink = page
        .locator(
          '[role="button"]:has-text("Sources"), a:has-text("Sources"), button:has-text("Sources")'
        )
        .first()
      await sourcesLink.click()

      // Wait for page to load
      await page.waitForTimeout(3000)

      // Should show empty state or create button (not loading forever)
      const hasCreateButton =
        (await page
          .locator('button:has-text("Create")')
          .isVisible()
          .catch(() => false)) ||
        (await page
          .locator('button:has-text("Créer")')
          .isVisible()
          .catch(() => false))
      expect(hasCreateButton).toBe(true)
    })
  })

  test.describe('Sources API Integration', () => {
    test('should create and fetch sources via API', async ({ page, port }) => {
      // Create a source
      const createResponse = await apiRequest(page, `http://localhost:${port}/v1/sources`, {
        method: 'POST',
        body: {
          title: 'Test Source',
          content: 'This is a test source content for e2e testing.',
        },
      })

      expect([200, 201]).toContain(createResponse.status)

      const createdBody = createResponse.body as { id?: string; title?: string; content?: string }
      expect(createdBody.id).toBeDefined()
      expect(createdBody.title).toBe('Test Source')

      // Fetch sources list
      const listResponse = await apiRequest(page, `http://localhost:${port}/v1/sources`)
      expect(listResponse.status).toBe(200)
      expect(Array.isArray(listResponse.body)).toBe(true)

      const sources = listResponse.body as Array<{ id: string }>
      expect(sources.length).toBeGreaterThan(0)
    })
  })

  test.describe('Error Handling', () => {
    test('should handle fetch errors gracefully', async ({ page, port }) => {
      await page.goto(`http://localhost:${port}/`)

      // Set up request interception to simulate error
      await page.route('**/v1/sources', route => {
        route.abort('failed')
      })

      // Open dashboard
      const dashboardButton = page
        .locator('button:has-text("tableau de bord"), button:has-text("dashboard")')
        .first()
      if (await dashboardButton.isVisible().catch(() => false)) {
        await dashboardButton.click()
        await page.waitForTimeout(1000)
      }

      // Navigate to Sources
      const sourcesLink = page
        .locator(
          '[role="button"]:has-text("Sources"), a:has-text("Sources"), button:has-text("Sources")'
        )
        .first()
      await sourcesLink.click()

      // Wait for error handling
      await page.waitForTimeout(3000)

      // Should not be stuck in loading state
      const isLoading = await page
        .locator('text=Chargement')
        .or(page.locator('text=Loading'))
        .isVisible()
        .catch(() => false)
      expect(isLoading).toBe(false)

      // Should show either error message or empty state
      const hasContent = await page
        .locator('button')
        .first()
        .isVisible()
        .catch(() => false)
      expect(hasContent).toBe(true)
    })
  })
})
