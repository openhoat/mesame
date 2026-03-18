# E2E Testing with Playwright

This directory contains end-to-end (E2E) tests for the MeSame Electron application using Playwright.

## Structure

```
e2e/
├── electron-app.ts      # Electron app launcher utilities
├── fixtures.ts          # Playwright test fixtures
├── mocks.ts             # Mock data and utilities
├── helpers/
│   └── api.ts           # API helper functions
└── tests/
    ├── app.smoke.test.ts      # App startup and UI tests
    ├── proxy.endpoints.test.ts # Proxy API endpoint tests
    └── admin.dashboard.test.ts # Admin dashboard tests
```

## Running Tests

### Prerequisites

1. Build the Electron app:
   ```bash
   npm run build:all
   ```

2. Generate Prisma client:
   ```bash
   npm run db:generate
   ```

### Test Commands

```bash
# Run E2E tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Run tests in headless mode (CI)
npm run test:e2e:headless
```

## Writing Tests

### Basic Test Structure

```typescript
import { expect, test } from '../fixtures.js'

test.describe('My Test Suite', () => {
  test('should do something', async ({ electronApp, port }) => {
    const { page } = electronApp

    // Navigate to the app
    await page.goto(`http://localhost:${port}/`)

    // Make assertions
    expect(await page.title()).toContain('MeSame')
  })
})
```

### Using Fixtures

The test fixtures provide:

- `electronApp`: An Electron app instance that starts before each test and stops after
- `port`: The server port for making API requests

### API Helpers

Use the API helpers for making requests:

```typescript
import { apiRequest, chatCompletion } from '../helpers/api.js'

// Make a generic API request
const response = await apiRequest(page, `http://localhost:${port}/health`)

// Make a chat completion request
const response = await chatCompletion(
  page,
  port,
  [{ role: 'user', content: 'Hello' }],
  'gpt-4o-mini'
)
```

### Mock Data

Import mock data from `mocks.ts`:

```typescript
import { mockOpenAIResponses, mockStyleProfiles } from '../mocks.js'
```

## CI Integration

E2E tests are automatically run in CI using `xvfb-run` for headless execution on Linux.

See `.github/workflows/ci.yml` for the CI configuration.

## Configuration

The Playwright configuration is in `playwright.config.ts` at the project root.

Key settings:
- Tests run sequentially (`workers: 1`) because Electron apps require a single instance
- Timeout is 30 seconds to accommodate app startup
- Screenshots and videos are captured on failure
- Traces are captured on retry

## Troubleshooting

### App doesn't start

1. Ensure the app is built: `npm run build:all`
2. Check that Electron is installed: `npm install`
3. Verify the main path in `electron-app.ts`

### Tests timeout

1. Increase the timeout in `playwright.config.ts`
2. Check if the server port is correctly detected

### API tests fail

1. Ensure the server is running within the Electron app
2. Check if environment variables are set correctly
3. Verify the API key is configured (if required)

## Best Practices

1. **Use fixtures**: Always use the provided fixtures to ensure clean test state
2. **Clean up**: Tests should clean up after themselves
3. **Independence**: Each test should be independent of others
4. **Timeouts**: Use appropriate timeouts for async operations
5. **Error handling**: Handle errors gracefully in tests