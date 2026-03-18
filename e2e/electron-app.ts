/**
 * Electron application launcher for E2E testing
 *
 * This module provides utilities to start and stop the Electron app
 * in a controlled test environment.
 */

import fs from 'node:fs'
import path from 'node:path'
import type { ElectronApplication, Page } from '@playwright/test'
import { _electron as electron } from '@playwright/test'

export interface ElectronTestApp {
  electronApp: ElectronApplication
  page: Page
  stop: () => Promise<void>
}

export interface ElectronAppOptions {
  /** Enable DevTools in the Electron window */
  devTools?: boolean
  /** Environment variables to pass to the app */
  env?: Record<string, string>
  /** Timeout for app startup in milliseconds */
  timeout?: number
}

/**
 * Start the Electron application for testing
 *
 * @param options - Configuration options for the Electron app
 * @returns A promise resolving to the Electron app and main page
 *
 * @example
 * ```ts
 * const { electronApp, page, stop } = await startElectronApp()
 * // Use page to interact with the app
 * await stop()
 * ```
 */
export async function startElectronApp(options: ElectronAppOptions = {}): Promise<ElectronTestApp> {
  const { env = {}, timeout = 30000 } = options

  // Use process.cwd() to get the project root
  // This works reliably in both local development and CI environments
  const projectRoot = process.cwd()
  const mainPath = path.join(projectRoot, 'dist-electron', 'electron', 'main.js')

  // Verify the build exists
  if (!fs.existsSync(mainPath)) {
    throw new Error(
      `Electron build not found at ${mainPath}. Please run 'npm run build:all' before running E2E tests.`
    )
  }

  // Build args for Electron
  const args = [mainPath]

  // Use a unique user data directory for each test to isolate data
  const userDataDir = path.join(
    projectRoot,
    'dist',
    'test-user-data',
    `test-${Date.now()}-${Math.random().toString(36).slice(2)}`
  )
  args.push(`--user-data-dir=${userDataDir}`)

  // Add X11 and headless flags when running in headless mode (via xvfb-run)
  // This forces Electron to use X11 instead of Wayland, allowing xvfb to capture the display
  if (process.env.HEADLESS === 'true') {
    args.push('--no-sandbox')
    args.push('--ozone-platform=x11')
    args.push('--disable-gpu')
    args.push('--disable-software-rasterizer')
    args.push('--disable-dev-shm-usage')
  } else {
    // Local development flags
    args.push('--ozone-platform=x11')
    args.push('--disable-vulkan')
  }

  // Set test environment variables
  const testEnv: Record<string, string> = {
    ...process.env,
    NODE_ENV: 'test',
    MESAME_LOG_LEVEL: 'silent',
    MESAME_PORT: env.MESAME_PORT || '0', // Use random available port
    ...env,
  } as Record<string, string>

  // Launch Electron app (Playwright will find the electron executable automatically)
  const electronApp = await electron.launch({
    args,
    env: testEnv,
  })

  // Get the main window with timeout
  const page = await electronApp.firstWindow({ timeout })

  // Wait for the app to be ready
  await page.waitForLoadState('domcontentloaded', { timeout })

  // Create stop function
  const stop = async () => {
    try {
      await electronApp.close()
    } catch {
      // Ignore errors during cleanup
    }

    // Clean up the temporary user data directory
    try {
      const fs = await import('node:fs/promises')
      await fs.rm(userDataDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }

    // Brief pause to let X11/system resources be released
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  return {
    electronApp,
    page,
    stop,
  }
}

/**
 * Wait for the Fastify server to be ready
 *
 * @param port - The port to check
 * @param timeout - Timeout in milliseconds
 */
export async function waitForServer(port: number, timeout = 10000): Promise<void> {
  const startTime = Date.now()
  const url = `http://localhost:${port}/health`

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return
      }
    } catch {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  throw new Error(`Server at port ${port} did not start within ${timeout}ms`)
}

/**
 * Get the server port from the running app
 */
export async function getServerPort(page: Page): Promise<number> {
  // Default port from config
  const defaultPort = 3000

  // Try to get the port from the URL
  const url = page.url()
  const match = url.match(/localhost:(\d+)/)
  if (match) {
    return Number.parseInt(match[1], 10)
  }

  return defaultPort
}
