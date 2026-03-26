---
name: complete-task
description: Complete current task in feature worktree
disable-model-invocation: false
---

# Complete Task

Finalize and submit the current task from a feature worktree.

## Prerequisites

- Must be in a feature worktree (e.g., `../<project-name>-<feature>` relative to main).
- **Error if on `main` branch** - this skill is only for feature branches.

## Steps

### 1. Verify Branch

```bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" = "main" ]; then
  echo "ERROR: Cannot complete task from main branch. Switch to a feature worktree."
  exit 1
fi
```

### 2. Run Validation

```bash
npm run validate
```

Fix any issues that arise. All checks must pass before proceeding.

### 3. Stage and Commit

```bash
git add <relevant-files>
git commit -m "feat: description of completed work"
```

Use conventional commit messages (feat, fix, refactor, docs, etc.).

### 4. Push

```bash
git push -u origin "$(git rev-parse --abbrev-ref HEAD)"
```

### 5. Create Pull Request

```bash
gh pr create --title "feat: task title" --body "$(cat <<'EOF'
## Summary
- Description of changes

## Test plan
- [ ] Validation passes
- [ ] Tests pass
EOF
)"
```

## Important

- The main worktree is the project root (main branch).
- Feature worktrees are at `../<project-name>-<feature>` relative to main.
- Always validate before committing.
- Never run this on the `main` branch.
