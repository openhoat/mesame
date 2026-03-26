# Security Audit

Invoke the **security-auditor** agent to perform a security analysis of the project.

## Usage

Delegate to the security-auditor agent defined in `.claude/agents/security-auditor.md`.

The security-auditor agent will:

1. **Dependency audit**: Run `npm audit` and analyze vulnerabilities.
2. **Code scanning**: Look for common security issues:
   - Hardcoded secrets or credentials
   - SQL injection risks (Prisma queries)
   - XSS vulnerabilities (React frontend)
   - Insecure API endpoints (Fastify routes)
   - Improper input validation
3. **Configuration review**: Check for insecure configurations in:
   - Environment variables handling
   - CORS settings
   - Authentication/authorization logic
4. **Report**: Provide a prioritized list of findings with remediation steps.

## Invocation

Use the TaskCreate tool to spawn the security-auditor agent, or follow its instructions directly.