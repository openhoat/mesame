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
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Electron apps require single worker
  reporter: [['list'], ['html', { outputFolder: 'dist/e2e-report', open: 'never' }]],
  timeout: 45000,
  use: {
    trace: 'on-first-retry',
    // Disable visual captures in CI mode for headless execution
    screenshot: process.env.CI ? 'off' : 'only-on-failure',
    // Enable video recording for demo generation
    video: process.env.DEMO_VIDEO ? 'on' : process.env.CI ? 'off' : 'retain-on-failure',
  },
  expect: {
    timeout: 10000,
  },
})
