/**
 * Playwright fixtures for Web E2E testing
 *
 * Provides fixtures for:
 * - Browser page for UI tests
 * - API request context for API tests
 * - Server port configuration
 */

import type { APIRequestContext, BrowserContext, Page } from '@playwright/test'
import { test as base } from '@playwright/test'

// Server port from environment or default
const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3001

// Extend base test with web fixtures
export const test = base.extend<{
  port: number
  page: Page
  context: BrowserContext
  request: APIRequestContext
}>({
  // Server port fixture
  // biome-ignore lint/correctness/noEmptyPattern: Playwright fixture pattern requires empty object
  port: async ({}, use) => {
    await use(PORT)
  },

  // Browser page fixture - navigate to base URL
  page: async ({ page, port }, use) => {
    await page.goto(`http://localhost:${port}/`)
    await page.waitForLoadState('domcontentloaded')
    await use(page)
  },

  // Browser context fixture
  context: async ({ context }, use) => {
    await use(context)
  },

  // API request context fixture
  request: async ({ request }, use) => {
    await use(request)
  },
})

export { expect } from '@playwright/test'
