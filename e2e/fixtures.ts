/**
 * Playwright fixtures for Electron app testing
 * Aligned with termaid's working implementation
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test as base, type ElectronApplication, type Page } from '@playwright/test'
import { config as dotenvConfig } from 'dotenv'
import { startElectronApp, waitForServer } from './electron-app.js'

// Load .env.test for test configuration (mock provider, etc.)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const envTestPath = path.join(projectRoot, '.env.test')
if (fs.existsSync(envTestPath)) {
  dotenvConfig({ path: envTestPath, quiet: true })
}

// Extend base test with Electron fixtures (like termaid)
export const test = base.extend<{
  electronApp: ElectronApplication
  page: Page
  port: number
}>({
  // Launch the Electron app before each test (like termaid)
  // biome-ignore lint/correctness/noEmptyPattern: Playwright fixture pattern requires empty object
  electronApp: async ({}, use, testInfo) => {
    // Use a unique database per worker to enable parallel test execution
    const workerIndex = testInfo.parallelIndex
    const dbPath = `file:./prisma/test-${workerIndex}.db`

    // Apply Prisma migrations to the test database
    try {
      execSync('npx prisma db push --skip-generate', {
        env: { ...process.env, DATABASE_URL: dbPath } as NodeJS.ProcessEnv,
        stdio: 'pipe', // Suppress output
        cwd: projectRoot,
      })
    } catch (error) {
      console.error('Failed to initialize test database:', error)
      throw error
    }

    const appData = await startElectronApp({
      timeout: process.env.CI ? 30000 : 15000, // Reduced startup timeout
      env: {
        MESAME_PROVIDER: process.env.MESAME_PROVIDER || 'mock',
        MESAME_MODEL: process.env.MESAME_MODEL || 'mock-model',
        MESAME_PORT: '0',
        MESAME_LOG_LEVEL: 'silent',
        NODE_ENV: 'test',
        DATABASE_URL: dbPath,
      },
    })

    await use(appData.electronApp)
    await appData.stop()
  },

  // Get the page separately (like termaid does)
  page: async ({ electronApp }, use) => {
    const page = await electronApp.firstWindow()
    await page.waitForLoadState('domcontentloaded')
    await use(page)
  },

  // Server port fixture
  port: async ({ page }, use) => {
    try {
      const url = page.url()
      const match = url.match(/localhost:(\d+)/)

      if (!match?.[1]) {
        throw new Error(`Failed to extract port from URL: ${url}`)
      }

      const port = Number.parseInt(match[1], 10)

      if (Number.isNaN(port) || port <= 0 || port > 65535) {
        throw new Error(`Invalid port extracted: ${port}`)
      }

      await waitForServer(port, process.env.CI ? 30000 : 15000)

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
