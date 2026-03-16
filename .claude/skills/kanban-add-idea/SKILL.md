---
name: kanban-add-idea
description: Add a new idea to the KANBAN backlog
disable-model-invocation: false
argument-hint: "[description]"
---

# Add Idea to Kanban Backlog

Add a new idea or task to the Backlog section of KANBAN.md.

## Steps

1. Read the current KANBAN.md at `/home/openhoat/work/mesame/KANBAN.md`.
2. Parse the Backlog section.
3. Add the new item with the specified description, priority, and category.
4. Write the updated KANBAN.md.

## Item Format

Each backlog item should follow this format:
```
- [ ] **[PRIORITY]** [CATEGORY] - Description
```

Where:
- **PRIORITY**: HIGH, MEDIUM, or LOW (default: MEDIUM)
- **CATEGORY**: e.g., feature, bugfix, refactor, docs, infra, etc.

## Usage

The user provides a description of the idea. Optionally they may specify priority and category. If not specified, default to MEDIUM priority and infer the category from the description.

## Important

- The project root is `/home/openhoat/work/mesame`.
- Warn if not on the `main` branch.
