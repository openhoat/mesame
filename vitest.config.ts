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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'dist/coverage',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.d.ts'],
    },
  },
})
