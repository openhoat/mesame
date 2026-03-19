# Git Worktree Workflow - Quick Reference

## Workflow Complet

### Phase 1: Start (main worktree)

```bash
/start-task [number]
# -> Updates KANBAN.md locally (move idea to In Progress, not committed)
# -> Creates branch and worktree at ../mesame-<name>
# -> Copies local files from .worktree-sync to new worktree
# -> User manually navigates: cd ../mesame-<name>
```

### Phase 2: Implementation (feature worktree)

```bash
# Work on the feature
# ...

/complete-task [--draft]
# -> Validates code (npm run validate)
# -> Commits changes
# -> Pushes branch to origin
# -> Creates Pull Request
```

### Phase 3: Cleanup (main worktree, after PR merge)

```bash
/cleanup-worktree <name>
# -> Pulls latest changes from origin
# -> Updates KANBAN.md (move task from In Progress, cleanup)
# -> Generates CHANGELOG.md (npm run changelog)
# -> Commits and pushes maintenance to main
# -> Removes worktree and branch
```

## Commands

| Command | Location | Purpose |
|---------|----------|---------|
| `/start-task [number]` | Main worktree | Start task from backlog and create worktree |
| `/complete-task [--draft]` | Feature worktree | Validate, commit, push, and create PR |
| `/push-and-pr` | Feature worktree | Push and create PR only (if already committed) |
| `/cleanup-worktree <name>` | Main worktree | Post-merge cleanup |
| `/list-worktrees` | Any | List all worktrees |

## Emplacements

- **Main worktree**: Project root (where main branch is checked out)
- **Feature worktrees**: `../mesame-<feature-name>` relative to main worktree
- **KANBAN.md**: Edit only on main branch
- **CHANGELOG.md**: Auto-generated (read-only, never edit manually)

## Format KANBAN.md

### Backlog

```markdown
- [ ] **[CATEGORY]** Description (Priority)
```

### In Progress

```markdown
- [ ] **[TAG]** Description
```

## Key Rules

1. **1 worktree = 1 branch = 1 PR**: One feature per worktree
2. **Never commit directly to main**: Always use PR workflow
3. **KANBAN updated locally at start**: Update KANBAN.md locally during `/start-task`, commit during cleanup after PR merge
4. **CHANGELOG auto-generated**: Use `npm run changelog`, never edit manually
5. **Manual navigation**: After `/start-task`, navigate to worktree with `cd ../mesame-<name>` before implementing
