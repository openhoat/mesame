import { defineConfig } from '@playwright/test'

/**
 * Playwright configuration for Electron E2E testing
 *
 * This configuration supports:
 * - Running tests against the Electron app
 * - Headless mode for CI environments
 * - Debug mode for interactive debugging
 */

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false, // Electron app tests should run sequentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Electron apps require single worker
  reporter: [['list'], ['html', { outputFolder: 'e2e-report', open: 'never' }]],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  // Increase timeout for Electron app startup
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  // Configure projects for different test environments
  projects: [
    {
      name: 'default',
      use: {
        // Default project for local development
      },
    },
    {
      name: 'headless',
      use: {
        // Headless mode for CI
      },
    },
  ],
})
