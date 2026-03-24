/**
 * Playwright fixtures for Electron app testing
 *
 * These fixtures provide a clean test environment for each test
 * with automatic setup and teardown of the Electron app.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test as base } from '@playwright/test'
import { config as dotenvConfig } from 'dotenv'
import type { ElectronTestApp } from './electron-app.js'
import { startElectronApp, waitForServer } from './electron-app.js'

// Load .env.test for test configuration (mock provider, etc.)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const envTestPath = path.join(projectRoot, '.env.test')
if (fs.existsSync(envTestPath)) {
  dotenvConfig({ path: envTestPath })
}

// Extend base test with Electron fixtures
export const test = base.extend<{
  electronApp: ElectronTestApp
  port: number
}>({
  // Electron app fixture - starts before each test, stops after
  // biome-ignore lint/correctness/noEmptyPattern: Playwright fixture pattern requires empty object
  electronApp: async ({}, use) => {
    let app: ElectronTestApp | null = null
    try {
      app = await startElectronApp({
        timeout: process.env.CI ? 60000 : 30000, // Longer timeout in CI
        env: {
          MESAME_PROVIDER: process.env.MESAME_PROVIDER || 'mock',
          MESAME_MODEL: process.env.MESAME_MODEL || 'mock-model',
          MESAME_PORT: '0', // Use random available port
          MESAME_LOG_LEVEL: 'silent',
          NODE_ENV: 'test',
        },
      })

      // Provide the app to the test
      await use(app)
    } catch (error) {
      throw new Error(
        `Electron app failed to start: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    } finally {
      // Cleanup after test - ensure cleanup even if test fails
      if (app) {
        try {
          await app.stop()
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  },

  // Server port fixture
  port: async ({ electronApp }, use) => {
    try {
      // Wait for server to be ready
      const page = electronApp.page
      const url = page.url()
      const match = url.match(/localhost:(\d+)/)

      if (!match) {
        throw new Error(`Failed to extract port from URL: ${url}`)
      }

      const port = Number.parseInt(match[1], 10)

      if (Number.isNaN(port) || port <= 0 || port > 65535) {
        throw new Error(`Invalid port extracted: ${port}`)
      }

      await waitForServer(port, process.env.CI ? 60000 : 30000)

      await use(port)
    } catch (error) {
      throw new Error(
        `Failed to obtain server port: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  },
})

// Re-export expect for convenience
export { expect } from '@playwright/test'
