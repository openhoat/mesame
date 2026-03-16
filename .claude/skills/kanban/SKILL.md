---
name: kanban
description: Manage the KANBAN.md board
disable-model-invocation: false
---

# Kanban Board Management

Manage the MeSame project's KANBAN.md file located at `/home/openhoat/work/mesame/KANBAN.md`.

## Actions

### Read

Parse and display the KANBAN.md file sections:
- **Backlog** - Tasks waiting to be started
- **In Progress** - Tasks currently being worked on
- **Done** - Completed tasks

```bash
cat /home/openhoat/work/mesame/KANBAN.md
```

Display a summary of task counts per section and list tasks with their priorities/categories.

### Update

Modify task statuses by moving items between sections. When updating:
1. Read the current KANBAN.md content.
2. Move the specified task from one section to another.
3. Write the updated content back to the file.

Typical transitions:
- Backlog -> In Progress (when starting a task)
- In Progress -> Done (when completing a task)

## Important

- **Branch check**: Warn the user if NOT on the `main` branch. KANBAN.md should typically be modified on `main`.
- The project root is `/home/openhoat/work/mesame`.
- Worktrees are at `/home/openhoat/work/mesame-<feature>`.
