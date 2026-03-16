# Cline Workflow for Adding Ideas to Backlog

## Objective

This workflow allows interactive addition of feature ideas to the "Backlog" section of the `/KANBAN.md` file.

## Format rules

See `.clinerules/task_format.md` for detailed format rules.

Summary:
- `- [ ]` -> idea to do
- Idea format: `- [ ] **[DD/MM/YYYY HH:mm:ss] Priority CategoryEmoji [CATEGORY]** Description`
- Date format: `DD/MM/YYYY HH:mm:ss`
- Priority: `P1`, `P2`, `P3`
- Category icons: `[SECURITY]`, `[TEST]`, `[PERFORMANCE]`, `[ARCHITECTURE]`, `[UX]`, `[DEVOPS]`, `[I18N]`, `[DEPENDENCIES]`, `[CONFIG]`

## Execution instructions

### 1. Read KANBAN.md

Use the `read_file` tool to read the content of the `/KANBAN.md` file at the project root.

### 2. Ask user for idea description

Use the `ask_followup_question` tool to request the description of the idea to add.

**Question format:**
```
What idea would you like to add to the backlog?
```

Allow the user to provide a clear description of the feature idea.

### 3. Ask user for priority

Use the `ask_followup_question` tool to request the priority level.

**Question format:**
```
What is the priority of this idea?
- P1: High Priority (critical, security, blocking issues)
- P2: Medium Priority (important improvements)
- P3: Low Priority (nice to have, enhancements)
```

Allow the user to select a priority level (P1, P2, or P3).

### 4. Ask user for category

Use the `ask_followup_question` tool to request the category.

**Question format:**
```
What category does this idea belong to?
- [SECURITY]: Security improvements (validation, sanitization, etc.)
- [TEST]: Testing improvements (unit tests, integration tests, coverage)
- [PERFORMANCE]: Performance optimizations (caching, memoization, etc.)
- [ARCHITECTURE]: Code architecture improvements (refactoring, patterns)
- [UX]: User experience improvements (shortcuts, tooltips, feedback)
- [DEVOPS]: DevOps improvements (CI/CD, scripts, workflows)
- [I18N]: Internationalization improvements (translations, locales)
- [DEPENDENCIES]: Dependency updates (package updates, upgrades)
- [CONFIG]: Configuration improvements (build tools, setup)
```

Allow the user to select a category.

### 5. Generate current timestamp

Generate the current date and time in the format `DD/MM/YYYY HH:mm:ss`.

Example: `12/02/2026 10:30:15`

### 6. Create the idea entry

Create the idea entry with the following format:

```markdown
- [ ] **[DD/MM/YYYY HH:mm:ss] Priority CategoryEmoji [CATEGORY]** User-provided description
```

**Rules:**
- Use the current date and time in the specified format
- Use the priority provided by the user (P1, P2, or P3)
- Use the category icon and tag provided by the user
- Use the exact description provided by the user
- Do not modify or summarize the user's description

### 7. Add idea to Backlog

Use `replace_in_file` to add the idea to the appropriate priority subsection within "## Backlog".

#### 7a. Find the correct priority section

The KANBAN.md Backlog has three subsections:
- `### P1 - High Priority`
- `### P2 - Medium Priority`
- `### P3 - Low Priority`

Add the idea to the appropriate section based on the selected priority.

#### 7b. Add to the priority section

Add the new idea at the top of the list within the priority section, after the section header:

```markdown
### P1 - High Priority

- [ ] **[DD/MM/YYYY HH:mm:ss] P1 [CATEGORY]** New idea
- [ ] **[DD/MM/YYYY HH:mm:ss] P1 [CATEGORY]** Existing idea 1
```

### 8. Confirm addition

Inform the user that the idea has been successfully added to the backlog with:
- The generated timestamp
- The priority level
- The category
- The exact description added

## Important rules

- Always ask the user for the description, priority, and category using `ask_followup_question`
- Generate the timestamp automatically; do not ask the user for it
- Use the exact description provided by the user without modification
- Use the priority and category provided by the user
- New ideas should be added at the top of the appropriate priority section list

## Example flow

```
1. Read KANBAN.md -> found existing backlog with priority sections

2. Ask user: "What idea would you like to add to the backlog?"

3. User responds: "Add support for custom LLM personas"

4. Ask user: "What is the priority of this idea?"

5. User responds: "P2"

6. Ask user: "What category does this idea belong to?"

7. User responds: "UX"

8. Generate timestamp: 12/02/2026 10:30:15

9. Create entry: - [ ] **[12/02/2026 10:30:15] P2 [UX]** Add support for custom LLM personas

10. Update KANBAN.md -> add to "### P2 - Medium Priority" section

11. Confirm: "Idea added to backlog at P2 (Medium Priority) - [UX] category: 'Add support for custom LLM personas' at 12/02/2026 10:30:15"
```

## Example KANBAN.md before/after

**Before - P2 Medium Priority section:**
```markdown
### P2 - Medium Priority

- [ ] **[10/02/2026 15:00:00] P2 [DEVOPS]** Create CI/CD pipeline
```

**After - P2 Medium Priority section:**
```markdown
### P2 - Medium Priority

- [ ] **[12/02/2026 10:30:15] P2 [UX]** Add support for custom LLM personas
- [ ] **[10/02/2026 15:00:00] P2 [DEVOPS]** Create CI/CD pipeline
```

## Timestamp generation

The timestamp must use the current date and time when the workflow is executed:
- Day: 2 digits (01-31)
- Month: 2 digits (01-12)
- Year: 4 digits (e.g., 2026)
- Hours: 2 digits in 24h format (00-23)
- Minutes: 2 digits (00-59)
- Seconds: 2 digits (00-59)

Format: `DD/MM/YYYY HH:mm:ss`

## Usage

This workflow can be executed whenever the user wants to add a new idea to the backlog without manually editing the KANBAN.md file. It ensures proper formatting, automatic timestamp generation, and proper categorization by priority and category.
