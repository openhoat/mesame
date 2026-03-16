---
name: list-worktrees
description: List all git worktrees
disable-model-invocation: false
---

# List Worktrees

List all git worktrees for the MeSame project with formatted output.

## Command

```bash
cd /home/openhoat/work/mesame && git worktree list
```

## Output Format

Display the worktrees in a readable format:

| Path | Branch | Status |
|------|--------|--------|
| /home/openhoat/work/mesame | main | (main worktree) |
| /home/openhoat/work/mesame-<feature> | feature/<feature> | active |

For each worktree, show:
- **Path**: The filesystem path
- **Branch**: The checked-out branch
- **Status**: Whether it's the main worktree or a feature worktree

## Important

- The main project is at `/home/openhoat/work/mesame`.
- Feature worktrees follow the pattern `/home/openhoat/work/mesame-<name>`.
