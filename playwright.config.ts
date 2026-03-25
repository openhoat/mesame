import { defineConfig } from '@playwright/test'

/**
 * Playwright configuration for Electron E2E testing
 *
 * This configuration supports:
 * - Running tests against the Electron app
 * - Sequential execution (Electron apps can't run in parallel)
 * - Isolated database per test run
 * - Headless mode for CI environments (set HEADLESS=true)
 * - Debug mode for interactive debugging
 */

export default defineConfig({
  testDir: './e2e/tests',
  outputDir: 'dist/test-results',
  fullyParallel: false, // Electron apps require sequential execution
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // Reduced from 2 to 1 for faster CI
  workers: 1, // Electron apps require single worker (can't run in parallel)
  reporter: [['list'], ['html', { outputFolder: 'dist/e2e-report', open: 'never' }]],
  timeout: 10000, // Reduced from 30s to 10s to identify slow tests
  use: {
    trace: 'on-first-retry',
    // Disable visual captures in CI mode for headless execution
    screenshot: process.env.CI ? 'off' : 'only-on-failure',
    // Enable video recording for demo generation
    video: process.env.DEMO_VIDEO ? 'on' : process.env.CI ? 'off' : 'retain-on-failure',
  },
  expect: {
    timeout: 3000, // Reduced from 5s to 3s
  },
})
