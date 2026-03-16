---
name: analyze-quality-report
description: Analyze Biome linting and formatting output
disable-model-invocation: false
---

# Analyze Quality Report

Analyze the output of Biome (linting and formatting) for the MeSame project.

## Command

```bash
cd /home/openhoat/work/mesame && npm run qa 2>&1
```

## Analysis

When analyzing Biome output:

1. **Categorize issues** by type:
   - Formatting issues (spacing, indentation, line length)
   - Lint errors (unused variables, missing types, etc.)
   - Code style violations

2. **Prioritize** by severity:
   - Errors (must fix)
   - Warnings (should fix)
   - Info (nice to fix)

3. **Suggest fixes**:
   - For auto-fixable issues: `npm run qa:fix`
   - For manual fixes: provide specific code changes

4. **Summary**: Provide a count of issues by category and an overall health assessment.

## Important

- The project uses Biome for linting and formatting.
- Auto-fix command: `npm run qa:fix`.
- Run from the project root or feature worktree root.
