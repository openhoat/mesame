# AI Specifications

Single source of truth for AI assistant rules, workflows, and skills.

This directory contains all specifications that are synchronized to:
- `.clinerules/` - For Cline AI assistant
- `.claude/` - For Claude Code AI assistant

## Structure

```
ai-specs/
├── rules/           # Behavioral rules and standards
├── workflows/       # Step-by-step processes
├── skills/          # Reusable skills with metadata
└── agents/          # Agent definitions
```

### Rules (`rules/`)

Behavioral rules that define standards and expectations:
- `commit_messages.md` - Conventional Commits format
- `language.md` - English content + French responses
- `quality_check.md` - Code quality validation
- `testing.md` - Testing standards
- `task_format.md` - KANBAN/CHANGELOG formats
- `worktree.md` - Git worktree workflow
- `error_recovery.md` - Error recovery procedures
- `code_intelligence.md` - LSP tool preferences
- `markdown_formatting.md` - Markdown standards
- `package_json.md` - Package.json formatting
- `log_changes.md` - CHANGELOG generation
- `subagents.md` - Subagent usage guidelines

### Workflows (`workflows/`)

Step-by-step processes for complex tasks:
- `start_task.md` - Start a new task from backlog
- `complete_task.md` - Complete and submit a task
- `cleanup_worktree.md` - Clean up after PR merge
- `commit_changes.md` - Commit workflow
- `kanban.md` - Kanban management
- `kanban_add_idea.md` - Add idea to backlog
- `kanban_clean.md` - Clean up kanban
- `release.md` - Release process

### Skills (`skills/`)

Reusable skills with metadata for Claude Code:
- `start-task.md` - Start task skill
- `complete-task.md` - Complete task skill
- `cleanup-worktree.md` - Cleanup worktree skill
- `push-and-pr.md` - Push and create PR skill
- ... and more

### Agents (`agents/`)

Agent definitions for specialized tasks:
- `code-reviewer.md` - Code review agent
- `dependency-manager.md` - Dependency management agent
- `documentation-generator.md` - Documentation generation agent
- `quality-validator.md` - Quality validation agent
- `security-auditor.md` - Security audit agent
- `test-runner.md` - Test execution agent

## Synchronization

Run `npm run sync:ai:specs` to synchronize specifications to:
- `.clinerules/` ← `ai-specs/rules/` + `ai-specs/workflows/`
- `.claude/rules/` ← `ai-specs/rules/`
- `.claude/skills/` ← `ai-specs/skills/`
- `.claude/agents/` ← `ai-specs/agents/`

To check synchronization status without making changes:
```bash
npm run sync:ai:specs:check
```

## Maintenance

1. **Edit source files** in `ai-specs/` only
2. **Run sync** to update generated files
3. **Commit all changes** including generated files
4. **Never edit directly** `.clinerules/` or `.claude/`

## Adding New Specifications

### Adding a Rule

1. Create `ai-specs/rules/my-rule.md`
2. Run `npm run sync:ai:specs`
3. Commit both source and generated files

### Adding a Workflow

1. Create `ai-specs/workflows/my-workflow.md`
2. Run `npm run sync:ai:specs`
3. Commit both source and generated files

### Adding a Skill

1. Create `ai-specs/skills/my-skill.md` with YAML frontmatter
2. Run `npm run sync:ai:specs`
3. Commit both source and generated files

### Adding an Agent

1. Create `ai-specs/agents/my-agent.md`
2. Run `npm run sync:ai:specs`
3. Commit both source and generated files
