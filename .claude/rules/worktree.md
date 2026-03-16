# Native Worktree Workflow

## Objective

Defines the workflow for using git native worktrees to work on multiple branches simultaneously.

**This workflow is MANDATORY for all task-based work.** Direct commits to main branch are not permitted.

## When to Use Worktrees

**ALWAYS use worktrees for task-based work:**
- Starting a new feature/fix that will require a Pull Request
- Needing to switch between branches without losing local changes
- Working on isolated changes for separate review

## Directory Structure

```
/home/openhoat/work/
├── mesame/              # Main worktree (main branch)
├── mesame-<feature>/    # Feature worktrees (e.g., mesame-style-analyzer)
```

**Important**: Worktrees are created at `/home/openhoat/work/mesame-<feature>`, NOT in `.claude/worktrees/`.

## Naming Convention

- Format: `mesame-<branch-name>` (kebab-case)
- Branch prefix: `feat/` for features, `fix/` for bugfixes
- Examples:
  - Branch `feat/style-analyzer` -> Worktree `mesame-style-analyzer`
  - Branch `fix/proxy-streaming` -> Worktree `mesame-proxy-streaming`

## Mandatory Workflow

### Phase 1: Start & Implement (on `main`)
**Run `/start-task` from main worktree:**
1. Select idea from backlog.
2. Update `KANBAN.md` (move to "In Progress").
3. **Commit `KANBAN.md` on `main`** (`chore(kanban): start task - ...`).
4. Create branch and worktree with `git worktree add ../mesame-<name> <branch>`.
5. **Automatically implement the feature** based on task description.
6. **Validate code** with `npm run validate`.
7. **Commit code** (`feat: ...` / `fix: ...`).
8. **Push and create PR** automatically.
9. **DO NOT generate local CHANGELOG.md** in the feature branch.

### Phase 2: Completion & Cleanup (on `main`)
**Run `/cleanup-worktree <name>` from main worktree after PR merge:**
1. Switch back to `main`.
2. **Pull remote changes**: `git pull origin main`.
3. **Post-merge Maintenance**:
   - Update `KANBAN.md` (cleanup completed task).
   - **Generate global `CHANGELOG.md`** using `npm run changelog`.
   - **Commit and Push to `main`** (`chore(release): update kanban and changelog`).
4. Remove the worktree and branch.

## Management Commands

```bash
git worktree list                              # List all worktrees
git worktree add ../mesame-<name> <branch>     # Create worktree
git worktree remove ../mesame-<name>           # Remove worktree
git worktree prune                             # Clean stale references
```

## Local Files Synchronization

When creating a new worktree, local files listed in `.worktree-sync` are automatically copied from the main worktree.

## Key Principles

1. **One worktree per feature/PR**: Each worktree = one branch = one PR
2. **Main worktree stays clean**: Only view code, never commit
3. **Always create PR**: Never commit directly to main
4. **KANBAN.md on main only**: Never modify in feature worktree
5. **No direct commits to main**: All changes must go through PR workflow

## Prohibited Actions

- **Direct commits to main branch**: Always use PR workflow
- **Modifying KANBAN.md from feature worktree**: Update from main only
- **Using EnterWorktree tool**: NEVER use EnterWorktree - always use native `git worktree add` commands
- **Creating worktrees in .claude/worktrees/**: Worktrees must be created at `/home/openhoat/work/mesame-<name>`
