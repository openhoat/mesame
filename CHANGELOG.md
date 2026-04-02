# Changelog

## 02/04/2026

- **[15:51:04] ✨ [FEAT]** add real-time logging system with WebSocket
- **[15:01:22] 📝 [DOCS]** simplify README by removing redundant content
- **[14:54:24] 🔧 [CHORE]** re-tag UX items as [FEAT] in kanban
- **[14:52:15] 📝 [DOCS]** add roadmap section with planned features
- **[14:50:52] 🔧 [CHORE]** add LLM optimization research to backlog
- **[14:46:27] 🐛 [FIX]** use combined server for E2E tests with port 3001
- **[14:43:56] 📝 [DOCS]** improve Mermaid diagrams and remove WIP warning
- **[14:35:11] 🐛 [FIX]** update E2E test configuration for new port layout
- **[14:29:39] ✨ [FEAT]** swap ports and add Mermaid diagrams
- **[14:19:02] 📝 [DOCS]** convert architecture diagrams to Mermaid
- **[14:13:48] 📝 [DOCS]** update architecture documentation for CDN-ready frontend
- **[14:07:15] 🐛 [FIX]** reset conversation when deleted from history view
- **[13:55:34] ✨ [FEAT]** add configurable CORS for CDN deployment
- **[13:51:51] 🔧 [CHORE]** add mobile responsive design task to backlog
- **[13:51:16] ✨ [FEAT]** make frontend CDN-ready with configurable API URL
- **[13:41:38] 🐛 [FIX]** set default theme to follow system preference
- **[13:40:22] ✨ [FEAT]** persist user language preference in database
- **[09:45:33] ✨ [FEAT]** add Docker Compose configuration for LLM and Web services

## 01/04/2026

- **[18:33:26] ✨ [FEAT]** add interactive questionnaire for digital twin profile creation
- **[18:27:07] ✨ [FEAT]** add drag-and-drop file upload support
- **[18:12:57] ✨ [FEAT]** auto-generate provider instance names in add provider form
- **[18:07:10] 🔧 [CHORE]** update kanban and changelog after export-functionality merge
- **[17:54:36] ✨ [FEAT]** add export functionality for chat history and style profiles
- **[18:02:08] 🔧 [CHORE]** cleanup prisma organization and fix vitest deprecation
- **[17:42:45] 🐛 [FIX]** add mock case to model discovery
- **[17:35:24] 🐛 [FIX]** add database seed step before E2E tests
- **[17:31:31] 🐛 [FIX]** add default mock provider for E2E tests
- **[17:28:18] 🔧 [CHORE]** update kanban and changelog after rationalize-db-ui-terms
- **[17:25:49] 🐛 [FIX]** update Anthropic models to current versions
- **[17:22:46] ✨ [FEAT]** add multi-provider support and model selection
- **[12:19:38] 🔧 [CHORE]** update kanban and changelog after fix-dashboard-logs merge
- **[12:14:08] 🐛 [FIX]** use correct web server port (3001) for config API
- **[11:39:22] 🐛 [FIX]** use provider field from server config instead of URL detection
- **[11:25:28] ✨ [FEAT]** implement real-time stats and logs access
- **[09:59:38] 🐛 [FIX]** restore npm start script for E2E tests
- **[09:56:02] 🐛 [FIX]** fix sources routes and variabilize server ports

## 31/03/2026

- **[10:27:53] 🐛 [FIX]** use robust path resolution for package.json
- **[09:53:08] 🐛 [FIX]** read package.json from correct path after build
- **[09:51:35] 🔧 [CHORE]** update kanban and changelog after split-proxy-web-servers merge
- **[09:46:57] 📝 [DOCS]** update README with LLM/Web server architecture
- **[09:43:49] ♻️ [REFACTOR]** rename env vars from MESAME_HOST/PORT to MESAME_LLM_HOST/PORT
- **[09:39:29] ♻️ [REFACTOR]** rename proxy to llm for clarity
- **[09:34:24] 🔧 [CHORE]** remove PROXY_WEB_ARCHITECTURE.md documentation file
- **[09:33:01] ✨ [FEAT]** split proxy and web servers into separate npm scripts
- **[09:25:47] 🔧 [CHORE]** update kanban and changelog after multi-profile-management merge
- **[07:30:57] 🐛 [FIX]** add empty body to activate profile POST request
- **[07:27:18] 🐛 [FIX]** use correct /v1/sources endpoint and status code
- **[07:23:02] 🐛 [FIX]** update admin dashboard tests for new multi-profile API
- **[07:12:36] ✨ [FEAT]** implement multi-profile management with source selection
- **[07:42:04] ✨ [FEAT]** transition to narrative IA-generated style profile

## 30/03/2026

- **[20:11:02] ♻️ [REFACTOR]** focus prompt generation on qualitative expressions and remove thematic noise
- **[20:04:32] 🎨 [STYLE]** improve theme colors and dark mode readability
- **[19:22:54] 📝 [DOCS]** add TypeScript coding standards
- **[14:10:37] 🐛 [FIX]** align DATABASE_URL path for E2E tests in CI
- **[14:04:43] 🐛 [FIX]** add ESM compatibility fix for Prisma 7 generated imports
- **[10:06:20] 🐛 [FIX]** resolve Biome lint issues for CI compatibility
- **[10:03:46] 🐛 [FIX]** add datasource URL to prisma.config.ts for Prisma 7
- **[10:01:41] 🐛 [FIX]** resolve magicast dependency conflict between Prisma 7 and Vitest 4
- **[09:57:44] 🔧 [CHORE]** update changelog after Prisma 7 and LangChain v1 migrations
- **[09:54:21] ✨ [FEAT]** migrate LangChain to v1 and Vitest to v4
- **[09:50:04] ✨ [FEAT]** migrate to Prisma 7 with libSQL adapter
- **[06:23:37] 📦 [DEPS]** bump i18next from 25.10.9 to 26.0.1
- **[06:22:39] 📦 [DEPS]** bump lucide-react from 0.577.0 to 1.7.0
- **[06:22:24] 📦 [DEPS]** bump @biomejs/biome in the minor-and-patch group
- **[06:21:49] 👷 [CI]** bump actions/configure-pages from 5 to 6
- **[06:21:46] 👷 [CI]** bump codecov/codecov-action from 5 to 6
- **[06:21:43] 👷 [CI]** bump actions/deploy-pages from 4 to 5
- **[09:39:06] 🔧 [CHORE]** update kanban and changelog after dark-mode merge
- **[09:28:34] 🐛 [FIX]** improve theme toggle with system preference option
- **[09:27:21] ✨ [FEAT]** implement dark/light mode theme management
- **[07:03:30] 🐛 [FIX]** use conversationRef instead of messages state in saveConversation
- **[06:58:53] 🐛 [FIX]** add favicon route and ensure Conversation table exists
- **[06:53:03] 🐛 [FIX]** remove dead link in build documentation
- **[06:51:58] 🔧 [CHORE]** update kanban and changelog after conversation-history merge
- **[06:46:53] 🐛 [FIX]** filter non-critical console errors in E2E tests
- **[06:37:37] 🐛 [FIX]** resolve static assets route conflict in tests
- **[06:36:12] 🐛 [FIX]** resolve E2E test issues and improve web routing
- **[06:16:29] 🐛 [FIX]** add test:e2e:headless script and attempt to fix DATABASE_URL
- **[06:08:00] 🔧 [CHORE]** add sourcemaps and E2E tests for conversation history
- **[06:04:46] ✨ [FEAT]** add conversation history to chat interface

## 29/03/2026

- **[23:11:39] 🔧 [CHORE]** add dark mode management idea to backlog
- **[23:10:26] 🐛 [FIX]** resolve E2E test database path and add backlog ideas
- **[22:48:08] ✨ [FEAT]** add chat route and backlog ideas for user profiling
- **[22:34:45] ✨ [FEAT]** separate style profile from language preference and add URL routing
- **[21:43:39] 🐛 [FIX]** add service flag to dev scripts for wireit
- **[21:39:43] ♻️ [REFACTOR]** use wireit for dev scripts (dev:back, dev:front, dev for both)
- **[21:38:55] ♻️ [REFACTOR]** rename dev scripts for clarity (dev:back, dev:front, dev for both)
- **[21:32:37] 🐛 [FIX]** fix logs API test to match actual response format
- **[21:30:07] 🐛 [FIX]** use correct API endpoints in tests
- **[21:23:41] 🐛 [FIX]** set DATABASE_URL for E2E tests
- **[21:21:39] 🐛 [FIX]** add database initialization for E2E tests
- **[21:18:41] 🐛 [FIX]** download artifacts to dist directory for E2E tests
- **[21:14:50] ✨ [FEAT]** restore E2E tests for web architecture
- **[20:21:34] 👷 [CI]** remove Electron-related CI workflows
- **[20:18:20] ✨ [FEAT]** remove Electron dependencies and desktop app
- **[20:12:39] ✨ [FEAT]** add Docker Compose deployment stack
- **[20:09:36] ✨ [FEAT]** use SQLite in-memory database for unit tests
- **[19:58:06] ✨ [FEAT]** add standalone web frontend
- **[19:54:09] 🔧 [CHORE]** update package-lock.json
- **[19:46:17] ✨ [FEAT]** enable network access for web version
- **[19:10:29] 🐛 [FIX]** apply Biome formatting to e2e test file
- **[13:23:14] 🐛 [FIX]** add data-testid to navigation elements for e2e tests
- **[12:58:58] ✨ [FEAT]** improve style analysis and add logging system

## 27/03/2026

- **[10:47:04] 🐛 [FIX]** apply Prisma migrations to test databases in e2e fixtures
- **[10:13:53] 🐛 [FIX]** skip Sources API e2e tests due to backend timeout issue
- **[10:04:45] 🐛 [FIX]** simplify sources e2e tests following working pattern
- **[10:03:53] 🔧 [CHORE]** Revert "chore: temporarily remove sources e2e tests to unblock CI"
- **[10:00:26] 🔧 [CHORE]** temporarily remove sources e2e tests to unblock CI
- **[09:51:17] 🐛 [FIX]** apply Biome formatting to e2e test
- **[09:43:15] 🐛 [FIX]** make e2e tests more resilient for CI environment
- **[09:24:22] 🐛 [FIX]** resolve Biome linting errors in e2e test
- **[09:21:18] ✅ [TEST]** add comprehensive e2e tests for Sources page
- **[09:14:44] 🐛 [FIX]** add fetch timeouts to Sources component to prevent infinite loading
- **[09:08:52] 🔧 [CHORE]** update package-lock.json after npm install
- **[08:49:03] 🔧 [CHORE]** update kanban and changelog post-merge
- **[08:41:52] ✨ [FEAT]** add Sources management UI component in admin dashboard
- **[08:32:21] 🔧 [CHORE]** update kanban and changelog post-merge
- **[08:27:41] 🐛 [FIX]** sync UI language with config language selector
- **[08:23:33] ✨ [FEAT]** complete i18n coverage for all UI strings

## 26/03/2026

- **[19:07:37] ♻️ [REFACTOR]** remove 'start task' commits from workflow
- **[18:42:34] ✨ [FEAT]** enhance CLI --help output with descriptions and examples
- **[18:39:31] ✨ [FEAT]** add .editorconfig for consistent formatting across editors
- **[17:16:02] ♻️ [REFACTOR]** remove duplicate WORKFLOW.md and README.md from ai-specs
- **[16:47:54] 🐛 [FIX]** use node: protocol for Node.js imports in sync script
- **[16:45:40] 🔧 [CHORE]** update kanban and changelog
- **[16:45:23] 📝 [DOCS]** add SECURITY.md with vulnerability disclosure process
- **[15:37:21] ♻️ [REFACTOR]** consolidate AI specs into single source of truth
- **[15:04:49] 🔧 [CHORE]** add comprehensive backlog items from project analysis
- **[14:55:20] 📝 [DOCS]** add links to AI tools (Cline, Claude Code, Ollama, GLM)
- **[14:54:49] 📝 [DOCS]** update AI tools attribution to include Cline, Claude Code, Ollama, and GLM
- **[14:51:09] 🔧 [CHORE]** make project public with WIP notice and GitHub Pages
- **[12:04:43] 🔧 [CHORE]** update kanban and changelog post-merge
- **[11:58:26] 🔧 [CHORE]** update kanban and changelog after ci-performance-optimization merge
- **[11:49:36] ⚡ [PERF]** optimize CI pipeline performance
- **[11:27:42] ⚡ [PERF]** optimize E2E tests execution time
- **[09:28:35] ✅ [TEST]** remove skipped E2E tests
- **[09:23:31] 🔧 [CHORE]** add E2E tests cleanup task to backlog
- **[09:15:30] 🔧 [CHORE]** update kanban and changelog after cli-proxy-startup merge

## 25/03/2026

- **[19:35:33] ✨ [FEAT]** add CLI with options to start LLM proxy server
- **[19:31:02] 🔧 [CHORE]** add CLI for LLM proxy server startup to backlog
- **[13:55:39] 🐛 [FIX]** add dedicated test:e2e:ci script for CI pipeline
- **[13:51:38] 🐛 [FIX]** use npx playwright instead of playwright command
- **[13:47:17] ♻️ [REFACTOR]** fix IntelliJ warnings and improve code quality
- **[13:31:51] ⚡ [PERF]** optimize E2E tests and CI pipeline for faster execution
- **[11:37:13] ⚡ [PERF]** optimize E2E tests for faster CI pipeline
- **[09:38:11] 🐛 [FIX]** skip unstable navigation-dependent tests and reduce timeout

## 24/03/2026

- **[18:40:44] 🐛 [FIX]** improve test performance and skip failing tests
- **[17:16:36] 🔧 [CHORE]** optimize .biomeignore by removing redundant entries
- **[17:15:49] ♻️ [REFACTOR]** fix fixture usage and replace waitForTimeout
- **[17:06:14] 🐛 [FIX]** resolve Electron CommonJS import in ES modules
- **[13:53:52] 📦 [DEPS]** bump the minor-and-patch group with 10 updates
- **[14:58:41] 🎨 [STYLE]** fix formatting after unskipping tests
- **[14:56:06] ✅ [TEST]** remove stderr debugging and unskip all E2E tests
- **[14:50:26] 🔧 [CHORE]** restore weekly dependabot schedule
- **[14:50:08] 🔧 [CHORE]** trigger dependabot recreation with React overrides
- **[14:49:12] 🐛 [FIX]** add React overrides to fix dependabot peer dependency conflicts
- **[14:38:50] 🔧 [CHORE]** remove GitHub Pages deployment (private repo)
- **[13:29:17] 👷 [CI]** bump actions/setup-node from 5 to 6
- **[13:29:11] 👷 [CI]** bump actions/upload-pages-artifact from 3 to 4
- **[13:29:08] 👷 [CI]** bump actions/download-artifact from 7 to 8
- **[13:29:04] 👷 [CI]** bump actions/checkout from 5 to 6
- **[14:28:17] 🔧 [CHORE]** restore weekly dependabot schedule
- **[14:27:52] 🔧 [CHORE]** trigger dependabot with daily schedule
- **[12:10:00] 🐛 [FIX]** fix E2E tests with mock provider support

## 23/03/2026

- **[19:36:58] 🔧 [CHORE]** update kanban and changelog after frontend-i18n merge
- **[19:30:46] 🐛 [FIX]** regenerate package-lock.json from main to resolve CI dependency conflicts
- **[19:21:23] ✨ [FEAT]** implement frontend internationalization with react-i18next
- **[19:13:08] 🔧 [CHORE]** add frontend i18n task to backlog
- **[19:10:26] 🐛 [FIX]** add missing language property to ElectronAPI type
- **[19:06:08] ♻️ [REFACTOR]** migrate from shadcn/ui to Mantine UI
- **[19:05:49] ✨ [FEAT]** add multi-language support and improve streaming error handling
- **[19:05:38] ♻️ [REFACTOR]** migrate preload to CommonJS and add language support
- **[19:05:31] 🔧 [CHORE]** allow console.log in e2e tests and scripts
- **[19:04:03] ✅ [TEST]** add comprehensive E2E test suite with 63 new tests
- **[19:03:48] ♻️ [REFACTOR]** change defaults to ollama/gemma3:1b and remove .env

## 22/03/2026

- **[15:09:25] 🐛 [FIX]** implement config loading from environment variables in Electron
- **[09:02:59] 📝 [DOCS]** add comprehensive VitePress documentation

## 20/03/2026

- **[11:13:18] 🔧 [CHORE]** update kanban and changelog after llm-provider-selector merge
- **[11:05:37] ✨ [FEAT]** add explicit LLM provider selector in admin panel
- **[10:07:52] 🔧 [CHORE]** upgrade to upload-artifact@v7 and download-artifact@v8
- **[10:03:58] 🔧 [CHORE]** upgrade GitHub Actions to v5 for Node.js 24 support
- **[09:54:27] 🐛 [FIX]** navigate to chat page in chat interface tests

## 19/03/2026

- **[22:19:48] ✨ [FEAT]** improve Electron UI navigation and project structure
- **[21:57:24] 🐛 [FIX]** add missing build:renderer script declaration
- **[21:31:04] 🔧 [CHORE]** update changelog after langchain-integration merge
- **[21:28:11] 🔧 [CHORE]** update kanban and changelog after admin-dashboard merge
- **[21:13:42] ✨ [FEAT]** implement complete admin dashboard with Electron integration
- **[20:57:20] 🐛 [FIX]** increase timeout for streaming E2E tests
- **[20:49:59] 🐛 [FIX]** adapt E2E tests for LangChain integration
- **[20:40:55] ♻️ [REFACTOR]** replace raw fetch proxy with LangChain multi-provider integration
- **[20:30:55] 🔧 [CHORE]** regenerate changelog after removing start task commits
- **[19:07:57] 🔧 [CHORE]** update kanban and changelog after end-to-end-pipeline merge
- **[18:55:17] ✨ [FEAT]** implement end-to-end style profile generation pipeline
- **[18:55:00] 🐛 [FIX]** correct cleanup - models-endpoint was merged, not end-to-end-pipeline
- **[18:52:55] 🔧 [CHORE]** update kanban and changelog after end-to-end-pipeline merge
- **[18:38:07] 🐛 [FIX]** resolve linting warnings and formatting issues
- **[18:28:37] ✨ [FEAT]** add /v1/models endpoint for OpenAI-compatible client discovery
- **[18:38:47] 📝 [DOCS]** strengthen quality check rules to enforce zero warnings policy
- **[16:43:16] ♻️ [REFACTOR]** make rules and skills reusable for any project
- **[15:20:06] 🐛 [FIX]** use npm cache instead of artifact sharing for node_modules
- **[15:15:24] 🐛 [FIX]** simplify artifact handling - remove separate prisma artifact
- **[15:01:27] 🐛 [FIX]** remove wireit cache from setup and fix artifact handling
- **[14:52:33] ⚡ [PERF]** optimize CI pipeline with shared artifacts
- **[14:48:53] 🔧 [CHORE]** add test output directories to gitignore
- **[14:45:14] 🔧 [CHORE]** update changelog after consolidate-build-outputs merge
- **[14:36:41] 🐛 [FIX]** resolve renderer path detection and optimize E2E test timeouts
- **[14:11:06] 🐛 [FIX]** improve renderer path detection with comprehensive fallback logic
- **[13:38:23] 🐛 [FIX]** update renderer path resolution for consolidated build structure
- **[11:21:16] 🔧 [CHORE]** consolidate build outputs under dist/ directory
- **[13:51:37] 🔧 [CHORE]** update kanban and changelog after workflow optimization merge
- **[13:37:26] ✨ [FEAT]** add E2E skills and improve test stability
- **[11:06:36] 🔧 [CHORE]** simplify KANBAN workflow and synchronize rules documentation
- **[10:12:54] 🔧 [CHORE]** update kanban and changelog after persona-prompt-generator merge
- **[09:19:44] ✨ [FEAT]** add automatic persona prompt generation from style analysis
- **[09:58:28] 🐛 [FIX]** make assistant response test CI-friendly
- **[09:49:31] 🐛 [FIX]** add e2e test selectors to React chat components
- **[09:03:00] 🔧 [CHORE]** clean up worktree documentation and gitignore

## 18/03/2026

- **[16:53:14] 🔧 [CHORE]** update kanban and changelog after chat-interface merge
- **[16:27:05] ✨ [FEAT]** migrate chat interface to React + Vite + Tailwind + Shadcn/UI
- **[16:33:47] ✨ [FEAT]** add fun default persona prompt for MeSame
- **[16:24:09] 🔧 [CHORE]** add package.json formatting rule with wireit at end
- **[15:05:49] 🔧 [CHORE]** reprioritize backlog for MVP focus
- **[14:48:14] 🔧 [CHORE]** update kanban and changelog after chat-interface merge
- **[14:43:04] ✅ [TEST]** add E2E tests for chat interface
- **[14:27:01] ✨ [FEAT]** add chat interface with streaming display
- **[12:20:18] 🐛 [FIX]** accept 401 as valid response in proxy tests
- **[12:12:04] 🐛 [FIX]** initialize database before E2E tests
- **[12:04:53] 🐛 [FIX]** correct API endpoint paths in E2E tests
- **[11:51:50] 🐛 [FIX]** use process.cwd() for project root in E2E tests
- **[11:42:14] 🐛 [FIX]** verify build exists instead of attempting to build in E2E tests
- **[11:32:48] 🐛 [FIX]** use fs.existsSync to check for dist-electron in E2E tests
- **[11:24:39] 🐛 [FIX]** update biome schema version and fix playwright config formatting
- **[11:17:41] 🐛 [FIX]** configure E2E tests for headless CI execution
- **[10:50:09] 🐛 [FIX]** use upload-artifact@v4 instead of v8
- **[10:45:29] 🐛 [FIX]** update vitest to 3.2.4 and langchain/core to 0.3.80
- **[10:40:06] 🐛 [FIX]** update package-lock.json with correct langchain dependencies
- **[10:23:36] 🐛 [FIX]** correct CI workflow for E2E tests
- **[10:17:00] ✨ [FEAT]** implement E2E testing harness with Playwright for Electron app
- **[10:06:15] 🐛 [FIX]** update vitest to 3.2.4 to match @vitest/coverage-v8
- **[09:53:51] 🔧 [CHORE]** sort npm scripts and add .npm to worktree-sync
- **[09:52:34] 📦 [DEPS]** bump @langchain/core from 0.3.51 to 0.3.80
- **[09:46:42] 🔧 [CHORE]** pin dependencies and add .idea/ to worktree-sync
- **[09:06:42] 🔧 [CHORE]** update kanban and changelog post-merge
- **[09:06:34] 🔧 [CHORE]** update changelog post-merge
- **[08:04:10] 📦 [DEPS]** bump @commitlint/config-conventional from 19.8.1 to 20.5.0
- **[07:58:33] 👷 [CI]** bump actions/download-artifact from 6 to 8
- **[07:58:29] 👷 [CI]** bump actions/upload-artifact from 6 to 7
- **[07:59:21] 📦 [DEPS]** bump electron from 41.0.2 to 41.0.3 in the minor-and-patch group
- **[08:00:00] 📦 [DEPS]** bump @types/node from 22.19.15 to 25.5.0
- **[08:01:21] 📦 [DEPS]** bump @fastify/static from 8.3.0 to 9.0.0
- **[08:01:32] 📦 [DEPS]** bump @commitlint/cli from 19.8.1 to 20.5.0
- **[08:58:06] 🔧 [CHORE]** update kanban and changelog post-merge
- **[08:51:10] 🐛 [FIX]** add FORCE_JAVASCRIPT_ACTIONS_TO_NODE24 for Node.js 24 compatibility

## 17/03/2026

- **[18:23:34] 🐛 [FIX]** update actions to resolve Node.js 20 deprecation warnings
- **[18:15:51] ♻️ [REFACTOR]** merge coverage into validate to avoid running tests twice
- **[18:10:52] ✨ [FEAT]** add wireit for parallel task orchestration and caching
- **[18:06:33] 🐛 [FIX]** add @vitest/coverage-v8 for CI test coverage
- **[18:03:36] 🐛 [FIX]** remove coverage dependency and fix duplicate gitignore entry
- **[17:58:23] 🔧 [CHORE]** add GitHub Actions CI pipeline, release workflow and Dependabot
- **[17:59:10] 📝 [DOCS]** update BRIEF with Electron app and revised roadmap
- **[17:50:55] 🔧 [CHORE]** update kanban and changelog post-merge
- **[17:39:40] ✨ [FEAT]** add source management REST API with text and PDF import
- **[17:45:46] ✨ [FEAT]** add NLP style analyzer with TF-IDF, N-Grams and linguistic metrics
- **[14:29:52] 🐛 [FIX]** improve icon handling and graceful shutdown
- **[11:08:31] 🔧 [CHORE]** update kanban and changelog post-merge
- **[10:52:12] 🐛 [FIX]** resolve Electron app startup issues and test failures
- **[07:38:48] ✨ [FEAT]** add Electron desktop application wrapper
- **[07:19:24] ♻️ [REFACTOR]** remove absolute paths from .claude configuration
- **[07:10:42] 🔧 [CHORE]** add project assets and standardize skill naming

## 16/03/2026

- **[18:45:02] ✨ [FEAT]** improve server logging and add backlog features
- **[15:53:25] ✨ [FEAT]** implement style injection with multi-provider support
- **[11:17:39] ✨ [FEAT]** silence Fastify logs in test environment
- **[11:10:18] 📝 [DOCS]** update MIT license format and copyright year
- **[11:08:58] 🔧 [CHORE]** add changelog generation script
- **[11:06:14] 🔧 [CHORE]** complete task - fastify server with proxy and prisma
- **[11:04:11] 📝 [DOCS]** add MIT license file
- **[10:28:36] ✨ [FEAT]** add fastify server with health check, proxy route, and prisma integration
- **[10:24:54] 🔧 [CHORE]** add project configuration files
