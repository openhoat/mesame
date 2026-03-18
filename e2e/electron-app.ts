/**
 * Electron application launcher for E2E testing
 *
 * This module provides utilities to start and stop the Electron app
 * in a controlled test environment.
 */

import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ElectronApplication, Page } from '@playwright/test'
import { _electron as electron } from 'playwright'

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
 * Get the path to the Electron main process entry point
 */
function getElectronMainPath(): string {
  // Compiled Electron main (in dist-electron/electron/main.js)
  return path.join(__dirname, '../../dist-electron/electron/main.js')
}

/**
 * Get the path to the Electron executable
 */
function getElectronExecutablePath(): string {
  // Resolve electron package path to find the executable
  const electronPackagePath = require.resolve('electron/package.json')
  const electronPackageDir = path.dirname(electronPackagePath)
  const electronPath = path.join(electronPackageDir, 'path.txt')

  try {
    const fs = require('node:fs')
    const executableName = fs.readFileSync(electronPath, 'utf-8').trim()
    return path.join(electronPackageDir, executableName)
  } catch {
    // Fallback to default electron command
    return 'electron'
  }
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

  const mainPath = getElectronMainPath()
  const electronExecutable = getElectronExecutablePath()

  // Set test environment variables
  const testEnv: Record<string, string> = {
    ...process.env,
    NODE_ENV: 'test',
    MESAME_LOG_LEVEL: 'silent',
    ...env,
  } as Record<string, string>

  // Launch Electron app
  const electronApp = await electron.launch({
    executablePath: electronExecutable,
    args: [mainPath, '--ozone-platform=x11', '--disable-vulkan'],
    env: testEnv,
  })

  // Get the main window
  const page = await electronApp.firstWindow()

  // Wait for the app to be ready
  await page.waitForLoadState('domcontentloaded', { timeout })

  // Create stop function
  const stop = async () => {
    try {
      await electronApp.close()
    } catch {
      // Ignore errors during cleanup
    }
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
