# MeSame Web Frontend

Standalone web frontend for MeSame, accessible via browser (desktop and mobile).

## Development

```bash
# Start dev server (requires backend running on port 3000)
npm run dev:web
```

Visit http://localhost:5173

## Build

```bash
# Build for production
npm run build:web
```

Output: `dist/web/`

## Architecture

This frontend is extracted from the Electron renderer and adapted for standalone web deployment:

- **No Electron dependencies**: Uses standard fetch API instead of IPC
- **Responsive design**: Optimized for desktop and mobile browsers
- **Same UI components**: Reuses all React components from Electron renderer
- **Backend proxy**: Vite dev server proxies API requests to backend (port 3000)

## Production Deployment

The built files in `dist/web/` are automatically served by the Fastify backend on the root route (`/`).

Configuration priority:
1. Web build (`dist/web/`) - highest priority
2. Electron renderer (`dist/renderer/`) - fallback

## Differences from Electron Renderer

- Removed `electron.d.ts` (Electron API types)
- Uses HTTP fetch for config instead of IPC when `window.electronAPI` is not available
- Vite base set to `/` instead of `./` for web routing
