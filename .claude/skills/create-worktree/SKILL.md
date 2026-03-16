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
cd /home/openhoat/work/mesame
git checkout main
git pull
```

### 2. Create Branch and Worktree

```bash
cd /home/openhoat/work/mesame
BRANCH_NAME="feature/<name>"
git branch "$BRANCH_NAME"
git worktree add /home/openhoat/work/mesame-<name> "$BRANCH_NAME"
```

### 3. Initialize Worktree

```bash
cd /home/openhoat/work/mesame-<name>
npm install
```

## Important

- The main project is at `/home/openhoat/work/mesame`.
- Worktrees are created at `/home/openhoat/work/mesame-<name>`.
- The `<name>` should be a short, kebab-case slug describing the feature.
- Always pull latest `main` before creating the branch.
