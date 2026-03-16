# Code Review

Invoke the **code-reviewer** agent to perform a thorough code review.

## Usage

Delegate to the code-reviewer agent defined in `/home/openhoat/work/mesame/.claude/agents/code-reviewer.md`.

The code-reviewer agent will:

1. **Review changed files**: Examine all staged or recently committed changes.
2. **Check code quality**: Look for code smells, anti-patterns, and potential bugs.
3. **Verify TypeScript best practices**: Proper typing, no `any` abuse, correct error handling.
4. **Check architecture**: Ensure changes align with the project structure (Fastify backend, React frontend, Prisma, LangChain.js, Natural, Compromise.js).
5. **Security review**: Flag any security concerns (exposed secrets, injection risks, etc.).
6. **Provide feedback**: Summarize findings with actionable suggestions.

## Invocation

Use the TaskCreate tool to spawn the code-reviewer agent, or follow its instructions directly.
