# Integration Tests

This directory contains **integration tests** that test the Fastify server with real or mocked LLM API calls.

## Difference from E2E Tests

| Aspect | Integration Tests (here) | E2E Tests (`e2e/`) |
|--------|-------------------------|-------------------|
| **Framework** | Vitest | Playwright |
| **Scope** | API endpoints only | Full Electron app |
| **UI tested** | ❌ No | ✅ Yes |
| **Speed** | ⚡ Fast (~30s) | 🐢 Slow (~3min) |
| **Mocks** | ✅ Can use mocks | ❌ Real app |
| **Run command** | `npm test` | `npm run test:e2e` |

## What's Tested Here

### `style-injection.test.ts`

Tests the **style injection functionality** at the API level:

- ✅ Injecting system prompts into LLM requests
- ✅ Merging style prompts with existing system messages
- ✅ Using default prompts when no profile exists
- ✅ Verifying style influence in LLM responses (structure, tone, examples)

**Features:**
- Uses `buildApp()` to create a Fastify instance
- Can use **real API calls** (set `TEST_REAL_API=true`)
- Mocks the `styleProfileService` to control test scenarios
- Validates response structure and content

## Running Tests

```bash
# Run all tests (unit + integration)
npm test

# Run only integration tests
npm test -- src/test/integration

# Run with real API calls (requires API key)
TEST_REAL_API=true npm test -- src/test/integration

# Watch mode
npm run test:watch -- src/test/integration
```

## Environment Variables

- `TEST_REAL_API=true` - Use real LLM API instead of mocks
- `MESAME_PROVIDER` - LLM provider (ollama, openai, anthropic, google)
- `MESAME_MODEL` - Model to use for tests
- Provider-specific API keys (e.g., `OPENAI_API_KEY`)

## Writing New Integration Tests

```typescript
import { buildApp } from '../../app.js'
import { describe, expect, test, beforeEach, afterEach } from 'vitest'

describe('My Integration Test', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = await buildApp()
  })

  afterEach(async () => {
    await app.close()
  })

  test('should do something', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      payload: { /* ... */ }
    })

    expect(response.statusCode).toBe(200)
  })
})
```

## When to Use Integration vs E2E Tests

### Use Integration Tests when:
- Testing API endpoints in isolation
- Need fast feedback during development
- Testing with mocked services
- Validating request/response formats

### Use E2E Tests (`e2e/`) when:
- Testing the complete user workflow
- Testing UI interactions
- Testing Electron-specific features
- Validating the full application stack

## Best Practices

1. **Keep tests fast** - Integration tests should run in seconds
2. **Use mocks when possible** - Real API calls are expensive and slow
3. **Test edge cases** - Empty inputs, invalid data, error conditions
4. **Validate response structure** - Check both success and error responses
5. **Clean up resources** - Always close the Fastify app after tests
