# Native Git Worktree Workflow

## Objective

This workflow defines how to use native git worktrees to work on multiple branches simultaneously with Claude Code.

**This workflow is MANDATORY for all task-based work.** Direct commits to main branch are not permitted.

## When to Use Worktrees

Use worktrees when:
- The user requests a new feature or fix that requires a Pull Request
- You need to switch between multiple branches without losing local changes
- You are working on isolated changes that should be reviewed separately
- **ALL task-based work must use worktrees** (no exceptions)

## Worktree Directory Structure

Worktrees follow a predictable pattern based on the project name:

```
<parent-directory>/
├── <project-name>/              # Main worktree (main branch)
├── <project-name>-<feature>/    # Feature worktrees
```

**Automatic detection**:
- Project name: Derived from the directory name (`basename $(pwd)`)
- Parent directory: One level above the project root
- Example: If project is `/home/user/myapp`, worktrees go to `/home/user/myapp-<feature>`

**Important**: Worktrees are created at `../<project-name>-<name>` relative to the main worktree.

## Worktree Naming Convention

- Format: `<project-name>-<branch-name>` (kebab-case)
- Branch prefix: `feat/` for features, `fix/` for bugfixes
- Examples:
  - `feat/dependabot-config` -> `<project-name>-dependabot`
  - `feat/add-dark-mode` -> `<project-name>-add-dark-mode`
  - `fix/login-bug` -> `<project-name>-login-bug`

**Note**: Replace `<project-name>` with your actual project name (derived from the directory name).

## MANDATORY Workflow Steps

### 1. Unified Task Lifecycle (One-Shot Session)

The entire task lifecycle is handled in a single continuous session whenever possible.

#### Phase 1: Start (on `main`)
**Run `/start-task` from main worktree:**
1. Select idea from backlog.
2. Update `KANBAN.md` (move to "In Progress").
3. **Commit `KANBAN.md` on `main`** (`chore(kanban): start task - ...`).
4. Create branch and worktree with `git worktree add ../<project-name>-<name> <branch>`.
5. **Manual switch**: User navigates to worktree with `cd ../<project-name>-<name>`.

#### Phase 2: Implementation (in worktree)
1. Implement the requested feature or fix.
2. **Commit code** (`feat: ...` / `fix: ...`).
3. **Push and PR**: Use `/complete-task` to validate, commit, push, and create a Pull Request.
4. **DO NOT generate local CHANGELOG.md** in the feature branch.

#### Phase 3: Completion & Cleanup (on `main`)
**Run `/cleanup-worktree <name>` from main worktree after PR merge:**
1. Switch back to `main`.
2. **Pull remote changes**: `git pull origin main`.
3. **Post-merge Maintenance**:
   - Update `KANBAN.md` (move to "Done", then cleanup).
   - **Generate global `CHANGELOG.md`** using `npm run changelog`.
   - **Commit and Push to `main`** (`chore(release): update kanban and changelog`).
4. Remove the worktree and branch.

## Worktree Management Commands

```bash
# List all worktrees
git worktree list

# Create a new worktree
git worktree add ../<project-name>-<name> <branch-name>

# Remove a worktree (preserves branch)
git worktree remove ../<project-name>-<name>

# Prune stale worktree references
git worktree prune
```

## Local Files Synchronization

When creating a new worktree, local files listed in `.worktree-sync` are automatically copied from the main worktree. This ensures consistent development environment across all worktrees.

### Files synchronized

The `.worktree-sync` file lists files to copy:
```
# Environment configuration
.envrc
.env.local
.env.development.local

# Claude Code local settings
.claude/settings.local.json
```

### How it works

1. When `/start-task` creates a worktree, it reads `.worktree-sync`
2. For each file listed, it copies from main worktree to the new worktree
3. Directory structure is created automatically if needed
4. Files are only copied if they exist in the main worktree

### Adding new files to sync

Edit `.worktree-sync` and add one file per line. Comments start with `#`.

## Integration with Other Rules

- Follow **Language Rule**: All commits and PRs in English
- Follow **Commit Messages Rule**: Conventional Commits format
- Follow **Quality Check Rule**: Run validation before committing
- Follow **Log Changes Rule**: Update CHANGELOG.md after changes

## Key Principles

1. **One worktree per feature/PR**: Each worktree corresponds to one branch and one PR
2. **Main worktree stays clean**: Only use main worktree for looking at code, not for making changes
3. **Always create a PR**: Never commit directly to main
4. **Clean up after merge**: Remove worktrees after PRs are merged
5. **KANBAN.md on main only**: Never modify KANBAN.md in a feature worktree
6. **Manual worktree switch**: After `/start-task`, manually switch with `cd`

## Kanban Integration

The KANBAN.md file must always be modified on the `main` branch before creating a worktree. This ensures that task tracking is consistent across all worktrees.

### Mandatory Workflow Sequence

```
┌──────────────────────────────────────────────────────────┐
│  PHASE 1: START (on main)                                │
│  - /start-task: Select idea, Update & Commit Kanban      │
│  - Create worktree & branch                              │
│  - MANUAL switch: User runs cd ../<project>-<name>       │
└──────────────┬───────────────────────────────────────────┘
               │
               v
┌──────────────────────────────────────────────────────────┐
│  PHASE 2: WORK (in worktree)                             │
│  - Implement changes                                     │
│  - /complete-task: Validate, Commit Code, Push, PR       │
│  - (NO local CHANGELOG)                                  │
└──────────────┬───────────────────────────────────────────┘
               │
               │ PR merged by user
               v
┌──────────────────────────────────────────────────────────┐
│  PHASE 3: FINISH & CLEANUP (on main)                     │
│  - git pull origin main                                  │
│  - /cleanup-worktree: Update Kanban, Gen CHANGELOG       │
│  - Commit & Push Maintenance to main                     │
│  - Remove worktree & branch                              │
└──────────────────────────────────────────────────────────┘
```

### Skills Integration

| Skill | Location | Purpose |
|-------|----------|---------|
| `/start-task` | **Main worktree only** | Start Kanban task: Update/Commit Kanban, Create worktree (user must manually cd to worktree) |
| `/complete-task` | **Feature worktree only** | Complete implementation: Validate, Commit Code, Push, PR (No Changelog) |
| `/push-and-pr` | **Feature worktree only** | Push branch and create PR only |
| `/cleanup-worktree` | **Main worktree only** | Post-merge: Pull, **Update Kanban & Changelog**, Commit/Push Main, Cleanup |

### Workflow Commands

#### Start a new task (from main worktree)

```bash
# Use the skill (RECOMMENDED)
/start-task
# Stays on main - manually switch to worktree
cd ../<project-name>-<name>
```

#### Complete work (from feature worktree)

```bash
# Use the skill (REQUIRED)
/complete-task
```

#### After PR merge (from main worktree)

```bash
# Use the skill
/cleanup-worktree <name>
```

### Important Rules

1. **KANBAN.md on main only**: Never modify KANBAN.md in a feature worktree
2. **Commit before worktree**: Always commit KANBAN.md changes before creating worktree
3. **One idea per worktree**: Each worktree corresponds to exactly one Kanban task
4. **Clean separation**: Task tracking happens on main, implementation in worktree
5. **No direct commits to main**: All changes must go through PR workflow
6. **Manual switch required**: After `/start-task`, manually switch with `cd`

## Example Workflow

User asks: "Add LLM style proxy pipeline" (assuming project name is "myapp")

1. From main worktree:
   ```bash
   /start-task
   # Select the idea from backlog
   # Creates worktree, returns to main
   cd ../myapp-style-proxy  # Manual switch
   ```

2. Work in the worktree:
   ```bash
   # Already in myapp-style-proxy worktree
   # Make changes...
   ```

3. Complete from feature worktree:
   ```bash
   /complete-task
   ```

4. After merge, from main worktree:
   ```bash
   cd ../myapp
   git pull origin main
   /cleanup-worktree style-proxy
   ```

## Creating Worktrees Manually

If you need to create a worktree manually (without `/start-task`):

```bash
# 1. Create the branch
git checkout -b feat/<feature-name>

# 2. Create the worktree
git worktree add ../<project-name>-<feature-name> feat/<feature-name>

# 3. Return to main
git checkout main

# 4. Switch to worktree
cd ../<project-name>-<feature-name>
```

## Removing Worktrees Manually

```bash
# 1. Switch to main worktree
cd <project-root>

# 2. Remove the worktree
git worktree remove ../<project-name>-<name>

# 3. Delete the branch (optional, if merged)
git branch -d <branch-name>

# 4. Clean up stale references
git worktree prune
```

## Prohibited Actions

- **Direct commits to main branch**: Always use PR workflow
- **Modifying KANBAN.md from feature worktree**: Update from main only
- **Using EnterWorktree tool**: Creates worktrees in wrong location, use `git worktree add` instead
