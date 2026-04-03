# Configuration

MeSame can be configured via environment variables or through the admin dashboard.

## Environment Variables

All MeSame-specific variables are prefixed with `MESAME_`.

### Server Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `MESAME_WEB_PORT` | `3000` | Web dashboard port |
| `MESAME_WEB_HOST` | `localhost` | Web server host (use `0.0.0.0` for Docker) |
| `MESAME_LLM_PORT` | `3001` | LLM proxy server port |
| `MESAME_LLM_HOST` | `localhost` | LLM server host (use `0.0.0.0` for Docker) |
| `MESAME_LLM_URL` | `http://localhost:3001` | LLM server URL (for web server to proxy) |
| `MESAME_LOG_LEVEL` | `info` | Log level (`debug`, `info`, `warn`, `error`, `silent`) |

### Provider Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `MESAME_PROVIDER` | `openai` | LLM provider (`openai`, `anthropic`, `google`, `ollama`) |
| `MESAME_MODEL` | Provider-specific | Model to use (e.g., `gpt-4o`, `claude-3-5-sonnet-20241022`) |
| `MESAME_TARGET_BASE_URL` | Provider-specific | Override default API base URL |

### API Keys

Standard environment variables (no `MESAME_` prefix):

| Variable | Provider | Get Key From |
|----------|----------|--------------|
| `OPENAI_API_KEY` | OpenAI | [platform.openai.com](https://platform.openai.com) |
| `ANTHROPIC_API_KEY` | Anthropic | [console.anthropic.com](https://console.anthropic.com) |
| `GOOGLE_API_KEY` | Google AI | [aistudio.google.com](https://aistudio.google.com) |

> For Ollama, no API key is needed — just ensure Ollama is running locally.

## Configuration File

Create a `.env` file in the project root:

```bash
# Server
MESAME_PORT=3000
MESAME_HOST=127.0.0.1
MESAME_LOG_LEVEL=info

# Provider
MESAME_PROVIDER=openai
MESAME_MODEL=gpt-4o

# API Key (set the one for your provider)
OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
# GOOGLE_API_KEY=...
```

See [`.env.example`](https://github.com/openhoat/mesame/blob/main/.env.example) for a full template.

## Provider-Specific Setup

### OpenAI

**Default Model**: `gpt-4o`

**Supported Models**:
- `gpt-4o` — Latest GPT-4 Omni
- `gpt-4o-mini` — Faster, cheaper GPT-4
- `gpt-4` — Legacy GPT-4
- `gpt-3.5-turbo` — GPT-3.5

**Configuration**:

```bash
export MESAME_PROVIDER=openai
export MESAME_MODEL=gpt-4o
export OPENAI_API_KEY=sk-...
```

**Custom Base URL** (e.g., Azure OpenAI):

```bash
export MESAME_TARGET_BASE_URL=https://your-azure-endpoint.openai.azure.com
```

### Anthropic (Claude)

**Default Model**: `claude-3-5-sonnet-20241022`

**Supported Models**:
- `claude-3-5-sonnet-20241022` — Latest Claude 3.5 Sonnet
- `claude-3-opus-20240229` — Claude 3 Opus
- `claude-3-haiku-20240307` — Claude 3 Haiku (fast, cheap)

**Configuration**:

```bash
export MESAME_PROVIDER=anthropic
export MESAME_MODEL=claude-3-5-sonnet-20241022
export ANTHROPIC_API_KEY=sk-ant-...
```

### Google AI (Gemini)

**Default Model**: `gemini-1.5-pro`

**Supported Models**:
- `gemini-1.5-pro` — Latest Gemini Pro
- `gemini-1.5-flash` — Faster, cheaper Gemini

**Configuration**:

```bash
export MESAME_PROVIDER=google
export MESAME_MODEL=gemini-1.5-pro
export GOOGLE_API_KEY=...
```

### Ollama (Local)

**Default Model**: `llama3.2:3b`

**Supported Models**: Any model available in Ollama

**Recommended Models**:

| Model | Size | RAM Required | Description |
|-------|------|--------------|-------------|
| `llama3.2:3b` | 3B | ~4 GB | Default - Fast, decent quality |
| `llama3.1:8b` | 8B | ~8 GB | Better quality, more RAM |
| `mistral:7b` | 7B | ~6 GB | Strong reasoning |
| `qwen2.5:3b` | 3B | ~4 GB | Lightweight alternative |

**Configuration**:

```bash
# Install Ollama from ollama.ai
ollama serve
ollama pull llama3.2:3b

# Configure MeSame
export MESAME_PROVIDER=ollama
export MESAME_MODEL=llama3.2:3b
```

**Custom Ollama URL** (remote server):

```bash
export MESAME_TARGET_BASE_URL=http://your-ollama-server:11434
```

**Docker with Ollama on host**:

When running MeSame in Docker and Ollama on the host machine, use `host.docker.internal`:

```bash
export MESAME_TARGET_BASE_URL=http://host.docker.internal:11434
```

And add to your `docker-compose.yml`:

```yaml
services:
  llm:
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

### Docker with Traefik

For production deployments with [Traefik](https://traefik.io/) as reverse proxy:

**Environment Variables:**

| Variable | Default | Description |
|----------|---------|-------------|
| `MESAME_WEB_VIRTUAL_HOST` | `mesame.localdomain` | Virtual host for web dashboard |
| `MESAME_LLM_VIRTUAL_HOST` | `mesame-llm.localdomain` | Virtual host for LLM API |

**Example `docker-compose.yml` with Traefik:**

```yaml
services:
  llm:
    image: mesame:latest
    expose: ["3001"]
    environment:
      - MESAME_LLM_HOST=0.0.0.0
      - MESAME_LLM_VIRTUAL_HOST=mesame-llm.example.com
    networks:
      - traefik_proxy
    labels:
      - traefik.enable=true
      - traefik.http.routers.mesame-llm.rule=Host(`mesame-llm.example.com`)
      - traefik.http.routers.mesame-llm.tls=true
      - traefik.http.routers.mesame-llm.tls.certresolver=letsencrypt

  web:
    image: mesame:latest
    expose: ["3000"]
    environment:
      - MESAME_WEB_HOST=0.0.0.0
      - MESAME_LLM_URL=http://llm:3001
      - MESAME_WEB_VIRTUAL_HOST=mesame.example.com
    depends_on:
      - llm
    networks:
      - traefik_proxy
    labels:
      - traefik.enable=true
      - traefik.http.routers.mesame-web.rule=Host(`mesame.example.com`)
      - traefik.http.routers.mesame-web.tls=true
      - traefik.http.routers.mesame-web.tls.certresolver=letsencrypt

networks:
  traefik_proxy:
    external: true
```

## Admin Dashboard Settings

You can also configure providers through the web UI:

1. Navigate to **Settings** page
2. Select **Provider** from dropdown
3. Enter **API Key** (if applicable)
4. Choose **Model**
5. Click **Save**

Settings are stored in the SQLite database and override environment variables.

## Database Configuration

MeSame uses SQLite with Prisma ORM.

**Database Location**: `prisma/dev.db` (local file)

### Initialize Database

```bash
npm run db:generate  # Generate Prisma client
npm run db:push      # Create/update schema
```

### Seed Sample Data

```bash
npm run db:seed
```

### Open Database Browser

```bash
npm run db:studio
```

## Logging

### Log Levels

| Level | Description |
|-------|-------------|
| `debug` | Verbose — all requests, responses, internal state |
| `info` | Standard — startup, proxy requests, errors |
| `warn` | Warnings only |
| `error` | Errors only |
| `silent` | No logs |

### Example: Debug Logging

```bash
export MESAME_LOG_LEVEL=debug
npm run dev
```

## Advanced Configuration

### Custom Style Profile

Instead of analyzing documents, you can manually create a style profile:

1. Go to **Admin → Style Profile**
2. Click "Create Custom Profile"
3. Enter your System Prompt manually
4. Save

### Anonymization Rules

To mask sensitive data before sending to LLM, configure regex-based replacement rules:

1. Go to **Settings → Anonymization**
2. Add rules (e.g., replace email addresses with `[EMAIL]`)
3. Enable anonymization

Example rules:

```json
[
  {
    "pattern": "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b",
    "replacement": "[EMAIL]"
  },
  {
    "pattern": "\\b\\d{3}-\\d{2}-\\d{4}\\b",
    "replacement": "[SSN]"
  }
]
```

> **Note**: Anonymization rules are currently planned for future releases.
