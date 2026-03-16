# Git Worktree Workflow - Quick Reference

## Workflow Complet

### Phase 1: Start & Implement (main worktree)

```bash
/start-task [number]
# -> Updates KANBAN.md (move idea to In Progress)
# -> Commits KANBAN.md on main
# -> Creates branch and worktree at /home/openhoat/work/mesame-<name>
# -> Copies local files from .worktree-sync to new worktree
# -> Implements the complete feature automatically
# -> Validates code (npm run validate)
# -> Commits changes
# -> Pushes branch to origin
# -> Creates Pull Request
```

### Phase 2: Cleanup (main worktree, after PR merge)

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
| `/start-task [number]` | Main worktree | **Complete automation**: Start task, implement, validate, commit, push, create PR |
| `/complete-task [--draft]` | Feature worktree | *(Optional)* Validate, commit, push, PR if implementing manually |
| `/push-and-pr` | Feature worktree | *(Optional)* Push and create PR only |
| `/cleanup-worktree <name>` | Main worktree | Post-merge cleanup |
| `/list-worktrees` | Any | List all worktrees |

## Emplacements

- **Main worktree**: `/home/openhoat/work/mesame`
- **Feature worktrees**: `/home/openhoat/work/mesame-<feature-name>`
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
3. **KANBAN updated on main only**: Never modify KANBAN.md in feature worktree
4. **CHANGELOG auto-generated**: Use `npm run changelog`, never edit manually
5. **Full automation**: `/start-task` implements the complete feature from backlog to PR
