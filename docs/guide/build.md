# Build and Deployment

This guide explains how to build and deploy MeSame.

## Prerequisites

- Node.js 22+
- npm
- Docker (for containerized deployment)

## Quick Start

### Development Mode

```bash
# Install dependencies
npm install

# Initialize database
npm run db:generate
npm run db:push

# Start both servers with hot reload
npm run dev
```

Services will be available at:
- **Web Dashboard**: `http://localhost:3000`
- **LLM API**: `http://localhost:3001`

### Production Mode

```bash
# Build backend and frontend
npm run build:all

# Start LLM server
npm run llm

# Start Web server (in another terminal)
npm run web
```

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Start MeSame
docker compose up -d

# View logs
docker compose logs -f

# Stop MeSame
docker compose down
```

Services will be available at:
- **Web Dashboard**: `http://localhost:3000`
- **LLM API**: `http://localhost:3001`

### Configuration

Edit `docker-compose.yml` to configure environment variables.

#### LLM Provider

```yaml
environment:
  # Use local Ollama (default)
  - MESAME_PROVIDER=ollama
  - MESAME_MODEL=gemma3:1b
  - MESAME_TARGET_BASE_URL=http://host.docker.internal:11434

  # Or use OpenAI
  # - MESAME_PROVIDER=openai
  # - MESAME_MODEL=gpt-4o
  # - OPENAI_API_KEY=sk-...
```

#### Server Settings

```yaml
environment:
  - MESAME_LLM_HOST=0.0.0.0       # Listen on all interfaces
  - MESAME_LLM_PORT=3001          # LLM server port
  - MESAME_WEB_HOST=0.0.0.0       # Web server host
  - MESAME_WEB_PORT=3000          # Web server port
  - MESAME_LOG_LEVEL=info         # Logging level
  - CORS_ORIGIN=*                 # Allowed origins
```

### Data Persistence

The SQLite database is stored in a Docker volume:

```bash
# Backup database
docker compose exec web cat /app/data/mesame.db > mesame-backup.db

# Restore database
docker compose cp mesame-backup.db web:/app/data/mesame.db
docker compose restart
```

## CDN Deployment

The frontend can be deployed to any static hosting service.

### Build for CDN

```bash
# Build with API URL
VITE_API_URL=https://api.mesame.com npm run build:web

# Output: dist/web/
# Deploy to Vercel, Netlify, Cloudflare Pages, etc.
```

### Backend CORS Configuration

Set the `CORS_ORIGIN` environment variable to your frontend URL:

```bash
CORS_ORIGIN=https://app.mesame.com
```

For multiple origins:

```bash
CORS_ORIGIN=https://app.mesame.com,https://admin.mesame.com
```

## Environment Variables

### LLM Server

| Variable | Default | Description |
|----------|---------|-------------|
| `MESAME_LLM_PORT` | `3001` | LLM server port |
| `MESAME_LLM_HOST` | `localhost` | LLM server host |
| `MESAME_PROVIDER` | `ollama` | LLM provider |
| `MESAME_MODEL` | `gemma3:1b` | Model name |
| `MESAME_TARGET_BASE_URL` | Provider default | Target API URL |
| `MESAME_LOG_LEVEL` | `info` | Logging level |

### Web Server

| Variable | Default | Description |
|----------|---------|-------------|
| `MESAME_WEB_PORT` | `3000` | Web server port |
| `MESAME_WEB_HOST` | `localhost` | Web server host |
| `MESAME_LLM_URL` | `http://localhost:3001` | LLM server URL |
| `CORS_ORIGIN` | `*` | Allowed CORS origins |

### API Keys

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `GOOGLE_API_KEY` | Google AI API key |

## Troubleshooting

### Docker Issues

**Error**: `Cannot connect to host.docker.internal`

**Solution**: For Linux, add `extra_hosts` to `docker-compose.yml`:

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

### Build Issues

**Error**: `Cannot find module`

**Solution**: Clean install:

```bash
rm -rf node_modules package-lock.json
npm install
npm run build:all
```