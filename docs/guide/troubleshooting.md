# Troubleshooting

Common issues and solutions when using MeSame.

## Installation Issues

### Node.js Version Error

**Error**: `The engine "node" is incompatible with this module`

**Solution**: MeSame requires Node.js 22+. Upgrade your Node version:

```bash
# Using nvm
nvm install 22
nvm use 22

# Verify version
node --version  # Should be v22.x.x or higher
```

### npm Install Fails

**Error**: `EACCES: permission denied`

**Solution**: Do not use `sudo` with npm. Fix permissions:

```bash
# Fix npm permissions (Linux/macOS)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

## Database Issues

### Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`

**Solution**: Generate Prisma client:

```bash
npm run db:generate
```

### Database Schema Out of Sync

**Error**: `Table 'X' does not exist`

**Solution**: Push schema to database:

```bash
npm run db:push
```

### Database Locked

**Error**: `SQLITE_BUSY: database is locked`

**Solution**: Close all connections:

```bash
# Stop the server
pkill -f mesame

# Remove lock file
rm prisma/dev.db-journal

# Restart
npm run dev
```

## Provider Issues

### OpenAI API Key Invalid

**Error**: `401 Unauthorized`

**Solution**: Verify API key:

```bash
# Check key is set
echo $OPENAI_API_KEY

# Test key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Anthropic API Error

**Error**: `403 Forbidden`

**Solution**: Ensure you have Claude API access and valid key:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
export MESAME_PROVIDER=anthropic
export MESAME_MODEL=claude-3-5-sonnet-20241022
```

### Ollama Connection Refused

**Error**: `ECONNREFUSED 127.0.0.1:11434`

**Solution**: Start Ollama server:

```bash
# Start Ollama
ollama serve

# In another terminal, verify it's running
curl http://localhost:11434/api/tags
```

### Google AI API Error

**Error**: `Invalid API key`

**Solution**: Get a valid key from [Google AI Studio](https://aistudio.google.com):

```bash
export GOOGLE_API_KEY=...
export MESAME_PROVIDER=google
export MESAME_MODEL=gemini-1.5-pro
```

## Proxy Issues

### Proxy Returns 404

**Error**: `404 - Not Found` when calling `/v1/chat/completions`

**Solution**: Ensure server is running:

```bash
# Check server is running
curl http://localhost:3000/health

# Verify endpoint exists
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"test"}]}'
```

### Proxy Returns 500

**Error**: `500 - Internal Server Error`

**Solution**: Check server logs for details:

```bash
# Run with debug logging
export MESAME_LOG_LEVEL=debug
npm run dev
```

### Style Profile Not Injected

**Issue**: Responses don't match your style

**Solution**: Verify style profile exists:

```bash
# Check database
npm run db:studio
# Navigate to StyleProfile table and verify systemPrompt is populated
```

Or via API:

```bash
curl http://localhost:3000/api/style-profile
```

## Frontend Issues

### Electron App Won't Start

**Error**: `Error: Cannot find module 'electron'`

**Solution**: Rebuild Electron:

```bash
rm -rf node_modules package-lock.json
npm install
npm run build:all
npm run dev:electron
```

### UI Not Loading

**Error**: Blank screen or `Failed to load resource`

**Solution**: Rebuild renderer:

```bash
npm run build:renderer
npm run dev:electron
```

### Chat Streaming Not Working

**Issue**: Chat responses appear all at once instead of streaming

**Solution**: Ensure SSE is working:

1. Open browser DevTools → Network tab
2. Send a chat message
3. Look for `chat/completions` request with type `eventsource`

If not SSE, check server logs for errors.

## Build Issues

### TypeScript Compilation Error

**Error**: `TS2307: Cannot find module 'X'`

**Solution**: Regenerate types:

```bash
npm run db:generate  # For Prisma types
npm run typecheck    # Verify no errors
```

### Electron Build Fails

**Error**: `Application entry file "dist/electron/main.js" does not exist`

**Solution**: Build Electron main process:

```bash
npm run build:electron
```

### Vite Build Error

**Error**: `Could not resolve 'X'`

**Solution**: Check Vite config and rebuild:

```bash
npm run build:renderer
```

## Performance Issues

### Slow Style Analysis

**Issue**: Analyzing large documents takes too long

**Solution**: Split large documents into smaller chunks or use faster models (Ollama with smaller models).

### High Memory Usage

**Issue**: MeSame uses excessive RAM

**Solution**:
- Use smaller Ollama models (`llama3.2:3b` instead of `llama3.1:8b`)
- Reduce number of uploaded source documents
- Restart the app periodically

### Slow LLM Responses

**Issue**: Responses are very slow

**Solution**:
- **OpenAI/Anthropic**: Check network connection
- **Ollama**: Switch to a smaller model (`3b` instead of `8b`)
- **Google**: Gemini Flash is faster than Pro

## E2E Test Issues

### Playwright Tests Fail

**Error**: `browserType.launch: Executable doesn't exist`

**Solution**: Install Playwright browsers:

```bash
npx playwright install
```

### Headless Tests Hang

**Issue**: E2E tests never complete

**Solution**: Run with visible browser for debugging:

```bash
npm run test:e2e:ui
```

Or check for network issues (slow LLM responses).

## Logging

Enable debug logging to troubleshoot issues:

```bash
export MESAME_LOG_LEVEL=debug
npm run dev
```

Check logs for:
- Request/response payloads
- Database queries
- LLM provider errors
- Style injection details

## Getting Help

If your issue isn't listed here:

1. Check [GitHub Issues](https://github.com/openhoat/mesame/issues) for similar problems
2. Enable debug logging (`MESAME_LOG_LEVEL=debug`) and capture output
3. Create a new issue with:
   - MeSame version
   - Node.js version (`node --version`)
   - OS and version
   - Full error message
   - Steps to reproduce
