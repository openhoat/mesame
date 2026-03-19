---
name: start-task
description: Start a task from backlog with full lifecycle management
disable-model-invocation: false
---

# Start Task

Full task lifecycle: select a task from the backlog, set up a feature worktree, implement, validate, and prepare for PR.

## Steps

### 1. Select Task from Backlog

- Read `./KANBAN.md`.
- Display the Backlog section and let the user select a task (or accept a task name as argument).
- Move the selected task from **Backlog** to **In Progress** in KANBAN.md (local change only, not committed).

### 2. Create Feature Branch and Worktree

```bash
git checkout main
git pull
BRANCH_NAME="feature/<task-slug>"
git branch "$BRANCH_NAME"
git worktree add ../mesame-<task-slug> "$BRANCH_NAME"
```

### 3. Implement

- Switch to the worktree: `../mesame-<task-slug>`
- Implement the task changes.

### 4. Validate

```bash
cd ../mesame-<task-slug> && npm run validate
```

Fix any issues found during validation.

### 5. Commit and Push

```bash
cd ../mesame-<task-slug>
git add <relevant-files>
git commit -m "feat: description of the task"
git push -u origin "$BRANCH_NAME"
```

### 6. Create Pull Request

```bash
cd ../mesame-<task-slug>
gh pr create --title "feat: task title" --body "Description of changes"
```

## Important

- Always use `../mesame` as the main project path.
- Feature worktrees go to `../mesame-<task-slug>`.
- KANBAN.md is updated locally but NOT committed at task start - it will be committed during cleanup after PR merge.
- Run `npm install` in the new worktree if needed.
