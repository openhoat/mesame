import { config as dotenvConfig } from 'dotenv'
import { defineConfig } from 'vitest/config'

// Load .env before anything else to prevent noisy dotenv logs from dependencies
dotenvConfig({ quiet: true })

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./src/test/setup.ts'],
    // Use thread pool for parallel execution (faster in CI)
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: process.env.CI ? 4 : undefined, // Limit threads in CI
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'dist/coverage',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.d.ts'],
    },
  },
})
