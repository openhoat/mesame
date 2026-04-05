# Backup and Restore

MeSame stores all its data in a single SQLite database file, making backups straightforward. This guide covers backup strategies for both local and Docker deployments.

## Database Location

| Deployment | Default Path | Configuration |
|------------|-------------|---------------|
| Local (dev) | `./data/mesame.db` | `DATABASE_URL` in `.env` |
| Docker | `/app/data/mesame.db` | Mounted via `mesame-data` volume |

The `DATABASE_URL` environment variable controls the database path. Default value: `file:./data/mesame.db`.

## What Gets Backed Up

The SQLite database contains all application data:

| Table | Content |
|-------|---------|
| `Source` | Imported documents (PDF, Markdown, text) |
| `StyleProfile` | Writing style profiles and persona prompts |
| `Provider` | LLM provider configurations and API keys |
| `Conversation` | Chat history and messages |
| `UserSettings` | Application preferences |

> **Important**: API keys stored in the `Provider` table are included in backups. Treat backup files as sensitive data.

## Backup Methods

### Method 1: File Copy (Recommended for Simple Setups)

The simplest approach: copy the database file while the application is stopped.

```bash
# Stop MeSame first to avoid corruption
# Then copy the database file
cp ./data/mesame.db ./data/mesame-backup-$(date +%Y%m%d-%H%M%S).db
```

> **Warning**: Copying the file while MeSame is running may produce a corrupted backup if a write is in progress. Always stop the application first, or use the SQLite `.backup` method below.

### Method 2: SQLite `.backup` Command (Safe While Running)

SQLite's built-in backup command is safe to run while the application is active.

```bash
sqlite3 ./data/mesame.db ".backup ./data/mesame-backup-$(date +%Y%m%d-%H%M%S).db"
```

This creates a consistent snapshot without requiring downtime.

### Method 3: Docker Volume Backup

For Docker deployments, back up the named volume:

```bash
# Create a backup from the Docker volume
docker run --rm \
  -v mesame-data:/data \
  -v $(pwd)/backups:/backup \
  alpine \
  cp /data/mesame.db /backup/mesame-backup-$(date +%Y%m%d-%H%M%S).db
```

Or use `sqlite3` inside the container for a safe hot backup:

```bash
docker exec mesame-web sqlite3 /app/data/mesame.db \
  ".backup /app/data/mesame-backup.db"

# Copy the backup out of the container
docker cp mesame-web:/app/data/mesame-backup.db ./backups/
```

### Method 4: API Export (Application-Level)

MeSame provides API endpoints to export specific data as JSON:

```bash
# Export style profiles
curl -s http://localhost:3000/api/style-profile/export | jq . > profiles-backup.json

# Export conversations
curl -s http://localhost:3000/v1/conversations/export | jq . > conversations-backup.json
```

This method is useful for selective backups or migrating specific data, but does not cover all tables (providers, settings, sources).

## Restore Methods

### Restore from File Backup

```bash
# Stop MeSame
# Replace the database file
cp ./data/mesame-backup-20260405-120000.db ./data/mesame.db

# Restart MeSame
```

### Restore in Docker

```bash
# Stop the containers
docker compose down

# Copy backup into the volume
docker run --rm \
  -v mesame-data:/data \
  -v $(pwd)/backups:/backup \
  alpine \
  cp /backup/mesame-backup-20260405-120000.db /data/mesame.db

# Restart
docker compose up -d
```

### Restore After Schema Changes

If the backup was created with an older version of MeSame, run migrations after restoring:

```bash
# Restore the backup file first, then:
npm run db:push
```

This applies any new schema changes without losing data.

## Automated Backups

### Cron Job (Linux/macOS)

Create a daily backup with automatic cleanup of old files:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2:00 AM, keep last 7 days
0 2 * * * sqlite3 /path/to/data/mesame.db ".backup /path/to/backups/mesame-$(date +\%Y\%m\%d).db" && find /path/to/backups -name "mesame-*.db" -mtime +7 -delete
```

### Docker Cron Backup

Add a backup service to your `docker-compose.yml`:

```yaml
services:
  backup:
    image: alpine
    volumes:
      - mesame-data:/data
      - ./backups:/backup
    entrypoint: /bin/sh
    command: >
      -c "while true; do
        cp /data/mesame.db /backup/mesame-$$(date +%Y%m%d-%H%M%S).db;
        find /backup -name 'mesame-*.db' -mtime +7 -delete;
        sleep 86400;
      done"
    restart: unless-stopped
```

## Verification

Always verify backups after creation:

```bash
# Check database integrity
sqlite3 ./backups/mesame-backup-20260405-120000.db "PRAGMA integrity_check;"
# Expected output: ok

# Check table contents
sqlite3 ./backups/mesame-backup-20260405-120000.db ".tables"
# Expected: Conversation  ProfileSource  Provider  Source  StyleProfile  UserSettings
```

## Best Practices

1. **Stop the application** before file-copy backups, or use `sqlite3 .backup` for hot backups
2. **Store backups offsite** — keep copies on a different machine or cloud storage
3. **Encrypt sensitive backups** — the database may contain API keys
4. **Test restores regularly** — a backup is only useful if you can restore from it
5. **Automate** — set up scheduled backups to avoid data loss
6. **Version your backups** — include timestamps in filenames for easy identification
