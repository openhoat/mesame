---
name: start-task
description: Start a task from backlog with full lifecycle management
disable-model-invocation: false
---

# Start Task

Full task lifecycle: select a task from the backlog, set up a feature worktree, implement, validate, and prepare for PR.

## Steps

### 1. Select Task from Backlog

- Read `/home/openhoat/work/mesame/KANBAN.md`.
- Display the Backlog section and let the user select a task (or accept a task name as argument).
- Move the selected task from **Backlog** to **In Progress** in KANBAN.md.
- Commit and push the KANBAN update on `main`.

### 2. Create Feature Branch and Worktree

```bash
cd /home/openhoat/work/mesame
git checkout main
git pull
BRANCH_NAME="feature/<task-slug>"
git branch "$BRANCH_NAME"
git worktree add /home/openhoat/work/mesame-<task-slug> "$BRANCH_NAME"
```

### 3. Implement

- Switch to the worktree: `/home/openhoat/work/mesame-<task-slug>`
- Implement the task changes.

### 4. Validate

```bash
cd /home/openhoat/work/mesame-<task-slug> && npm run validate
```

Fix any issues found during validation.

### 5. Commit and Push

```bash
cd /home/openhoat/work/mesame-<task-slug>
git add <relevant-files>
git commit -m "feat: description of the task"
git push -u origin "$BRANCH_NAME"
```

### 6. Create Pull Request

```bash
cd /home/openhoat/work/mesame-<task-slug>
gh pr create --title "feat: task title" --body "Description of changes"
```

## Important

- Always use `/home/openhoat/work/mesame` as the main project path.
- Feature worktrees go to `/home/openhoat/work/mesame-<task-slug>`.
- KANBAN updates happen on `main` before branching.
- Run `npm install` in the new worktree if needed.
