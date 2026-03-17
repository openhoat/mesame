---
name: cleanup-worktree
description: Clean up a feature worktree after merge
disable-model-invocation: false
argument-hint: "<name>"
---

# Cleanup Worktree

Clean up a feature worktree after the PR has been merged. The argument is the worktree name **without** the `mesame-` prefix.

## Steps

### 1. Switch to Main

```bash
git checkout main
git pull
```

### 2. Update KANBAN

Move the completed task from **In Progress** to **Done** in `KANBAN.md`.

### 3. Generate Changelog

```bash
npm run changelog
```

### 4. Commit and Push Maintenance

```bash
git add KANBAN.md CHANGELOG.md
git commit -m "chore: update kanban and changelog after <name> merge"
git push
```

### 5. Remove Worktree and Branch

```bash
git worktree remove ../mesame-<name>
git branch -d feature/<name>
```

If the branch was not fully merged, warn the user before force-deleting.

## Important

- Must be run from the main worktree (main branch).
- The argument `<name>` is the feature name without the `mesame-` prefix.
- Worktree path: `../mesame-<name>` relative to main worktree.
- Branch name: typically `feature/<name>`.
