# Task Format Rules

## Objective

Defines common format rules for all task files in the project (KANBAN.md, CHANGELOG.md, etc.).

## General format rules

### Checkboxes

- **Task to do**: `- [ ] Task description`
- **Checked task**: `- [x] Task description`
- **Ignored task**: Use a checked checkbox to pause or exclude temporarily

### Priority Levels

For KANBAN Backlog ideas, each item may optionally include a priority level:
- **P1** = High Priority (critical, security, blocking issues)
- **P2** = Medium Priority (important improvements)
- **P3** = Low Priority (nice to have, enhancements)

Priority is placed in parentheses at the end of the description: `**[CATEGORY]** Description (P2)`

### Categories (for Backlog Ideas)

Each idea in the backlog must use one of these categories:
- **[SECURITY]**: Security improvements (validation, sanitization, etc.)
- **[TEST]**: Testing improvements (unit tests, integration tests, coverage)
- **[PERFORMANCE]**: Performance optimizations (caching, memoization, etc.)
- **[ARCHITECTURE]**: Code architecture improvements (refactoring, patterns)
- **[UX]**: User experience improvements (shortcuts, tooltips, feedback)
- **[DEVOPS]**: DevOps improvements (CI/CD, scripts, workflows)
- **[I18N]**: Internationalization improvements (translations, locales)
- **[DEPENDENCIES]**: Dependency updates (package updates, upgrades)
- **[CONFIG]**: Configuration improvements (build tools, setup)

### Categorization tags (for Tasks)

Each task must use one of these tags:
- **[FEAT]**: New feature or evolution
- **[FIX]**: Bug fix or problem correction
- **[REFACTOR]**: Refactoring
- **[PERF]**: Performance
- **[DOCS]**: Documentation
- **[STYLE]**: Style/Cosmetic
- **[TEST]**: Tests
- **[CHORE]**: Configuration/Maintenance

### Dates and times

- **Format**: `DD/MM/YYYY HH:mm:ss`
- **Example**: `03/02/2026 17:30:15`
- Used in CHANGELOG.md for modification entries

### Task descriptions

- Start with a verb in infinitive or imperative (ex: "Add", "Fix", "Implement")
- Be concise but informative
- Mention modified files if relevant

### Hierarchy and sub-tasks

Sub-tasks can be indented with 4 spaces:

```markdown
- [ ] **[FEAT]** Main task
    - [ ] Sub-task 1
    - [ ] Sub-task 2
```

Sub-tasks don't need tag: category information is carried by the parent task.

## File-specific rules

### KANBAN.md

Contains the Kanban board with two sections: Backlog, In Progress

#### Backlog section (## Backlog)

- Contains **feature ideas** to convert to tasks (`- [ ]`)
- Format: `- [ ] **[CATEGORY]** Idea description (Priority)`
- Ideas should be sorted by priority when specified (P1 first, then P2, then P3)

#### In Progress section (## In Progress)

- Contains **tasks currently being worked on**
- Task format: `- [ ] **[TAG]** Description`

**Note**: There is no "Done" section in KANBAN.md. Completed tasks are tracked in git history and CHANGELOG.md only.

### CHANGELOG.md

- **Auto-generated** using `npm run changelog` from Git commit history
- Contains only entries of completed modifications
- **DO NOT edit manually** - always regenerate with `npm run changelog`

## Usage

This rule is imported/used by:
- `.claude/rules/log_changes.md` (to write in CHANGELOG.md)
- `.claude/rules/quality_check.md` (to validate formats)

Any format rule modifications must be made **here only**.
