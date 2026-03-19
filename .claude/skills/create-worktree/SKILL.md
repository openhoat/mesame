---
name: create-worktree
description: Create a git worktree for a feature branch
disable-model-invocation: false
---

# Create Worktree

Manually create a git worktree for a new feature branch.

## Steps

### 1. Ensure on Main

```bash
git checkout main
git pull
```

### 2. Create Branch and Worktree

```bash
BRANCH_NAME="feature/<name>"
git branch "$BRANCH_NAME"
git worktree add ../<project-name>-<name> "$BRANCH_NAME"
```

### 3. Initialize Worktree

```bash
cd ../<project-name>-<name>
npm install
```

## Important

- Run from the main worktree (main branch).
- Worktrees are created at `../<project-name>-<name>` relative to main worktree.
- The `<name>` should be a short, kebab-case slug describing the feature.
- Always pull latest `main` before creating the branch.
