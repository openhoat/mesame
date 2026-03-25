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
  retries: process.env.CI ? 0 : 0, // No retries in CI for faster feedback
  workers: 1, // Electron apps require single worker (can't run in parallel)
  reporter: [['list'], ['html', { outputFolder: 'dist/e2e-report', open: 'never' }]],
  timeout: 10000, // Global test timeout (optimized for faster feedback)
  use: {
    trace: 'on-first-retry',
    // Disable visual captures in CI mode for headless execution
    screenshot: process.env.CI ? 'off' : 'only-on-failure',
    // Enable video recording for demo generation
    video: process.env.DEMO_VIDEO ? 'on' : process.env.CI ? 'off' : 'retain-on-failure',
    actionTimeout: 3000, // Timeout for actions (click, fill, etc.)
    navigationTimeout: 5000, // Timeout for page navigation
  },
  expect: {
    timeout: 2000, // Assertion timeout
  },
})
