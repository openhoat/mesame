---
name: generate-coverage-report
description: Run tests with coverage and analyze results
disable-model-invocation: false
---

# Generate Coverage Report

Run tests with coverage collection and analyze the results.

## Command

```bash
npm run test:coverage
```

## Analysis

After running coverage:

1. **Overall coverage**: Report the total line, branch, function, and statement coverage percentages.

2. **Low coverage files**: Identify files with coverage below 80% and suggest which areas need more tests.

3. **Uncovered lines**: For critical files, highlight specific uncovered code paths.

4. **Recommendations**: Suggest specific test cases that would improve coverage the most.

## Important

- Coverage is collected via Vitest's built-in coverage support.
- Run from the project root or feature worktree root.