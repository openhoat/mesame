# MeSame Web Frontend

Standalone web frontend for MeSame, accessible via browser (desktop and mobile).

## Development

```bash
# Start dev server (requires backend running on port 3001)
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

This is a pure static web frontend that communicates with the backend via REST API:

- **No backend dependencies**: Uses standard fetch API for all communication
- **Responsive design**: Optimized for desktop and mobile browsers
- **CDN-ready**: Can be deployed to any static hosting (Cloudflare Pages, Vercel, Netlify, etc.)
- **Configurable API URL**: Set `VITE_API_URL` environment variable for CDN deployment

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL (for CDN deployment) | Empty (uses Vite proxy in dev) |

## Development vs Production

### Development (with Vite proxy)

In development, Vite proxies API requests to the backend:

```bash
# No VITE_API_URL needed - uses Vite proxy
npm run dev:web
```

### Production (CDN deployment)

Build with the backend API URL:

```bash
VITE_API_URL=https://api.mesame.com npm run build:web
```

The built files in `dist/web/` can then be deployed to any static hosting.

## Production Deployment with Backend

The built files in `dist/web/` are also served by the Fastify backend on the root route (`/`). This allows running everything in a single container.
