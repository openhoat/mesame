# Changelog

## 16/03/2026

- **[10:24:08] 🔧 [CHORE]** start task - set up fastify server with proxy and prisma
- **[10:24:54] 🔧 [CHORE]** add project configuration files
- **[10:28:36] ✨ [FEAT]** add fastify server with health check, proxy route, and prisma integration
- **[11:04:11] 📝 [DOCS]** add MIT license file
- **[11:06:14] 🔧 [CHORE]** complete task - fastify server with proxy and prisma
- **[11:08:58] 🔧 [CHORE]** add changelog generation script
- **[11:10:18] 📝 [DOCS]** update MIT license format and copyright year
- **[11:17:39] ✨ [FEAT]** silence Fastify logs in test environment
- **[15:53:25] ✨ [FEAT]** implement style injection with multi-provider support
- **[18:45:02] ✨ [FEAT]** improve server logging and add backlog features

## 17/03/2026

- **[07:10:42] 🔧 [CHORE]** add project assets and standardize skill naming
- **[07:19:24] ♻️ [REFACTOR]** remove absolute paths from .claude configuration
- **[07:23:36] 🔧 [CHORE]** start task - Create Electron desktop application
- **[07:38:48] ✨ [FEAT]** add Electron desktop application wrapper
- **[10:52:12] 🐛 [FIX]** resolve Electron app startup issues and test failures
- **[11:08:31] 🔧 [CHORE]** update kanban and changelog post-merge
- **[14:29:52] 🐛 [FIX]** improve icon handling and graceful shutdown
- **[17:34:52] 🔧 [CHORE]** start task - Implement source management REST API with text and PDF import
- **[17:40:15] 🔧 [CHORE]** start task - Implement NLP style analyzer with TF-IDF, N-Grams and linguistic metrics
- **[17:45:46] ✨ [FEAT]** add NLP style analyzer with TF-IDF, N-Grams and linguistic metrics
- **[17:39:40] ✨ [FEAT]** add source management REST API with text and PDF import
- **[17:50:55] 🔧 [CHORE]** update kanban and changelog post-merge
- **[17:53:31] 🔧 [CHORE]** start task - Add GitHub Actions CI pipeline
- **[17:59:10] 📝 [DOCS]** update BRIEF with Electron app and revised roadmap
- **[17:58:23] 🔧 [CHORE]** add GitHub Actions CI pipeline, release workflow and Dependabot
- **[18:03:36] 🐛 [FIX]** remove coverage dependency and fix duplicate gitignore entry
- **[18:06:33] 🐛 [FIX]** add @vitest/coverage-v8 for CI test coverage
- **[18:10:52] ✨ [FEAT]** add wireit for parallel task orchestration and caching
- **[18:15:51] ♻️ [REFACTOR]** merge coverage into validate to avoid running tests twice
- **[18:23:34] 🐛 [FIX]** update actions to resolve Node.js 20 deprecation warnings

## 18/03/2026

- **[08:51:10] 🐛 [FIX]** add FORCE_JAVASCRIPT_ACTIONS_TO_NODE24 for Node.js 24 compatibility
- **[08:58:06] 🔧 [CHORE]** update kanban and changelog post-merge
- **[08:01:32] 📦 [DEPS]** bump @commitlint/cli from 19.8.1 to 20.5.0
- **[08:01:21] 📦 [DEPS]** bump @fastify/static from 8.3.0 to 9.0.0
- **[08:00:00] 📦 [DEPS]** bump @types/node from 22.19.15 to 25.5.0
- **[07:59:21] 📦 [DEPS]** bump electron from 41.0.2 to 41.0.3 in the minor-and-patch group
- **[07:58:29] 👷 [CI]** bump actions/upload-artifact from 6 to 7
- **[07:58:33] 👷 [CI]** bump actions/download-artifact from 6 to 8
- **[08:04:10] 📦 [DEPS]** bump @commitlint/config-conventional from 19.8.1 to 20.5.0
- **[09:06:34] 🔧 [CHORE]** update changelog post-merge
- **[09:06:42] 🔧 [CHORE]** update kanban and changelog post-merge
- **[09:41:34] 🔧 [CHORE]** start task - Implement E2E testing harness with Playwright
- **[09:46:42] 🔧 [CHORE]** pin dependencies and add .idea/ to worktree-sync
- **[09:52:34] 📦 [DEPS]** bump @langchain/core from 0.3.51 to 0.3.80
- **[09:53:51] 🔧 [CHORE]** sort npm scripts and add .npm to worktree-sync
- **[10:06:15] 🐛 [FIX]** update vitest to 3.2.4 to match @vitest/coverage-v8
- **[10:17:00] ✨ [FEAT]** implement E2E testing harness with Playwright for Electron app
- **[10:23:36] 🐛 [FIX]** correct CI workflow for E2E tests
- **[10:40:06] 🐛 [FIX]** update package-lock.json with correct langchain dependencies
- **[10:45:29] 🐛 [FIX]** update vitest to 3.2.4 and langchain/core to 0.3.80
- **[10:50:09] 🐛 [FIX]** use upload-artifact@v4 instead of v8
- **[11:17:41] 🐛 [FIX]** configure E2E tests for headless CI execution
- **[11:24:39] 🐛 [FIX]** update biome schema version and fix playwright config formatting
- **[11:32:48] 🐛 [FIX]** use fs.existsSync to check for dist-electron in E2E tests
- **[11:42:14] 🐛 [FIX]** verify build exists instead of attempting to build in E2E tests
- **[11:51:50] 🐛 [FIX]** use process.cwd() for project root in E2E tests
- **[12:04:53] 🐛 [FIX]** correct API endpoint paths in E2E tests
- **[12:12:04] 🐛 [FIX]** initialize database before E2E tests
- **[12:20:18] 🐛 [FIX]** accept 401 as valid response in proxy tests
- **[14:21:02] 🔧 [CHORE]** start task - Build chat interface in Electron app
- **[14:27:01] ✨ [FEAT]** add chat interface with streaming display
- **[14:43:04] ✅ [TEST]** add E2E tests for chat interface
