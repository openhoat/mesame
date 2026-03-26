---
name: fix-e2e
description: Diagnose and fix unstable E2E tests
disable-model-invocation: false
---

# Fix E2E

Workflow for diagnosing and fixing unstable Playwright E2E tests.

## Purpose

This skill helps identify patterns in E2E test failures and provides targeted fixes for common issues.

## Steps

### 1. Analyze Recent Failures

Search for E2E-related fixes in Git history:
```bash
git log --oneline --grep="fix(e2e)" --since="1 month ago"
```

Look for patterns in commit messages to identify recurring issues.

### 2. Identify Failure Patterns

Check recent test runs for common failure types:

**Timeout Issues:**
```bash
# Look for timeout errors in test output
grep -r "Timeout" dist/test-results/
```

**Selector Issues:**
```bash
# Look for selector errors
grep -r "Selector" dist/test-results/
grep -r "locator" dist/test-results/
```

**API Mock Issues:**
```bash
# Look for API-related errors
grep -r "API" dist/test-results/
grep -r "fetch" dist/test-results/
```

### 3. Apply Common Fixes

Based on failure pattern, apply appropriate fix:

#### Timeout Fixes

**Problem:** Test times out waiting for element

**Solution 1:** Increase timeout for specific action
```typescript
await page.getByTestId('slow-element').click({ timeout: 10000 })
```

**Solution 2:** Add explicit wait
```typescript
await page.waitForSelector('[data-testid="element"]', { state: 'visible' })
```

**Solution 3:** Use waitFor with condition
```typescript
await page.waitForFunction(() => {
  return document.querySelector('[data-testid="loaded"]') !== null
})
```

#### Selector Fixes

**Problem:** Element not found or selector is flaky

**Solution 1:** Use data-testid instead of CSS classes
```typescript
// Bad: relies on implementation
await page.locator('.submit-button').click()

// Good: uses semantic test ID
await page.getByTestId('submit-button').click()
```

**Solution 2:** Wait for element to be ready
```typescript
const button = page.getByTestId('submit-button')
await button.waitFor({ state: 'visible' })
await button.click()
```

**Solution 3:** Use more specific selectors
```typescript
// Bad: too generic
await page.locator('button').click()

// Good: specific and stable
await page.locator('form[data-testid="login-form"] button[type="submit"]').click()
```

#### API Mock Fixes

**Problem:** Real API calls causing flaky tests

**Solution 1:** Add route intercept
```typescript
await page.route('**/api/v1/**', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ data: 'mocked' })
  })
})
```

**Solution 2:** Wait for API response
```typescript
const responsePromise = page.waitForResponse(response =>
  response.url().includes('/api/v1/') && response.status() === 200
)
await page.click('[data-testid="fetch-button"]')
await responsePromise
```

**Solution 3:** Use fixtures for consistent test data
```typescript
// In e2e/fixtures.ts
export const mockApiResponse = {
  data: { id: 1, name: 'Test' }
}

// In test
await page.route('**/api/v1/data', route => {
  route.fulfill({ body: JSON.stringify(mockApiResponse) })
})
```

### 4. Validation Checklist

After applying fix, verify:

- [ ] Test passes consistently (run 3-5 times locally)
- [ ] Fix doesn't break other tests
- [ ] Test still validates correct behavior
- [ ] Selectors use data-testid where possible
- [ ] Waits are explicit and meaningful
- [ ] Mocks are properly scoped
- [ ] Test is independent (no shared state)

### 5. Document the Fix

Add comment explaining why the fix was needed:
```typescript
// Increased timeout because Electron app startup is slower in CI
await page.waitForSelector('[data-testid="app-ready"]', { timeout: 10000 })
```

## Common E2E Test Issues

### Race Conditions
**Symptom:** Test passes sometimes, fails others
**Fix:** Add explicit waits for state changes

### Timing Issues
**Symptom:** Test fails with "element not found"
**Fix:** Use waitFor methods instead of hard delays

### State Pollution
**Symptom:** Test fails when run after specific other test
**Fix:** Ensure proper cleanup in beforeEach/afterEach

### Environment Differences
**Symptom:** Test passes locally but fails in CI
**Fix:** Check CI-specific conditions (headless, resources, timing)

## Best Practices

1. **Use data-testid selectors**
   - More stable than CSS classes
   - Self-documenting
   - Won't break on UI changes

2. **Explicit waits over delays**
   - Use `waitFor*` methods
   - Avoid `setTimeout` or `page.waitForTimeout()`
   - Wait for actual conditions

3. **Isolate tests**
   - No shared state between tests
   - Clean up after each test
   - Use beforeEach for setup

4. **Mock external services**
   - Don't rely on real APIs
   - Use consistent test data
   - Handle network errors

5. **Use fixtures**
   - Reusable test helpers
   - Consistent setup/teardown
   - Better error handling

## Resources

- Playwright Best Practices: https://playwright.dev/docs/best-practices
- Playwright Debugging: https://playwright.dev/docs/debug
- Test Selectors Guide: https://playwright.dev/docs/locators
