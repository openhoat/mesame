---
name: parallel-test
description: Run tests in parallel using subagents
disable-model-invocation: false
---

# Parallel Test Execution

Run test files in parallel using subagents for faster feedback.

## Test File Locations

MeSame test files are organized by module:
- `src/services/*.test.ts` - Service layer tests
- `src/engine/*.test.ts` - Engine/NLP pipeline tests
- `src/proxy/*.test.ts` - Proxy layer tests

## Strategy

1. **Discover test files**:
```bash
find src -name "*.test.ts" -type f
```

2. **Group by module**: Split test files into groups based on their directory:
   - Group 1: `src/services/*.test.ts`
   - Group 2: `src/engine/*.test.ts`
   - Group 3: `src/proxy/*.test.ts`
   - Group 4: Any remaining test files

3. **Run in parallel**: Use TaskCreate to spawn subagents, each running one group:
```bash
npx vitest run <file1> <file2> ...
```

4. **Collect results**: Gather results from all subagents and provide a unified report:
   - Total tests: passed / failed / skipped
   - Per-group breakdown
   - Detailed failure information

## Important

- Run from the project root (or feature worktree root).
- Tests use the `node` environment.
- If any group fails, report all failures together at the end.
