---
name: run-tests
description: Run unit tests with Vitest
disable-model-invocation: false
---

# Run Tests

Run the MeSame project unit tests using Vitest.

## Commands

### Run all tests
```bash
cd /home/openhoat/work/mesame && npm run test
```

### Run tests with coverage
```bash
cd /home/openhoat/work/mesame && npm run test:coverage
```

### Run a specific test file
```bash
cd /home/openhoat/work/mesame && npx vitest run <path-to-test-file>
```

## Analysis

When tests fail:
1. Report each failing test with its full name and location.
2. Show the expected vs actual values.
3. Identify the root cause (code bug, outdated test, missing mock, etc.).
4. Suggest a concrete fix.

## Important

- Do NOT reference E2E tests, Playwright, or browser-based testing - this project does not use them.
- Tests use the `node` environment by default.
- If in a feature worktree (e.g., `/home/openhoat/work/mesame-<feature>`), run from that worktree root.
