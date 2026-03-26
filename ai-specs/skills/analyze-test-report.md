---
name: analyze-test-report
description: Analyze Vitest test results
disable-model-invocation: false
---

# Analyze Test Report

Analyze the output of Vitest test runs for the MeSame project.

## Command

```bash
npm run test 2>&1
```

## Analysis

When analyzing Vitest output:

1. **Summary**: Total tests, passed, failed, skipped.

2. **Failing tests**: For each failure:
   - Test file and test name
   - Error message and stack trace
   - Expected vs actual values
   - Root cause analysis
   - Suggested fix

3. **Slow tests**: Identify tests that take unusually long and suggest optimization.

4. **Patterns**: Look for patterns in failures (e.g., all tests in one module failing, common assertion errors).

## Important

- Tests use the `node` environment (not Happy DOM or jsdom).
- Test framework: Vitest.
- Run from the project root or feature worktree root.
