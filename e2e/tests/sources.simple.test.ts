/**
 * Simple Sources test - verifies basic functionality without complex UI navigation
 */

import { expect, test } from '../fixtures.js'
import { apiRequest } from '../helpers/api.js'

test.describe('Sources Simple Tests', () => {
  test('API should return sources successfully', async ({ page, port }) => {
    console.log('Testing /v1/sources API endpoint...')

    const startTime = Date.now()
    const response = await apiRequest(page, `http://localhost:${port}/v1/sources`)
    const duration = Date.now() - startTime

    console.log(`API responded in ${duration}ms with status ${response.status}`)

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
    expect(duration).toBeLessThan(3000) // Should respond quickly

    const sources = response.body as Array<unknown>
    console.log(`Found ${sources.length} sources in database`)
  })

  test('can create source via API', async ({ page, port }) => {
    console.log('Creating test source via API...')

    const testSource = {
      title: 'E2E Test Source',
      content: 'This is a test source created by e2e test.',
    }

    const createResponse = await apiRequest(page, `http://localhost:${port}/v1/sources`, {
      method: 'POST',
      body: testSource,
    })

    expect([200, 201]).toContain(createResponse.status)

    const created = createResponse.body as { id: string; title: string; content: string }
    expect(created.id).toBeDefined()
    expect(created.title).toBe(testSource.title)

    console.log(`✓ Source created with ID: ${created.id}`)

    // Verify it appears in list
    const listResponse = await apiRequest(page, `http://localhost:${port}/v1/sources`)
    const sources = listResponse.body as Array<{ id: string; title: string }>

    const found = sources.find(s => s.id === created.id)
    expect(found).toBeDefined()

    console.log(`✓ Source appears in list`)
  })

  test('frontend can fetch sources without freezing', async ({ page, port }) => {
    console.log('Testing frontend fetch...')

    await page.goto(`http://localhost:${port}/`)
    await page.waitForLoadState('domcontentloaded')

    // Capture console logs and network activity
    const consoleLogs: string[] = []
    const networkRequests: Array<{ url: string; status: number }> = []

    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`)
    })

    page.on('response', async response => {
      if (response.url().includes('/v1/sources')) {
        networkRequests.push({
          url: response.url(),
          status: response.status(),
        })
        console.log(`[Network] ${response.url()} -> ${response.status()}`)
      }
    })

    // Execute fetch directly in browser context to test if it works
    const result = await page.evaluate(async () => {
      try {
        console.log('[Test] Starting fetch to /v1/sources...')
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
          console.log('[Test] Fetch timeout, aborting...')
          controller.abort()
        }, 5000)

        const response = await fetch('/v1/sources', { signal: controller.signal })
        clearTimeout(timeoutId)

        console.log(`[Test] Fetch completed: ${response.status}`)

        if (!response.ok) {
          return { success: false, error: `HTTP ${response.status}` }
        }

        const data = await response.json()
        console.log(`[Test] Data received: ${Array.isArray(data) ? data.length : 0} sources`)

        return {
          success: true,
          status: response.status,
          count: Array.isArray(data) ? data.length : 0,
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.error(`[Test] Fetch failed: ${errorMsg}`)
        return { success: false, error: errorMsg }
      }
    })

    console.log('Fetch result:', result)
    console.log(`Captured ${networkRequests.length} network requests`)

    // Verify the fetch succeeded
    expect(result.success).toBe(true)
    expect(result.status).toBe(200)

    // Verify we got the network request
    expect(networkRequests.length).toBeGreaterThan(0)
    expect(networkRequests[0]?.status).toBe(200)

    console.log('✓ Frontend fetch works without freezing')
  })

  test('health check endpoint responds', async ({ page, port }) => {
    const response = await apiRequest(page, `http://localhost:${port}/health`)
    expect(response.status).toBe(200)
    console.log('✓ Health check OK')
  })
})
