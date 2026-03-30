import { resolve } from 'node:path'
import { defineConfig } from '@playwright/test'

/**
 * Playwright configuration for Web E2E testing
 *
 * This configuration supports:
 * - Running tests against the Fastify web server
 * - Parallel execution with multiple workers
 * - Headless mode for CI environments
 * - Debug mode for interactive debugging
 * - Automatic server startup via webServer config
 */

// Resolve absolute path for test database (Prisma creates it relative to schema.prisma)
const testDbPath = resolve(process.cwd(), 'prisma', 'test.db')

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  testDir: './e2e/tests',
  outputDir: 'dist/test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: [['list'], ['html', { outputFolder: 'dist/e2e-report', open: 'never' }]],
  timeout: process.env.CI ? 30000 : 10000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: process.env.CI ? 'off' : 'only-on-failure',
    video: process.env.CI ? 'off' : 'retain-on-failure',
    actionTimeout: process.env.CI ? 10000 : 3000,
    navigationTimeout: process.env.CI ? 15000 : 5000,
  },
  expect: {
    timeout: process.env.CI ? 5000 : 2000,
  },
  // Configure web server for E2E tests
  webServer: {
    command: `DATABASE_URL=file:${testDbPath} npm run start`,
    port: 3000,
    timeout: 30000,
    reuseExistingServer: false,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
