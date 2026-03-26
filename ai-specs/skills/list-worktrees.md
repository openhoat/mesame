---
name: list-worktrees
description: List all git worktrees
disable-model-invocation: false
---

# List Worktrees

List all git worktrees for the project with formatted output.

## Command

```bash
git worktree list
```

## Output Format

Display the worktrees in a readable format:

| Path | Branch | Status |
|------|--------|--------|
| <project-root> | main | (main worktree) |
| ../<project-name>-<feature> | feature/<feature> | active |

For each worktree, show:
- **Path**: The filesystem path
- **Branch**: The checked-out branch
- **Status**: Whether it's the main worktree or a feature worktree

## Important

- The main worktree is at the project root (main branch).
- Feature worktrees follow the pattern `../<project-name>-<name>` relative to main.
