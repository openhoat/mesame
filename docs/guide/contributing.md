# Contributing

Thank you for considering contributing to MeSame! This guide will help you get started.

## Code of Conduct

Be respectful and considerate. We aim to create a welcoming environment for all contributors.

## How to Contribute

### Reporting Bugs

If you find a bug, please [create an issue](https://github.com/openhoat/mesame/issues/new) with:

- **Description**: Clear summary of the bug
- **Steps to Reproduce**: Detailed steps to trigger the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, Node.js version, MeSame version
- **Logs**: Relevant error messages (use `MESAME_LOG_LEVEL=debug`)

### Suggesting Features

Feature requests are welcome! Please [create an issue](https://github.com/openhoat/mesame/issues/new) with:

- **Use Case**: Why is this feature needed?
- **Proposed Solution**: How should it work?
- **Alternatives**: Other approaches you've considered

### Contributing Code

#### 1. Fork and Clone

```bash
# Fork the repo on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/mesame.git
cd mesame
```

#### 2. Create a Branch

```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch Naming**:
- `feat/` — New features
- `fix/` — Bug fixes
- `refactor/` — Code refactoring
- `docs/` — Documentation changes
- `test/` — Test additions/fixes
- `chore/` — Maintenance tasks

#### 3. Install Dependencies

```bash
npm install
npm run db:generate
npm run db:push
```

#### 4. Make Changes

Follow the coding standards:

- **TypeScript** — Strict mode enabled
- **Linting** — Biome for code quality
- **Testing** — Write tests for new features
- **Commits** — Use Conventional Commits format

**Conventional Commits Format**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `refactor`, `perf`, `docs`, `style`, `test`, `chore`

**Examples**:
```
feat(proxy): add support for streaming responses
fix(parser): handle PDF files without text layers
docs(readme): update installation instructions
test(analyzer): add tests for N-Gram extraction
```

#### 5. Run Quality Checks

Before committing, ensure your code passes all checks:

```bash
# Linting and formatting
npm run qa:fix  # Auto-fix issues
npm run qa      # Check for remaining issues

# Type checking
npm run typecheck

# Unit tests
npm run test

# Full validation (runs all checks)
npm run validate
```

#### 6. Commit Changes

```bash
git add .
git commit -m "feat(parser): add support for DOCX files"
```

**IMPORTANT**: Commits must follow Conventional Commits format (validated by commitlint).

#### 7. Push and Create PR

```bash
git push origin feat/your-feature-name
```

Then open a Pull Request on GitHub with:

- **Title**: Short description (same format as commits)
- **Description**: Detailed explanation of changes
- **Issue Link**: Reference related issues (`Fixes #123`)

## Development Workflow

### Running the App

```bash
# Start both servers (LLM + Web)
npm run dev

# Start LLM server only
npm run dev:llm

# Start Web server only
npm run dev:web
```

### Testing

```bash
# Unit tests (watch mode)
npm run test:watch

# Unit tests with coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

### Database Changes

If you modify the Prisma schema:

```bash
# 1. Edit prisma/schema.prisma
# 2. Generate Prisma client
npm run db:generate

# 3. Push changes to database
npm run db:push

# 4. Update seed data if needed
npm run db:seed
```

### Code Style

MeSame uses **Biome** for linting and formatting.

**Auto-fix issues**:
```bash
npm run qa:fix
```

**Check for issues**:
```bash
npm run qa
```

**Format code**:
```bash
npm run format
```

### Type Checking

Ensure TypeScript compiles without errors:

```bash
npm run typecheck
```

## Project Structure

See the [Architecture guide](/guide/architecture) for a detailed overview.

**Key directories**:

- `src/` — Backend (Fastify server)
- `web/` — Frontend (React + Vite)
- `prisma/` — Database schema and migrations
- `tests/` — E2E tests (Playwright)

## Writing Tests

### Unit Tests (Vitest)

Place tests next to the source files: `*.test.ts`

**Example**:

```typescript
import { describe, expect, test } from 'vitest'
import { analyzeStyle } from './styleAnalyzer'

describe('styleAnalyzer', () => {
  test('should extract TF-IDF keywords', () => {
    const text = 'Sample text for analysis'
    const result = analyzeStyle(text)

    expect(result.keywords).toBeInstanceOf(Array)
    expect(result.keywords.length).toBeGreaterThan(0)
  })
})
```

**Run tests**:
```bash
npm run test
```

### E2E Tests (Playwright)

Place E2E tests in `tests/` directory: `*.spec.ts`

**Example**:

```typescript
import { test, expect } from '@playwright/test'

test('should upload a document', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await page.click('text=Sources')
  await page.setInputFiles('input[type="file"]', 'sample.pdf')
  await expect(page.locator('text=sample.pdf')).toBeVisible()
})
```

**Run E2E tests**:
```bash
npm run test:e2e
```

## Documentation

When adding features, update the documentation:

- **README.md** — High-level overview
- **docs/guide/** — Detailed guides
- **Code comments** — Explain complex logic

## Pull Request Checklist

Before submitting your PR, ensure:

- [ ] Code follows TypeScript and Biome style guidelines
- [ ] All tests pass (`npm run validate`)
- [ ] New features have tests
- [ ] Documentation is updated
- [ ] Commits follow Conventional Commits format
- [ ] PR description explains the changes clearly

## Review Process

1. **Automated Checks** — CI runs linting, type checking, and tests
2. **Code Review** — Maintainers review your code
3. **Feedback** — Address review comments
4. **Merge** — Once approved, your PR will be merged

## Getting Help

- **Questions** — Open a [GitHub Discussion](https://github.com/openhoat/mesame/discussions)
- **Issues** — Check [existing issues](https://github.com/openhoat/mesame/issues)
- **Contact** — Email the author at <openhoat@gmail.com>

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Internationalization (i18n)

MeSame supports multiple languages (English and French).

### Adding a New Language

1. Create a new directory in `web/public/locales/` (e.g., `es/` for Spanish).
2. Copy `translation.json` from `en/` to the new directory.
3. Translate all values in the JSON file.
4. Update the language switcher/configuration to include the new language.

### Usage in Components

Use the `useTranslation` hook from `react-i18next`:

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  return <div>{t('common.appName')}</div>;
};
```

## Recognition

All contributors will be recognized in the project README and release notes.

Thank you for contributing to MeSame! 🎉
