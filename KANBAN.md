# Kanban Board

<!-- Format definitions: See .claude/rules/task_format.md -->

## Backlog

<!-- Quick Wins - High Impact, Low Effort -->
- [ ] **[SECURITY]** Restrict CORS to localhost only (P1)
- [ ] **[SECURITY]** Add startup validation for API keys (P1)
- [ ] **[SECURITY]** Redact API keys and secrets in logs (P1)

<!-- Security & Validation -->
- [ ] **[SECURITY]** Add request validation with Zod schema (P1)
- [ ] **[SECURITY]** Implement rate limiting to prevent DoS attacks (P1)
- [ ] **[SECURITY]** Add security scanning (CodeQL, Snyk) to CI pipeline (P1)
- [ ] **[ARCHITECTURE]** Create OpenAPI/Swagger specification for proxy API (P1)

<!-- Deployment & Operations -->
- [ ] **[DEVOPS]** Create Dockerfile and Docker Compose setup (P1)
- [ ] **[DEVOPS]** Add Kubernetes manifests for cloud deployment (P1)
- [ ] **[DEVOPS]** Setup Husky pre-commit hooks for code quality (P2)
- [ ] **[DEVOPS]** Create systemd service file for Linux deployments (P2)
- [ ] **[DEVOPS]** Add backup/restore documentation for SQLite database (P2)

<!-- Development Experience -->
- [ ] **[CONFIG]** Implement server configuration persistence in SQLite database (P2)
- [ ] **[CONFIG]** Add VSCode launch.json for debugging setup (P2)
- [ ] **[DEVOPS]** Create dev container / Docker setup for contributors (P2)
- [ ] **[CONFIG]** Add environment-specific configs (dev/prod/staging) (P3)

<!-- Testing & Quality -->
- [ ] **[TEST]** Increase error handling test coverage (fileParser, llmProvider) (P2)
- [ ] **[TEST]** Add tests for edge cases (large files, malformed PDFs, timeouts) (P2)
- [ ] **[TEST]** Add load testing suite (Artillery or k6) (P3)
- [ ] **[TEST]** Add security tests (SQL injection, XSS, data leakage) (P2)
- [ ] **[TEST]** Add test coverage thresholds in vitest.config.ts (P2)

<!-- User Experience -->
- [ ] **[UX]** Global dark/light mode management (system theme, manual toggle, and persistence) (P2)
- [ ] **[UX]** Add interactive CLI setup wizard (P2)
- [ ] **[UX]** Implement dark mode support in admin dashboard (P2)
- [ ] **[UX]** Add export functionality for chat history and style profile (P2)
- [ ] **[UX]** Improve error messages with actionable suggestions (P2)
- [ ] **[UX]** Add drag-and-drop file upload support (P2)
- [ ] **[UX]** Implement keyboard shortcuts in chat interface (P2)
- [ ] **[UX]** Add conversation history to chat interface (P2)
- [ ] **[UX]** Add interactive questionnaire for building user's digital twin profile (P2)
- [ ] **[UX]** Add voice discussion as alternative questionnaire experience (P2)

<!-- Accessibility & i18n -->
- [ ] **[UX]** Add ARIA labels to chat and dashboard components (P2)
- [ ] **[UX]** Audit color contrast against WCAG AA/AAA standards (P2)
- [ ] **[UX]** Document keyboard navigation for accessibility (P2)

<!-- Documentation -->
- [ ] **[ARCHITECTURE]** Add API reference documentation with examples (P2)
- [ ] **[DEVOPS]** Create migration guides for version upgrades (P2)
- [ ] **[DEVOPS]** Add performance tuning guide for large documents (P2)
- [ ] **[DEVOPS]** Document HTTPS setup with reverse proxy (nginx) (P2)
- [ ] **[DEVOPS]** Add monitoring and logging best practices guide (P2)

<!-- Post-MVP enhancements -->
- [ ] **[SECURITY]** Add regex-based data anonymization for sensitive content (P3)
- [ ] **[DEVOPS]** Implement real-time logging system with WebSocket (P3)
- [ ] **[UX]** Add multi-profile style management support (P3)
- [ ] **[CONFIG]** Add support for config file (mesame.config.json) (P3)
- [ ] **[DEVOPS]** Add artifact signing for release binaries (P3)
- [ ] **[DEVOPS]** Publish Docker images to Docker Hub in release workflow (P3)

## In Progress

(No tasks in progress)
