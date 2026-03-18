/**
 * Playwright fixtures for Electron app testing
 *
 * These fixtures provide a clean test environment for each test
 * with automatic setup and teardown of the Electron app.
 */

import { test as base } from '@playwright/test'
import type { ElectronTestApp } from './electron-app.js'
import { startElectronApp, waitForServer } from './electron-app.js'

// Extend base test with Electron fixtures
export const test = base.extend<{
  electronApp: ElectronTestApp
  port: number
}>({
  // Electron app fixture - starts before each test, stops after
  // biome-ignore lint/correctness/noEmptyPattern: Playwright fixture pattern requires empty object
  electronApp: async ({}, use) => {
    const app = await startElectronApp({
      timeout: 30000,
      env: {
        MESAME_PORT: '0', // Use random available port
      },
    })

    // Provide the app to the test
    await use(app)

    // Cleanup after test
    await app.stop()
  },

  // Server port fixture
  port: async ({ electronApp }, use) => {
    // Wait for server to be ready
    const page = electronApp.page
    const url = page.url()
    const match = url.match(/localhost:(\d+)/)
    const port = match ? Number.parseInt(match[1], 10) : 3000

    await waitForServer(port)

    await use(port)
  },
})

// Re-export expect for convenience
export { expect } from '@playwright/test'
