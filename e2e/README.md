# E2E Testing with Playwright

This directory contains end-to-end (E2E) tests for the MeSame Electron application using Playwright.

## Structure

```
e2e/
├── electron-app.ts           # Electron app launcher utilities
├── fixtures.ts               # Playwright test fixtures
├── mocks.ts                  # Mock data and utilities
├── fixtures/
│   └── test-data.ts          # 🆕 Reusable test data (sources, profiles, messages)
├── helpers/
│   ├── api.ts                # API helper functions
│   └── setup.ts              # 🆕 Setup/cleanup utilities
└── tests/
    ├── app.smoke.test.ts               # App startup and UI tests
    ├── admin.dashboard.test.ts         # Admin dashboard tests
    ├── chat.interface.test.ts          # Chat UI tests
    ├── chat.simple.test.ts             # Simple chat message tests
    ├── chat.streaming.test.ts          # Streaming response tests
    ├── proxy.endpoints.test.ts         # Proxy API endpoint tests
    ├── config.providers.test.ts        # 🆕 Provider configuration tests
    ├── workflow.style-profile.test.ts  # 🆕 Complete style profile workflow
    ├── navigation.test.ts              # 🆕 Navigation and state persistence
    ├── style.injection.test.ts         # 🆕 Style injection quality tests
    └── performance.test.ts             # 🆕 Performance and metrics tests
```

## New E2E Tests 🆕

### Provider Configuration Tests

**File:** `config.providers.test.ts`

Tests for LLM provider configuration workflow:
- ✅ Config page rendering with all fields
- ✅ Loading current configuration
- ✅ Switching between providers (OpenAI, Claude, Ollama, Gemini)
- ✅ Saving and persisting configuration
- ✅ Field validation
- ✅ Secure API key handling
- ✅ Reset to default values
- ✅ Concurrent config changes

### Style Profile Workflow Tests

**File:** `workflow.style-profile.test.ts`

Complete end-to-end workflow tests covering:

**Main Workflow:**
1. Upload source document
2. Create style profile
3. Navigate to chat
4. Send message
5. Verify style injection in response

**Additional Coverage:**
- ✅ Multiple profile management
- ✅ Profile switching
- ✅ Profile persistence after reload
- ✅ Profile update/editing
- ✅ Profile deletion
- ✅ Validation for empty fields

### Test Data Fixtures

**File:** `fixtures/test-data.ts`

Provides reusable test data:
- **Test Sources**: Casual, technical, professional, minimal writing styles
- **Test Profiles**: Pre-configured style profiles
- **Test Messages**: Common chat messages
- **Provider Configs**: OpenAI, Anthropic, Ollama, Gemini
- **Style Indicators**: Regex patterns for validating style injection

### Navigation & State Tests 🆕

**File:** `navigation.test.ts`

Tests for navigation and state persistence:
- ✅ Navigation between all dashboard sections
- ✅ Chat message preservation during navigation
- ✅ Form data preservation
- ✅ Rapid navigation handling
- ✅ Active section indicators
- ✅ Data persistence after page reload
- ✅ Multiple reloads without data loss
- ✅ Browser back/forward buttons
- ✅ Error recovery during navigation

### Style Injection Quality Tests 🆕

**File:** `style.injection.test.ts`

Tests for verifying style injection quality:
- ✅ Casual style injection
- ✅ Technical style injection
- ✅ Professional style injection
- ✅ Minimal style injection
- ✅ Style injection via proxy API
- ✅ Requests without style profile
- ✅ Style comparison between profiles
- ✅ Long messages with style
- ✅ Rapid consecutive messages

### Performance Tests 🆕

**File:** `performance.test.ts`

Performance benchmarks and metrics:
- ✅ API response times (health, models, chat)
- ✅ Streaming performance (TTFB, chunks)
- ✅ Chat interface responsiveness
- ✅ Typing input latency
- ✅ Message rendering speed
- ✅ Multiple messages performance
- ✅ File upload performance (small/large)
- ✅ Profile creation performance
- ✅ Configuration save performance
- ✅ Memory and resource usage
- ✅ Navigation efficiency

### Setup & Cleanup Helpers

**File:** `helpers/setup.ts`

Utilities for test environment management:
- `uploadTestSource()` - Upload source documents
- `setupTestProfile()` - Create complete test profile
- `cleanupSources()` - Delete all sources
- `cleanupProfiles()` - Delete all profiles
- `cleanupTestData()` - Complete cleanup
- `navigateToSection()` - Navigate dashboard sections
- `matchesStylePattern()` - Verify style patterns in text

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

### Using Test Data Fixtures

```typescript
import { TEST_SOURCES, TEST_PROFILES } from '../fixtures/test-data.js'
import { setupTestProfile, cleanupTestData } from '../helpers/setup.js'

test.beforeEach(async ({ electronApp, port }) => {
  await cleanupTestData(page, port)
})

test('should create profile', async ({ electronApp, port }) => {
  const { page } = electronApp

  const result = await setupTestProfile(
    page,
    port,
    TEST_PROFILES.casual,
    TEST_SOURCES.casual
  )

  expect(result.success).toBe(true)
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

## Best Practices

### 1. Test Isolation

Always clean up test data before and after tests:

```typescript
test.beforeEach(async ({ electronApp, port }) => {
  await cleanupTestData(page, port)
})

test.afterEach(async ({ electronApp, port }) => {
  await cleanupTestData(page, port)
})
```

### 2. Use Test Data Fixtures

Use predefined test data from `test-data.ts`:

```typescript
import { TEST_SOURCES, TEST_PROFILES } from '../fixtures/test-data.js'

await setupTestProfile(page, port, TEST_PROFILES.casual, TEST_SOURCES.casual)
```

### 3. Wait for Elements Properly

Use Playwright's built-in waiting mechanisms:

```typescript
// ✅ Good
await expect(page.locator('button')).toBeVisible({ timeout: 5000 })

// ❌ Bad
await page.waitForTimeout(5000) // Avoid arbitrary waits
```

### 4. Handle Optional Elements

Check element count before interacting:

```typescript
const buttonCount = await button.count()
if (buttonCount > 0) {
  await button.click()
}
```

### 5. Lenient Assertions in CI

Be lenient for tests that depend on external APIs:

```typescript
// Accept multiple status codes when API key might be missing
expect([200, 401, 500]).toContain(response.status)
```

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

### Test Cleanup Issues

If tests are leaving data behind:

```typescript
// Manually clean up
import { cleanupTestData } from '../helpers/setup.js'

await cleanupTestData(page, port)
```

## Debugging

### View Test Report

```bash
npx playwright show-report dist/e2e-report
```

### Inspect Test Traces

```bash
npx playwright show-trace dist/test-results/<test-name>/trace.zip
```

### Enable Video Recording

```bash
DEMO_VIDEO=true npm run test:e2e
```

## Coverage

E2E tests cover critical user journeys:

### Core Functionality
- ✅ App startup and initialization
- ✅ Source document upload and management
- ✅ Style profile creation and CRUD operations
- ✅ Provider configuration and persistence
- ✅ Chat interface and messaging
- ✅ Streaming responses
- ✅ Proxy API endpoints

### Advanced Features
- ✅ Navigation and state management
- ✅ Data persistence (profiles, config, messages)
- ✅ Style injection quality validation
- ✅ Browser navigation (back/forward)
- ✅ Error recovery

### Performance & Quality
- ✅ API response times
- ✅ Streaming latency (TTFB)
- ✅ UI responsiveness
- ✅ Memory usage
- ✅ File upload performance
- ✅ Multi-message handling

### Edge Cases
- ✅ Rapid navigation
- ✅ Multiple reloads
- ✅ Long messages
- ✅ Concurrent requests
- ✅ Large file uploads

## Future Improvements

Recommended additions:

1. **Accessibility Tests** - Keyboard navigation, ARIA attributes, screen readers
2. **Visual Regression Tests** - Screenshot comparisons for UI consistency
3. **Multi-Provider Integration Tests** - Real API tests with different LLM providers
4. **Stress Tests** - High concurrency, many sources, very long conversations
5. **Security Tests** - Input validation, XSS prevention, API key protection
6. **Offline Mode Tests** - Behavior without network connection
7. **Cross-Platform Tests** - Windows, macOS, Linux specific behaviors

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Electron Testing Guide](https://www.electronjs.org/docs/latest/tutorial/automated-testing)
- [Project Testing Rules](../.claude/rules/testing.md)
