# MeSame Docker Deployment

Deploy MeSame as a web application using Docker Compose.

## Quick Start

```bash
# Start MeSame
docker compose up -d

# View logs
docker compose logs -f

# Stop MeSame
docker compose down
```

Visit http://localhost:3000

## Configuration

Edit `docker-compose.yml` to configure environment variables:

### LLM Provider

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

  # Or use Anthropic Claude
  # - MESAME_PROVIDER=anthropic
  # - MESAME_MODEL=claude-3-5-sonnet-20241022
  # - ANTHROPIC_API_KEY=sk-ant-...
```

### Server Settings

```yaml
environment:
  - MESAME_HOST=0.0.0.0         # Listen on all interfaces
  - MESAME_PORT=3000            # Port to bind
  - MESAME_LOG_LEVEL=info       # Logging level (debug, info, warn, error)
  - MESAME_LANGUAGE=en          # UI language (en, fr, es, de, etc.)
```

## Data Persistence

The SQLite database is stored in a Docker volume:

```bash
# List volumes
docker volume ls

# Backup database
docker compose exec mesame cat /app/data/mesame.db > mesame-backup.db

# Restore database
docker compose cp mesame-backup.db mesame:/app/data/mesame.db
docker compose restart
```

## Using with Traefik

Example labels for Traefik reverse proxy:

```yaml
services:
  mesame:
    # ... existing config ...
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.mesame.rule=Host(`mesame.example.com`)"
      - "traefik.http.routers.mesame.entrypoints=websecure"
      - "traefik.http.routers.mesame.tls.certresolver=letsencrypt"
      - "traefik.http.services.mesame.loadbalancer.server.port=3000"
```

## Building Custom Image

```bash
# Build image
docker compose build

# Tag and push to registry
docker tag mesame:latest your-registry.com/mesame:latest
docker push your-registry.com/mesame:latest
```

## Troubleshooting

### Check container logs

```bash
docker compose logs mesame
```

### Access container shell

```bash
docker compose exec mesame sh
```

### Verify database

```bash
docker compose exec mesame ls -lh /app/data/
```

### Health check

```bash
curl http://localhost:3000/health
```

## Architecture

```
Docker Container (mesame)
├── Backend (Node.js + Fastify)
├── Frontend (Static files from dist/web/)
├── SQLite Database (/app/data/mesame.db)
└── Volume (mesame-data)
```

## Security Notes

- Change default port in production
- Use HTTPS with reverse proxy (nginx, Traefik, Caddy)
- Set strong API keys via environment variables
- Keep SQLite volume backed up
- Run container as non-root (TODO: add USER in Dockerfile)

## Performance

- Single container deployment
- No external database server needed
- SQLite in-memory for tests
- File-based SQLite for production
- Handles 100s of concurrent users easily
