# Quality Check

## Objective

This rule ensures that each code modification respects the quality standards defined by Biome.

## When to execute this check

After each code modification (creation, editing, deletion of files), systematically run the quality check before moving to the next task.

## Verification process

### 1. Run the `validate` script

```bash
npm run validate
```

### 2. Analyze the result

- **If check passes** (no errors AND no warnings): Continue with the next task
- **If check fails** (errors or warnings detected): Proceed to step 3

**IMPORTANT**: Warnings must be treated as errors and fixed before proceeding.

### 3. Fix errors and warnings

#### 3.1. Run automatic fixes

```bash
npm run qa:fix
```

#### 3.2. Apply unsafe fixes if needed

If warnings remain after step 3.1, apply unsafe fixes:

```bash
npx biome check --write --unsafe .
```

#### 3.3. Manual fixes

If issues remain:

1. Identify remaining errors/warnings in the output
2. Fix them manually
3. Re-run `npm run validate` to confirm the fix

### 4. Re-verify

Re-run `npm run validate` to confirm **ALL** errors and warnings are fixed.

The validation must show:
- `Checked XX files. No fixes applied.` (no formatting issues)
- No warnings
- No errors
- All tests passing

## Important rules

- **Never move to the next task** without successfully running `npm run validate`
- **Fix ALL warnings and errors**, not just the ones you introduced
- **Zero tolerance** for warnings - they must be fixed before committing
- **Always commit fixes** separately from feature changes when possible
