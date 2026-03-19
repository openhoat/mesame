---
name: e2e-test
description: Run E2E tests with automatic diagnostics
disable-model-invocation: false
---

# E2E Test

Run Playwright E2E tests with automatic diagnostics and environment-aware configuration.

## Usage

```bash
# For CI environments (headless mode)
/e2e-test

# For local development (UI mode)
/e2e-test --ui

# For debugging
/e2e-test --debug
```

## Steps

### 1. Detect Environment

Check if running in CI environment:
```bash
if [ -n "$CI" ]; then
  MODE="CI"
else
  MODE="LOCAL"
fi
```

### 2. Run Tests

**CI Mode (Headless):**
```bash
npm run test:e2e:headless
```

**Local Mode (UI):**
```bash
npm run test:e2e:ui
```

**Debug Mode:**
```bash
npm run test:e2e:debug
```

### 3. Analyze Results

If tests fail, automatically diagnose:

**Check Playwright Report:**
```bash
if [ -d "dist/e2e-report" ]; then
  echo "📊 E2E Report available at: dist/e2e-report/index.html"
  npx playwright show-report dist/e2e-report
fi
```

**Check Screenshots:**
```bash
if [ -d "dist/test-results" ]; then
  echo "📸 Screenshots available at: dist/test-results/"
  find dist/test-results -name "*.png" -exec echo "  - {}" \;
fi
```

**Check Traces:**
```bash
if [ -d "dist/test-results" ]; then
  TRACES=$(find dist/test-results -name "trace.zip")
  if [ -n "$TRACES" ]; then
    echo "🔍 Traces available:"
    echo "$TRACES" | while read trace; do
      echo "  - $trace"
      echo "    View with: npx playwright show-trace $trace"
    done
  fi
fi
```

### 4. Display Summary

Show test results summary:
- Number of tests passed/failed
- Duration
- Links to reports and artifacts

## Environment Configuration

### CI Environment
- Headless mode enabled
- Retries: 2
- Screenshots: off
- Video: off
- Timeout: 45s

### Local Environment
- UI mode available
- Retries: 0
- Screenshots: only-on-failure
- Video: retain-on-failure
- Timeout: 45s

## Troubleshooting

### Common Issues

**Test timeout:**
```bash
# Increase timeout in playwright.config.ts
timeout: 60000  # 60 seconds
```

**Selector not found:**
```bash
# Use data-testid selectors
<button data-testid="submit-button">Submit</button>
await page.getByTestId('submit-button').click()
```

**App not starting:**
```bash
# Check build artifacts
npm run build:all
# Verify Electron can start
npm run start:electron
```

## Integration with CI

In GitHub Actions:
```yaml
- name: Run E2E tests
  run: npm run test:e2e:headless
  env:
    CI: true
```

## Important

- Always run `npm run build:all` before E2E tests
- E2E tests require Electron app to be built
- Use `test:e2e:ui` for debugging locally
- Use `test:e2e:headless` in CI pipelines
- Check `dist/e2e-report/` for detailed HTML reports
- Check `dist/test-results/` for screenshots and traces
