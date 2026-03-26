# Dependency Management

Invoke the **dependency-manager** agent to analyze and manage project dependencies.

## Usage

Delegate to the dependency-manager agent defined in `.claude/agents/dependency-manager.md`.

The dependency-manager agent will:

1. **Audit dependencies**: Check for outdated packages, security vulnerabilities, and unused dependencies.
2. **Suggest updates**: Recommend safe dependency updates with changelog links.
3. **Check compatibility**: Verify that updates are compatible with the project's Node.js version and other dependencies.
4. **Analyze bundle impact**: Estimate the impact of dependency changes.
5. **License check**: Verify dependency licenses are compatible with the project.

## Commands

Common dependency commands for MeSame:
- `npm outdated` - Check for outdated packages
- `npm audit` - Security audit
- `npm ls` - Dependency tree

## Invocation

Use the TaskCreate tool to spawn the dependency-manager agent, or follow its instructions directly.