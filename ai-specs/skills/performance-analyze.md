# Performance Analysis

Invoke the **performance-analyzer** agent to analyze and optimize project performance.

## Usage

Delegate to the performance-analyzer agent defined in `.claude/agents/performance-analyzer.md`.

The performance-analyzer agent will focus on:

1. **API/Proxy performance**:
   - Fastify route response times
   - Proxy middleware overhead
   - Database query performance (Prisma)
   - Connection pooling efficiency

2. **NLP pipeline performance**:
   - Natural.js processing times
   - Compromise.js parsing overhead
   - LangChain.js chain execution times
   - Token usage and API call optimization

3. **General optimization**:
   - Memory usage patterns
   - Event loop blocking detection
   - Inefficient algorithms or data structures
   - Caching opportunities

4. **Recommendations**: Prioritized list of performance improvements with estimated impact.

## Invocation

Use the TaskCreate tool to spawn the performance-analyzer agent, or follow its instructions directly.