# Kanban Board

<!-- Format definitions: See .claude/rules/task_format.md -->

## Backlog

<!-- Phase 3: API Sources & Import -->
<!-- Phase 4: NLP Style Analyzer -->
<!-- Phase 5: Persona Prompt Generation -->
- [ ] **[ARCHITECTURE]** Create automatic persona prompt generation from style analysis (P1)
<!-- Phase 6: Chat Interface -->
- [ ] **[UX]** Build chat interface in Electron app with streaming display (P1)
- [ ] **[UX]** Add conversation history to chat interface (P2)
<!-- Phase 7: LangChain Multi-Provider -->
- [ ] **[ARCHITECTURE]** Replace raw fetch proxy with LangChain.js multi-provider integration (P2)
<!-- Phase 8: Admin Dashboard -->
- [ ] **[UX]** Build Admin Dashboard with React + Vite + Tailwind + Shadcn (P2)
<!-- Enhancements -->
- [ ] **[SECURITY]** Add regex-based data anonymization for sensitive content (P2)
- [ ] **[DEVOPS]** Implement real-time logging system with WebSocket (P3)
- [ ] **[UX]** Add multi-profile style management support (P3)
- [ ] **[CONFIG]** Create CLI for configuration management (P3)

## In Progress

- [ ] **[TEST]** Implement E2E testing harness with Playwright for Electron app
    - [ ] Set up Playwright with Electron support (playwright.config.ts, dependencies)
    - [ ] Create test infrastructure (electron-app.ts, fixtures.ts, mocks.ts, helpers/)
    - [ ] Add smoke tests for app startup and basic UI rendering
    - [ ] Add proxy endpoint tests (chat completions, streaming, error handling)
    - [ ] Add admin dashboard tests (source import, style profile visualization)
    - [ ] Configure CI workflow for headless E2E tests (xvfb-run)
    - [ ] Add npm scripts (test:e2e, test:e2e:ui, test:e2e:debug, test:e2e:headless)
- [ ] **[TEST]** Implement E2E testing harness with Playwright for Electron app
    - [ ] Set up Playwright with Electron support (playwright.config.ts, dependencies)
    - [ ] Create test infrastructure (electron-app.ts, fixtures.ts, mocks.ts, helpers/)
    - [ ] Add smoke tests for app startup and basic UI rendering
    - [ ] Add proxy endpoint tests (chat completions, streaming, error handling)
    - [ ] Add admin dashboard tests (source import, style profile visualization)
    - [ ] Configure CI workflow for headless E2E tests (xvfb-run)
    - [ ] Add npm scripts (test:e2e, test:e2e:ui, test:e2e:debug, test:e2e:headless)
