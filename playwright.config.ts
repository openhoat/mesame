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

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  testDir: './e2e/tests',
  outputDir: 'dist/test-results',
  fullyParallel: false, // Electron apps require sequential execution
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 0 : 0, // No retries in CI for faster feedback
  workers: 1, // Electron apps require single worker (can't run in parallel)
  reporter: [['list'], ['html', { outputFolder: 'dist/e2e-report', open: 'never' }]],
  timeout: process.env.CI ? 30000 : 10000, // Global test timeout (30s in CI for Electron startup)
  use: {
    trace: 'on-first-retry',
    // Disable visual captures in CI mode for headless execution
    screenshot: process.env.CI ? 'off' : 'only-on-failure',
    // Enable video recording for demo generation
    video: process.env.DEMO_VIDEO ? 'on' : process.env.CI ? 'off' : 'retain-on-failure',
    actionTimeout: process.env.CI ? 10000 : 3000, // Timeout for actions (10s in CI)
    navigationTimeout: process.env.CI ? 15000 : 5000, // Timeout for page navigation (15s in CI)
  },
  expect: {
    timeout: process.env.CI ? 5000 : 2000, // Assertion timeout (5s in CI)
  },
})
