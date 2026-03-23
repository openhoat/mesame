/**
 * Performance E2E tests
 *
 * These tests measure and verify performance metrics:
 * 1. Time to first byte (TTFB) for API responses
 * 2. Streaming response latency
 * 3. Chat interface responsiveness
 * 4. Large file handling
 * 5. Multiple concurrent requests
 */

import { TEST_MESSAGES, TEST_PROFILES, TEST_SOURCES } from '../fixtures/test-data.js'
import { expect, test } from '../fixtures.js'
import { chatCompletion, chatCompletionStream } from '../helpers/api.js'
import { cleanupTestData, navigateToSection, setupTestProfile } from '../helpers/setup.js'

test.describe('API Response Performance', () => {
  test('should respond to health check quickly', async ({ electronApp, port }) => {
    const { page } = electronApp

    const startTime = Date.now()

    const response = await page.evaluate(async url => {
      const res = await fetch(url)
      return { status: res.status, time: Date.now() }
    }, `http://localhost:${port}/health`)

    const duration = response.time - startTime

    // Health check should be very fast (< 100ms)
    expect(duration).toBeLessThan(100)
    expect(response.status).toBe(200)
  })

  test('should respond to models endpoint quickly', async ({ electronApp, port }) => {
    const { page } = electronApp

    const startTime = Date.now()

    const response = await page.evaluate(async url => {
      const res = await fetch(url)
      return { status: res.status, time: Date.now() }
    }, `http://localhost:${port}/v1/models`)

    const duration = response.time - startTime

    // Models endpoint should be fast (< 500ms)
    expect(duration).toBeLessThan(500)
    expect(response.status).toBe(200)
  })

  test('should handle chat completion with reasonable latency', async ({ electronApp, port }) => {
    test.setTimeout(60000)

    const { page } = electronApp

    const startTime = Date.now()

    const response = await chatCompletion(
      page,
      port,
      [{ role: 'user', content: 'Say hi' }],
      'gpt-4o-mini'
    )

    const duration = Date.now() - startTime

    // Chat completion should respond within reasonable time
    // Note: This depends on LLM API latency
    if (response.status === 200) {
      // If we have API key and got response, check timing
      expect(duration).toBeLessThan(30000) // 30 seconds max
    } else {
      // Without API key, proxy should fail fast
      expect(duration).toBeLessThan(5000) // 5 seconds max for error
    }
  })
})

test.describe('Streaming Performance', () => {
  test('should start streaming response quickly', async ({ electronApp, port }) => {
    test.setTimeout(60000)

    const { page } = electronApp

    const startTime = Date.now()
    let firstChunkTime = 0
    let chunkCount = 0

    try {
      for await (const _chunk of chatCompletionStream(
        page,
        port,
        [{ role: 'user', content: 'Count to 5' }],
        'gpt-4o-mini'
      )) {
        if (chunkCount === 0) {
          firstChunkTime = Date.now()
        }
        chunkCount++

        // Only check first few chunks for performance test
        if (chunkCount >= 3) break
      }
    } catch {
      // Expected if no API key
    }

    if (firstChunkTime > 0) {
      const timeToFirstChunk = firstChunkTime - startTime

      // First chunk should arrive quickly (< 10 seconds)
      expect(timeToFirstChunk).toBeLessThan(10000)

      // Should have received multiple chunks
      expect(chunkCount).toBeGreaterThanOrEqual(3)
    }
  })

  test('should handle streaming without blocking UI', async ({ electronApp }) => {
    test.setTimeout(60000)

    const { page } = electronApp

    // Navigate to chat
    await navigateToSection(page, 'chat')
    await page.waitForSelector('textarea', { timeout: 10000 })

    // Send a message that will stream
    const textarea = page.locator('textarea')
    await textarea.fill('Write a short story')
    await textarea.press('Enter')

    // Wait a bit for streaming to start
    await page.waitForTimeout(2000)

    // Try to interact with UI while streaming
    const inputStillAccessible = await textarea.isEnabled()

    // UI should remain responsive
    expect(inputStillAccessible).toBe(true)
  })
})

test.describe('Chat Interface Performance', () => {
  test('should render chat interface quickly', async ({ electronApp }) => {
    const { page } = electronApp

    const startTime = Date.now()

    await navigateToSection(page, 'chat')
    await page.waitForSelector('textarea', { timeout: 10000 })

    const duration = Date.now() - startTime

    // Chat should load quickly (< 3 seconds)
    expect(duration).toBeLessThan(3000)
  })

  test('should handle typing input without lag', async ({ electronApp }) => {
    const { page } = electronApp

    await navigateToSection(page, 'chat')
    await page.waitForSelector('textarea', { timeout: 10000 })

    const textarea = page.locator('textarea')

    // Type a long message character by character
    const message = 'This is a test message to check typing performance'

    const startTime = Date.now()

    // Use fill and pressSequentially instead of deprecated type()
    await textarea.fill('')
    await textarea.pressSequentially(message, { delay: 10 })

    const duration = Date.now() - startTime

    // Typing should be smooth (total time should be close to delay * length)
    const expectedDuration = message.length * 10
    const overhead = duration - expectedDuration

    // Overhead should be minimal (< 500ms)
    expect(overhead).toBeLessThan(500)
  })

  test('should render messages quickly', async ({ electronApp }) => {
    const { page } = electronApp

    await navigateToSection(page, 'chat')
    await page.waitForSelector('textarea', { timeout: 10000 })

    const textarea = page.locator('textarea')

    const startTime = Date.now()

    await textarea.fill(TEST_MESSAGES.simpleGreeting.content)
    await textarea.press('Enter')

    // Wait for user message to appear
    await page.waitForSelector(`text=${TEST_MESSAGES.simpleGreeting.content}`, { timeout: 5000 })

    const duration = Date.now() - startTime

    // Message should appear quickly (< 1 second)
    expect(duration).toBeLessThan(1000)
  })

  test('should handle multiple messages without performance degradation', async ({
    electronApp,
  }) => {
    test.setTimeout(90000)

    const { page } = electronApp

    await navigateToSection(page, 'chat')
    await page.waitForSelector('textarea', { timeout: 10000 })

    const timings: number[] = []

    // Send 5 messages and measure time for each
    for (let i = 1; i <= 5; i++) {
      const startTime = Date.now()

      const textarea = page.locator('textarea')
      await textarea.fill(`Message ${i}`)
      await textarea.press('Enter')

      await page.waitForSelector(`text=Message ${i}`, { timeout: 5000 })

      timings.push(Date.now() - startTime)

      await page.waitForTimeout(500)
    }

    // Later messages shouldn't be significantly slower than first
    const firstTiming = timings[0]
    const lastTiming = timings[timings.length - 1]

    // Last message shouldn't be more than 2x slower than first
    expect(lastTiming).toBeLessThan(firstTiming * 2)
  })
})

test.describe('File Upload Performance', () => {
  test.beforeEach(async ({ electronApp, port }) => {
    const { page } = electronApp
    await cleanupTestData(page, port)
  })

  test.afterEach(async ({ electronApp, port }) => {
    const { page } = electronApp
    await cleanupTestData(page, port)
  })

  test('should upload small file quickly', async ({ electronApp, port }) => {
    const { page } = electronApp

    const startTime = Date.now()

    // Upload a small test file
    const response = await page.evaluate(
      async ({ url, filename, content }) => {
        const formData = new FormData()
        const blob = new Blob([content], { type: 'text/plain' })
        formData.append('file', blob, filename)

        const res = await fetch(url, {
          method: 'POST',
          body: formData,
        })

        return { status: res.status, time: Date.now() }
      },
      {
        url: `http://localhost:${port}/v1/sources/import`,
        filename: 'test.txt',
        content: TEST_SOURCES.casual.content,
      }
    )

    const duration = response.time - startTime

    // Small file upload should be fast (< 2 seconds)
    expect(duration).toBeLessThan(2000)
    expect([200, 201]).toContain(response.status)
  })

  test('should handle large file upload', async ({ electronApp, port }) => {
    test.setTimeout(60000)

    const { page } = electronApp

    // Create a larger content (10KB)
    const largeContent = TEST_SOURCES.technical.content.repeat(50)

    const startTime = Date.now()

    const response = await page.evaluate(
      async ({ url, filename, content }) => {
        const formData = new FormData()
        const blob = new Blob([content], { type: 'text/plain' })
        formData.append('file', blob, filename)

        const res = await fetch(url, {
          method: 'POST',
          body: formData,
        })

        return { status: res.status, time: Date.now() }
      },
      {
        url: `http://localhost:${port}/v1/sources/import`,
        filename: 'large.txt',
        content: largeContent,
      }
    )

    const duration = response.time - startTime

    // Large file should still upload reasonably fast (< 10 seconds)
    expect(duration).toBeLessThan(10000)
    expect([200, 201, 413]).toContain(response.status) // 413 = payload too large
  })
})

test.describe('Profile Creation Performance', () => {
  test.beforeEach(async ({ electronApp, port }) => {
    const { page } = electronApp
    await cleanupTestData(page, port)
  })

  test.afterEach(async ({ electronApp, port }) => {
    const { page } = electronApp
    await cleanupTestData(page, port)
  })

  test('should create style profile quickly', async ({ electronApp, port }) => {
    test.setTimeout(30000)

    const { page } = electronApp

    const startTime = Date.now()

    const result = await setupTestProfile(page, port, TEST_PROFILES.casual, TEST_SOURCES.casual)

    const duration = Date.now() - startTime

    // Profile creation should complete in reasonable time (< 10 seconds)
    expect(duration).toBeLessThan(10000)
    expect(result.success).toBe(true)
  })
})

test.describe('Configuration Performance', () => {
  test('should load configuration page quickly', async ({ electronApp }) => {
    const { page } = electronApp

    const startTime = Date.now()

    await navigateToSection(page, 'config')
    await page.waitForLoadState('networkidle')

    const duration = Date.now() - startTime

    // Config page should load quickly (< 2 seconds)
    expect(duration).toBeLessThan(2000)
  })

  test('should save configuration quickly', async ({ electronApp }) => {
    const { page } = electronApp

    await navigateToSection(page, 'config')

    const modelInput = page.locator('input[name*="model"]').first()
    const modelInputCount = await modelInput.count()

    if (modelInputCount > 0) {
      await modelInput.fill('test-model')

      const saveButton = page.locator('button:has-text("Save")').first()
      const saveButtonCount = await saveButton.count()

      if (saveButtonCount > 0) {
        const startTime = Date.now()

        await saveButton.click()

        // Wait for save to complete (look for success message or no error)
        await page.waitForTimeout(1000)

        const duration = Date.now() - startTime

        // Save should be fast (< 2 seconds)
        expect(duration).toBeLessThan(2000)
      }
    }
  })
})

test.describe('Memory and Resource Usage', () => {
  test('should handle page reload without memory leak', async ({ electronApp }) => {
    test.setTimeout(60000)

    const { page } = electronApp

    // Get initial metrics (if available)
    const initialMetrics = await page
      .evaluate(() => {
        if (
          performance &&
          (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory
        ) {
          return (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory
            ?.usedJSHeapSize
        }
        return 0
      })
      .catch(() => 0)

    // Reload multiple times
    for (let i = 0; i < 3; i++) {
      await page.reload()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)
    }

    // Get final metrics
    const finalMetrics = await page
      .evaluate(() => {
        if (
          performance &&
          (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory
        ) {
          return (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory
            ?.usedJSHeapSize
        }
        return 0
      })
      .catch(() => 0)

    if (initialMetrics && finalMetrics && initialMetrics > 0 && finalMetrics > 0) {
      // Memory shouldn't grow excessively (< 50% increase)
      const growthRatio = finalMetrics / initialMetrics

      expect(growthRatio).toBeLessThan(1.5)
    }
  })

  test('should handle multiple navigations efficiently', async ({ electronApp }) => {
    test.setTimeout(60000)

    const { page } = electronApp

    const sections = ['chat', 'config', 'profiles', 'dashboard'] as const

    const startTime = Date.now()

    // Navigate through all sections 3 times
    for (let i = 0; i < 3; i++) {
      for (const section of sections) {
        await navigateToSection(page, section)
        await page.waitForTimeout(100)
      }
    }

    const duration = Date.now() - startTime

    // All navigations should complete in reasonable time (< 15 seconds)
    expect(duration).toBeLessThan(15000)
  })
})

test.describe('Performance Metrics Reporting', () => {
  test('should measure and report key metrics', async ({ electronApp, port }) => {
    const { page } = electronApp

    const metrics = {
      healthCheckTime: 0,
      chatLoadTime: 0,
      configLoadTime: 0,
      apiResponseTime: 0,
    }

    // Health check time
    let startTime = Date.now()
    await page.evaluate(async url => {
      await fetch(url)
    }, `http://localhost:${port}/health`)
    metrics.healthCheckTime = Date.now() - startTime

    // Chat load time
    startTime = Date.now()
    await navigateToSection(page, 'chat')
    await page.waitForSelector('textarea', { timeout: 10000 })
    metrics.chatLoadTime = Date.now() - startTime

    // Config load time
    startTime = Date.now()
    await navigateToSection(page, 'config')
    await page.waitForLoadState('networkidle')
    metrics.configLoadTime = Date.now() - startTime

    // Report metrics (in a real scenario, this would be sent to monitoring)
    console.log('Performance Metrics:', JSON.stringify(metrics, null, 2))

    // Verify all metrics are within acceptable ranges
    expect(metrics.healthCheckTime).toBeLessThan(100)
    expect(metrics.chatLoadTime).toBeLessThan(3000)
    expect(metrics.configLoadTime).toBeLessThan(2000)
  })
})
