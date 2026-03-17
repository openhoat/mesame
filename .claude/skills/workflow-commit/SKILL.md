---
name: workflow-commit
description: Complete commit workflow with validation, changelog, and kanban update
disable-model-invocation: false
---

# Workflow Commit

Complete commit workflow: validate, commit, update changelog, and update kanban. Must be run from a feature worktree.

## Prerequisites

- Must be in a feature worktree (e.g., `../mesame-<feature>` relative to main).
- Must NOT be on `main` branch.

## Steps

### 1. Validate

```bash
npm run validate
```

All checks must pass before proceeding. Fix any issues.

### 2. Commit Changes

```bash
git add <relevant-files>
git commit -m "<conventional-commit-message>"
```

Use conventional commit format (feat, fix, refactor, docs, chore, etc.).

### 3. Update Changelog

```bash
npm run changelog
```

If the changelog script is available, run it from the main worktree. Otherwise skip this step.

### 4. Update KANBAN

If the task status needs updating, modify `KANBAN.md` on the main worktree:
- Update task progress notes if applicable.

## Important

- The main worktree is the project root (main branch).
- Feature worktrees are at `../mesame-<feature>` relative to main.
- Always validate before committing.
- Use conventional commit messages.