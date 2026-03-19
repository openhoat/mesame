# Kanban Board

<!-- Format definitions: See .claude/rules/task_format.md -->

## Backlog

<!-- MVP Phase 0: Frontend foundation -->
<!-- MVP Phase 1: End-to-end style pipeline -->
- [ ] **[ARCHITECTURE]** Add /v1/models endpoint for OpenAI-compatible client discovery (P1)
- [ ] **[ARCHITECTURE]** Create end-to-end pipeline: source import → style analysis → persona prompt → style profile (P1)
<!-- MVP Phase 2: Usability -->
- [ ] **[UX]** Add conversation history to chat interface (P2)
- [ ] **[TEST]** Implement E2E testing harness with Playwright for Electron app (P2)
<!-- Post-MVP enhancements -->
- [ ] **[ARCHITECTURE]** Replace raw fetch proxy with LangChain.js multi-provider integration (P3)
- [ ] **[UX]** Build Admin Dashboard with React + Vite + Tailwind + Shadcn (P3)
- [ ] **[SECURITY]** Add regex-based data anonymization for sensitive content (P3)
- [ ] **[DEVOPS]** Implement real-time logging system with WebSocket (P3)
- [ ] **[UX]** Add multi-profile style management support (P3)
- [ ] **[CONFIG]** Create CLI for configuration management (P3)

<!-- Workflow & Skills Optimization - Priorité P1 -->
- [ ] **[DEVOPS]** Consolider les outputs de build sous ./dist/ (P1)
    - Modifier `vitest.config.ts` : coverage reporter -> `dist/coverage/`
    - Modifier `playwright.config.ts` : outputDir -> `dist/test-results/`, reporter -> `dist/e2e-report/`
    - Modifier `package.json` wireit : mettre à jour les chemins de output pour build, test:coverage, test:e2e
    - Modifier `electron/renderer/vite.config.ts` : build.outDir -> `../../dist/renderer/`
    - Modifier `tsconfig.json` : outDir -> `dist/server/`
    - Simplifier `.gitignore` : remplacer les chemins multiples par `dist/`

<!-- Workflow & Skills Optimization - Priorité P2 -->
- [ ] **[DEVOPS]** Créer skill e2e-test pour exécuter les tests E2E avec diagnostic (P2)
    - Créer `.claude/skills/e2e-test/SKILL.md`
    - Inclure commande `npm run test:e2e:headless` pour CI
    - Inclure commande `npm run test:e2e:ui` pour développement local
    - Ajouter diagnostic automatique en cas d'échec (analyse des logs, screenshots)
    - Ajouter timeout configurable selon l'environnement
- [ ] **[DEVOPS]** Créer skill fix-e2e pour workflow de correction des tests E2E instables (P2)
    - Créer `.claude/skills/fix-e2e/SKILL.md`
    - Analyser les échecs récents dans l'historique Git : `git log --oneline --grep="fix(e2e)"`
    - Identifier les patterns d'échec courants (timeout, selector, API mock)
    - Proposer les corrections types pour chaque pattern
    - Inclure une checklist de validation
- [ ] **[TEST]** Améliorer la stabilité des tests E2E (P2)
    - Modifier `e2e/fixtures.ts` : améliorer les fixtures avec meilleure gestion des erreurs
    - Modifier `playwright.config.ts` : ajouter retries conditionnels (CI: 2, local: 0)
    - Modifier `e2e/helpers/api.ts` : améliorer la gestion des timeouts et retries
    - Ajouter des mocks pour les services externes dans `e2e/mocks.ts`
    - Configurer timeout adaptatif selon l'environnement (CI vs local)
    - Améliorer le reporting des erreurs E2E avec plus de contexte

## In Progress

- [ ] **[DEVOPS]** Simplifier workflow KANBAN - supprimer les commits "start task" qui polluent l'historique Git
    - Modifier `.claude/skills/start-task/SKILL.md` : supprimer l'étape "Commit KANBAN.md on main"
    - Modifier `.clinerules/workflows/start_task.md` : supprimer l'étape 6 (commit KANBAN)
    - Modifier `.claude/skills/cleanup-worktree/SKILL.md` : ajouter mise à jour KANBAN dans le commit de cleanup
    - Modifier `.clinerules/WORKFLOW.md` : mettre à jour le workflow pour refléter le nouveau processus
    - KANBAN.md devient un fichier de travail local (non versionné au démarrage)
- [ ] **[DEVOPS]** Synchroniser les règles entre .clinerules/ et .claude/rules/
    - Vérifier que `start_task.md` et `start-task/SKILL.md` sont synchronisés
    - Vérifier que `cleanup_worktree.md` et `cleanup-worktree/SKILL.md` sont synchronisés
    - Vérifier que `complete_task.md` et `complete-task/SKILL.md` sont synchronisés
    - Créer un script ou document de synchronisation si nécessaire
