# Kanban Board

<!-- Format definitions: See .claude/rules/task_format.md -->

## Backlog

<!-- High Priority -->

<!-- Medium Priority -->
- [ ] **[PERFORMANCE]** Add prompt compression for LLM requests (LLMLingua-style or selective context) to reduce token usage on long prompts (P2)
[//]: # Completes the original LLM optimization research (commit bfe74ac) - compression part was never delivered in b42fac7
- [ ] **[PERFORMANCE]** Use token-based context budget with tiktoken instead of message-count sliding window (P2)
- [ ] **[PERFORMANCE]** Add single-flight deduplication for concurrent identical LLM requests to avoid duplicate provider calls (P2)
- [ ] **[PERFORMANCE]** Aggregate and persist LLM token usage metrics for cost tracking and dashboard visualization (P2)
- [ ] **[FEAT]** Add voice discussion as alternative questionnaire experience (P2)
- [ ] **[ARCHITECTURE]** Migrate to PostgreSQL for improved scalability and vector support (P2)
<!-- Low Priority -->
- [ ] **[PERFORMANCE]** Add semantic response cache using embedding similarity to catch near-duplicate questions (P3)
- [ ] **[PERFORMANCE]** Persist response cache across restarts (SQLite/Redis) instead of in-memory only (P3)
- [ ] **[PERFORMANCE]** Add hierarchical/incremental summarization for very long conversations (summary of summaries) (P3)
- [ ] **[PERFORMANCE]** Enable gzip/brotli compression on SSE proxy responses via Fastify compress plugin (P3)
- [ ] **[PERFORMANCE]** Extend Anthropic cache_control to stable user messages and tool definitions, not only system messages (P3)
- [ ] **[PERFORMANCE]** Preserve important messages (tool calls, decisions, errors) when applying sliding window (P3)
- [ ] **[PERFORMANCE]** Expose response cache hit/miss metrics and summarization stats for observability (P3)
- [ ] **[FEAT]** Create OpenAPI/Swagger specification for proxy API (P3)

## In Progress