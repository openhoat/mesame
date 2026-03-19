# Workflows Documentation

This directory contains detailed workflow specifications that complement the concise skill definitions in `.claude/skills/`.

## Relationship between .clinerules/workflows/ and .claude/skills/

### Purpose

- **`.clinerules/workflows/*.md`**: Detailed implementation specifications with step-by-step instructions, prerequisites, and troubleshooting
- **`.claude/skills/*/SKILL.md`**: Concise user-facing skill definitions with essential steps and examples

### Synchronization

These files must remain **functionally equivalent** but serve different purposes:

| Workflow | Skill | Status |
|----------|-------|--------|
| `start_task.md` | `start-task/SKILL.md` | ✅ Synchronized |
| `cleanup_worktree.md` | `cleanup-worktree/SKILL.md` | ✅ Synchronized |
| `complete_task.md` | `complete-task/SKILL.md` | ✅ Synchronized |

## Synchronization Guidelines

When updating workflows or skills:

1. **Core functionality must match**: Both versions must perform the same actions
2. **Detail level differs**: Workflow files provide implementation details; skill files provide concise instructions
3. **Update both when logic changes**: If the workflow logic changes, update both files accordingly

### Example

For `/start-task`:
- **Workflow** (`.clinerules/workflows/start_task.md`): 8 detailed steps with code examples, error handling, and edge cases
- **Skill** (`.claude/skills/start-task/SKILL.md`): 6 concise steps focused on user actions

Both implement the same process: select task, update KANBAN locally, create worktree, implement, validate, and create PR.

## Verification Checklist

When modifying workflows or skills, verify:

- [ ] Core steps are present in both files
- [ ] Important rules are documented in both places
- [ ] Prerequisites match
- [ ] Git commands are identical
- [ ] KANBAN update logic is consistent
- [ ] Validation requirements match

## Known Differences

### start_task

- **Workflow**: Includes detailed Git worktree setup with branch creation commands
- **Skill**: Simplified worktree creation with essential commands only

### cleanup_worktree

- **Workflow**: 11 detailed steps including name resolution logic and verification
- **Skill**: 5 essential steps focusing on pull, update, commit, and cleanup

### complete_task

- **Workflow**: Detailed branch-to-commit-type mapping and PR template
- **Skill**: Concise validation, commit, push, and PR creation

## Maintenance

This README should be updated whenever:
- New workflows or skills are added
- Synchronization status changes
- Major workflow logic is refactored
