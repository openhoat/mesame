# Architecture

MeSame is built with a modern TypeScript stack, designed for local-first operation and maximum flexibility.

## System Overview

```
┌─────────────────┐
│  Client App     │  (Any OpenAI-compatible client)
│  (curl, SDK)    │
└────────┬────────┘
         │ POST /v1/chat/completions
         ▼
┌─────────────────────────────────────┐
│       MeSame Proxy Server           │
│  ┌──────────────────────────────┐   │
│  │  1. Receive Request          │   │
│  │  2. Fetch Style Profile (DB) │   │
│  │  3. Inject System Prompt     │   │
│  │  4. Forward to LLM           │   │
│  │  5. Stream Response (SSE)    │   │
│  └──────────────────────────────┘   │
└────────┬─────────────────────┬──────┘
         │                     │
         ▼                     ▼
┌─────────────────┐   ┌─────────────────┐
│   SQLite DB     │   │  Target LLM     │
│  Style Profiles │   │  (OpenAI, etc)  │
│  Sources        │   │                 │
└─────────────────┘   └─────────────────┘
```

## Directory Structure

```
mesame/
├── src/                    # Backend (Node.js + Fastify)
│   ├── app.ts              # Fastify app setup
│   ├── server.ts           # Server entry point
│   ├── config.ts           # Environment variables
│   ├── db.ts               # Prisma client
│   ├── routes/             # API routes
│   │   ├── health.ts       # Health check endpoint
│   │   ├── proxy.ts        # LLM proxy endpoint
│   │   ├── sources.ts      # Source documents CRUD
│   │   ├── styleProfile.ts # Style profile CRUD
│   │   └── ui.ts           # Static UI serving
│   ├── services/           # Business logic
│   │   ├── fileParser.ts   # Document parsing (PDF, MD, TXT)
│   │   ├── styleAnalyzer.ts # NLP analysis (TF-IDF, N-Grams)
│   │   ├── personaPromptGenerator.ts # System Prompt generation
│   │   ├── styleInjector.ts # Inject style into LLM requests
│   │   ├── llmProvider.ts   # Multi-provider LLM abstraction
│   │   ├── styleProfileService.ts # Style profile management
│   │   └── sourceService.ts # Source document management
│   └── types/              # TypeScript types
├── electron/               # Electron desktop app
│   ├── main.ts             # Electron main process
│   ├── preload.ts          # Preload script (IPC bridge)
│   └── renderer/           # React frontend
│       ├── src/
│       │   ├── pages/      # UI pages (Chat, Sources, Settings)
│       │   ├── components/ # Reusable UI components
│       │   ├── hooks/      # React hooks
│       │   └── services/   # API clients
│       ├── index.html      # Entry HTML
│       └── vite.config.ts  # Vite build config
├── prisma/                 # Database
│   ├── schema.prisma       # Database schema
│   └── dev.db              # SQLite database file
├── tests/                  # E2E tests (Playwright)
└── package.json            # Dependencies and scripts
```

## Core Components

### 1. Fastify Backend (src/)

**Tech Stack**:
- **Fastify** — Fast, low-overhead web framework
- **Prisma** — Type-safe ORM for SQLite
- **LangChain.js** — LLM orchestration (supports OpenAI, Anthropic, Google, Ollama)

**Key Routes**:

| Route | Method | Description |
|-------|--------|-------------|
| `/health` | GET | Health check |
| `/v1/chat/completions` | POST | OpenAI-compatible proxy endpoint |
| `/api/sources` | GET, POST, DELETE | Manage source documents |
| `/api/style-profile` | GET, POST | Manage style profile |
| `/` | GET | Serve React UI (static files) |

### 2. Style Analysis Pipeline (services/)

**Components**:

1. **fileParser.ts** — Extracts text from PDF, MD, TXT
   - Uses `pdf-parse` for PDF files
   - Native parsing for Markdown and plain text

2. **styleAnalyzer.ts** — NLP analysis
   - **TF-IDF** (Term Frequency-Inverse Document Frequency) for keyword extraction
   - **N-Grams** (bigrams, trigrams) for phrase detection
   - **Metrics**: Average sentence length, lexical richness (type-token ratio)
   - Uses `natural` and `compromise` libraries

3. **personaPromptGenerator.ts** — System Prompt synthesis
   - Combines extracted patterns into a coherent style description
   - Generates instructions for LLM to mimic user's style

4. **styleInjector.ts** — Request modification
   - Intercepts OpenAI-compatible requests
   - Prepends style System Prompt to messages
   - Forwards modified request to target LLM

5. **llmProvider.ts** — Multi-provider abstraction
   - Unified interface for OpenAI, Anthropic, Google, Ollama
   - Handles streaming (SSE) responses
   - LangChain-based implementation

### 3. Electron Desktop App (electron/)

**Tech Stack**:
- **Electron** — Cross-platform desktop framework
- **React** — UI library
- **Vite** — Fast build tool
- **Tailwind CSS + Shadcn/UI** — Styling

**Main Process (main.ts)**:
- Creates BrowserWindow
- Starts embedded Fastify server
- Handles IPC communication

**Renderer Process (renderer/)**:
- React-based admin dashboard
- Pages: Chat, Sources, Style Profile, Logs, Settings
- Real-time streaming chat interface (SSE)

### 4. Database (Prisma + SQLite)

**Schema**:

```prisma
model Source {
  id         String   @id @default(uuid())
  filename   String
  content    String   // Extracted text
  createdAt  DateTime @default(now())
}

model StyleProfile {
  id            String   @id @default(uuid())
  systemPrompt  String   // Generated style prompt
  patterns      String   // JSON: TF-IDF keywords, N-Grams
  metrics       String   // JSON: sentence length, lexical richness
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**Operations**:
- `db:generate` — Generate Prisma client from schema
- `db:push` — Sync schema to SQLite file
- `db:seed` — Insert sample data
- `db:studio` — Open Prisma Studio (GUI for database)

## Data Flow

### Style Analysis Flow

```
User uploads document
         ↓
fileParser.ts → Extract text
         ↓
styleAnalyzer.ts → Analyze patterns
         ↓
personaPromptGenerator.ts → Generate System Prompt
         ↓
Save to StyleProfile table (DB)
```

### Proxy Request Flow

```
Client sends POST /v1/chat/completions
         ↓
styleInjector.ts → Fetch style profile from DB
         ↓
Inject System Prompt into messages
         ↓
llmProvider.ts → Forward to target LLM
         ↓
Stream response back to client (SSE)
```

## Tech Choices

### Why Fastify?

- **Performance** — 20-30% faster than Express
- **Schema Validation** — Built-in JSON schema support
- **TypeScript-First** — Excellent type inference

### Why SQLite?

- **Local-First** — No external database needed
- **Zero Config** — Single file, no server
- **Prisma Support** — Type-safe queries

### Why LangChain?

- **Multi-Provider** — Single API for OpenAI, Anthropic, Google, Ollama
- **Streaming** — Native SSE support
- **Ecosystem** — Rich tooling for LLM orchestration

### Why Electron?

- **Cross-Platform** — Single codebase for Windows, macOS, Linux
- **Embedded Server** — No separate backend process
- **Native Integration** — Access to OS APIs (file system, notifications)

## Testing

**Unit Tests** (Vitest):
- `src/services/**/*.test.ts` — Business logic tests
- Coverage: TF-IDF, N-Grams, style injection, LLM providers

**E2E Tests** (Playwright):
- `tests/**/*.spec.ts` — Full app workflows
- Coverage: Document upload, style analysis, chat interface

**Run Tests**:

```bash
npm run test              # Unit tests
npm run test:coverage     # Unit tests with coverage
npm run test:e2e          # E2E tests
```

## Build Pipeline

**Backend Build**:
```bash
npm run build             # Compile TypeScript to dist/
```

**Electron Build**:
```bash
npm run build:all         # Build backend + Electron + renderer
npm run pack              # Package without distributing
npm run dist              # Build installers (AppImage, DMG, EXE)
```

**Validation**:
```bash
npm run validate          # QA + typecheck + tests
```

## Deployment

### Server-Only (CLI)

1. Build: `npm run build`
2. Start: `npm start`
3. Access: `http://localhost:3000`

### Electron Desktop App

1. Build: `npm run dist`
2. Output: `dist/electron-app/`
3. Distribute: `.AppImage`, `.dmg`, `.exe` installers

## Security Considerations

- **Local-Only** — Server binds to `127.0.0.1` (no external access)
- **No Auth** — Proxy does not validate API keys (assumes trusted local environment)
- **Document Privacy** — All analysis happens locally (no cloud upload)
- **API Key Storage** — Stored in environment variables or Electron secure storage

> For production deployment, consider adding authentication and HTTPS support.
