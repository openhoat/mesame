# Generate Documentation

Invoke the **documentation-generator** agent to create or update project documentation.

## Usage

Delegate to the documentation-generator agent defined in `.claude/agents/documentation-generator.md`.

The documentation-generator agent will:

1. **API documentation**: Generate docs for Fastify API routes and endpoints.
2. **Code documentation**: Add or update JSDoc/TSDoc comments for public functions and classes.
3. **Architecture docs**: Document the project structure, data flow, and key design decisions.
4. **Setup guide**: Ensure setup and development instructions are up-to-date.
5. **Component docs**: Document key components:
   - NLP pipeline (Natural, Compromise.js)
   - LangChain.js integration
   - Prisma schema and models
   - React frontend components

## Invocation

Use the TaskCreate tool to spawn the documentation-generator agent, or follow its instructions directly.