/**
 * Sources UI Test - tests the actual UI navigation and loading
 */

import { expect, test } from '../fixtures.js'

test.describe('Sources UI Tests', () => {
  test('should be able to access main page', async ({ page, port }) => {
    console.log('Loading main page...')
    await page.goto(`http://localhost:${port}/`)
    await page.waitForLoadState('domcontentloaded')

    // Should see the chat interface or dashboard
    const pageContent = await page.content()
    expect(pageContent.length).toBeGreaterThan(100)

    console.log('✓ Main page loaded')
  })

  test('dashboard should be accessible', async ({ page, port }) => {
    console.log('Testing dashboard access...')
    await page.goto(`http://localhost:${port}/`)
    await page.waitForLoadState('domcontentloaded')

    // Try to find any dashboard or navigation element
    await page.waitForTimeout(2000) // Let the app fully render

    // Check if we can see any interactive elements
    const buttons = await page.$$('button')
    const links = await page.$$('a')

    console.log(`Found ${buttons.length} buttons and ${links.length} links`)
    expect(buttons.length + links.length).toBeGreaterThan(0)

    console.log('✓ Dashboard elements present')
  })

  test('can execute fetch from browser without UI navigation', async ({ page, port }) => {
    console.log('Testing direct fetch execution...')

    await page.goto(`http://localhost:${port}/`)
    await page.waitForLoadState('domcontentloaded')

    // Monitor network and console
    const logs: string[] = []
    page.on('console', msg => logs.push(msg.text()))

    // Execute the exact same fetch logic as Sources component
    const result = await page.evaluate(async () => {
      console.log('[E2E] Simulating Sources component fetch...')

      const fetchSources = async () => {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => {
            console.log('[E2E] Timeout after 5s')
            controller.abort()
          }, 5000)

          console.log('[E2E] Fetching /v1/sources...')
          const response = await fetch('/v1/sources', { signal: controller.signal })
          clearTimeout(timeoutId)

          console.log(`[E2E] Response: ${response.status}`)

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }

          const data = await response.json()
          console.log(`[E2E] Data: ${Array.isArray(data) ? data.length : 0} sources`)

          return {
            success: true,
            status: response.status,
            sourcesCount: Array.isArray(data) ? data.length : 0,
            sources: data,
          }
        } catch (error) {
          console.error('[E2E] Error:', error)
          return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
          }
        }
      }

      return await fetchSources()
    })

    console.log('Browser fetch result:', JSON.stringify(result, null, 2))
    console.log('Console logs:', logs.filter(l => l.includes('[E2E]')).join('\n'))

    expect(result.success).toBe(true)
    expect(result.status).toBe(200)
    expect(result.sourcesCount).toBeGreaterThan(0)

    console.log(`✓ Fetch executed successfully, got ${result.sourcesCount} sources`)
  })

  test('Sources component render does not crash', async ({ page, port }) => {
    console.log('Testing Sources component stability...')

    await page.goto(`http://localhost:${port}/`)
    await page.waitForLoadState('domcontentloaded')

    // Capture any JavaScript errors
    const jsErrors: string[] = []
    page.on('pageerror', error => {
      jsErrors.push(error.message)
      console.error(`[Page Error] ${error.message}`)
    })

    // Wait to see if any errors occur during initial render
    await page.waitForTimeout(3000)

    // Should have no JavaScript errors
    expect(jsErrors.length).toBe(0)

    console.log('✓ No JavaScript errors detected')
  })
})
