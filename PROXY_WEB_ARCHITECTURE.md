# Proxy & Web Server Architecture

## Overview

MeSame now provides two separate server modes to give you flexibility in how you deploy and use the application:

1. **Proxy Server** (`npm run proxy`) - Lightweight LLM proxy for API clients
2. **Web Server** (`npm run web`) - Full-featured dashboard and chat interface

## Quick Start

### Launch Proxy Only

```bash
npm run proxy
```

- **Port**: 3000 (default, configurable via `MESAME_PORT`)
- **Routes**: `/v1/*` (OpenAI-compatible), `/health`
- **Use case**: CLI tools, IDE extensions (Continue.dev, Cursor, etc.), API clients

### Launch Web Dashboard

```bash
npm run web
```

- **Port**: 3001 (default, configurable via `MESAME_WEB_PORT`)
- **Routes**: `/api/*`, `/`, `/chat`, `/dashboard`
- **Use case**: Browser-based chat interface, admin dashboard, configuration management

### Launch Both (Development)

```bash
# Terminal 1
npm run proxy

# Terminal 2
npm run web
```

Or use the existing development command (launches full stack):

```bash
npm run dev
```

## Environment Variables

### Proxy Server

```bash
# Proxy server configuration
MESAME_PORT=3000              # Proxy server port
MESAME_HOST=0.0.0.0           # Proxy server host
MESAME_PROVIDER=ollama        # LLM provider (openai, anthropic, ollama)
MESAME_MODEL=gemma3:1b        # Model identifier
MESAME_LOG_LEVEL=info         # Log verbosity
MESAME_LANGUAGE=en            # Response language
```

### Web Server

```bash
# Web server configuration
MESAME_WEB_PORT=3001          # Web server port
MESAME_WEB_HOST=0.0.0.0       # Web server host
MESAME_PROXY_URL=http://localhost:3000  # Proxy server URL (for API calls)
```

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│  CLI: mesame --provider openai              │
│  Launches Proxy Server (Port 3000)         │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  Proxy Server (npm run proxy)               │
│  Port: 3000                                 │
│  ┌─────────────────────────────────────┐   │
│  │ Routes:                             │   │
│  │ - GET  /v1/models                   │   │
│  │ - POST /v1/chat/completions         │   │
│  │ - GET  /health                      │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Web Server (npm run web)                   │
│  Port: 3001                                 │
│  ┌─────────────────────────────────────┐   │
│  │ Routes:                             │   │
│  │ - /api/config                       │   │
│  │ - /api/conversations                │   │
│  │ - /api/sources                      │   │
│  │ - /api/style-profiles               │   │
│  │ - /                  (UI)           │   │
│  │ - /chat              (UI)           │   │
│  │ - /dashboard         (UI)           │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## Use Cases

### 1. IDE Integration (Proxy Only)

Launch the proxy server and configure your IDE to use it:

```bash
npm run proxy
```

Configure your IDE extension (e.g., Continue.dev):

```json
{
  "models": [
    {
      "title": "MeSame Proxy",
      "provider": "openai",
      "model": "gpt-4o",
      "apiBase": "http://localhost:3000/v1"
    }
  ]
}
```

### 2. Web Chat Interface

Launch the web server to use the browser-based chat:

```bash
npm run web
```

Open http://localhost:3001/chat in your browser.

### 3. Full Development Stack

Launch both servers for complete functionality:

```bash
npm run dev
```

This launches:
- Backend API server (all routes)
- Frontend development server (Vite)

## Migration from Previous Architecture

Previously, `npm run dev` launched a single monolithic server with all routes. This is still available and works as before.

The new architecture provides:
- **Better separation of concerns**: Proxy logic separate from web UI
- **Flexible deployment**: Deploy only what you need
- **Resource efficiency**: Proxy server is lightweight (no UI, no Prisma)
- **Independent scaling**: Scale proxy and web servers separately

## Scripts Reference

| Script | Description | Port |
|--------|-------------|------|
| `npm run proxy` | Proxy server only | 3000 |
| `npm run web` | Web server + UI | 3001 |
| `npm run dev` | Full development stack | 3000 (API), 5173 (Vite) |
| `mesame` | CLI proxy launcher | 3000 |

## Configuration Files

- `.env.local` - Local environment overrides
- `.env.development.local` - Development-specific overrides
- `prisma/dev.db` - SQLite database (web server only)
