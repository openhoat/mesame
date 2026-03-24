import { defineConfig } from '@playwright/test'

/**
 * Playwright configuration for Electron E2E testing
 *
 * This configuration supports:
 * - Running tests against the Electron app
 * - Headless mode for CI environments (set HEADLESS=true)
 * - Debug mode for interactive debugging
 */

export default defineConfig({
  testDir: './e2e/tests',
  outputDir: 'dist/test-results',
  fullyParallel: false, // Electron app tests should run sequentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // Reduced from 2 to 1 for faster CI
  workers: 1, // Electron apps require single worker
  reporter: [['list'], ['html', { outputFolder: 'dist/e2e-report', open: 'never' }]],
  timeout: 30000, // Reduced from 45s to 30s
  use: {
    trace: process.env.CI ? 'off' : 'on-first-retry', // Disable trace in CI to avoid debugger issues
    // Disable visual captures in CI mode for headless execution
    screenshot: process.env.CI ? 'off' : 'only-on-failure',
    // Enable video recording for demo generation
    video: process.env.DEMO_VIDEO ? 'on' : process.env.CI ? 'off' : 'retain-on-failure',
  },
  expect: {
    timeout: 5000, // Reduced from 10s to 5s
  },
})
