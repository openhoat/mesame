import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fastifyStatic from '@fastify/static'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Try to find the correct paths by checking if directories exist
// Tests all possible path combinations and uses the first valid one
function findProjectPaths(): { rendererPath: string; assetsPath: string } {
  // Define all possible path combinations to try, in priority order
  const pathConfigurations = [
    // Priority 1: Web build from src/routes/ (dev with tsx)
    {
      renderer: path.join(__dirname, '../../dist/web'),
      assets: path.join(__dirname, '../../assets'),
    },
    // Priority 2: Web build from dist/server/routes/ (server-only build)
    {
      renderer: path.join(__dirname, '../../web'),
      assets: path.join(__dirname, '../../../assets'),
    },
    // Priority 3: Electron renderer from src/routes/ (dev with tsx, backward compat)
    {
      renderer: path.join(__dirname, '../../dist/renderer'),
      assets: path.join(__dirname, '../../assets'),
    },
    // Priority 4: Electron renderer from dist/electron/src/routes/ (Electron build)
    {
      renderer: path.join(__dirname, '../../../renderer'),
      assets: path.join(__dirname, '../../../../assets'),
    },
    // Priority 5: Electron renderer from dist/server/routes/ (server-only build)
    {
      renderer: path.join(__dirname, '../../renderer'),
      assets: path.join(__dirname, '../../../assets'),
    },
    // Fallback: Old structure source directory
    {
      renderer: path.join(__dirname, '../../electron/renderer'),
      assets: path.join(__dirname, '../../assets'),
    },
  ]

  // Try each configuration and return the first one where renderer has index.html
  for (const config of pathConfigurations) {
    const indexPath = path.join(config.renderer, 'index.html')
    if (fs.existsSync(indexPath)) {
      return { rendererPath: config.renderer, assetsPath: config.assets }
    }
  }

  // If nothing found, return the first config as fallback (will show error message in UI)
  const fallback = pathConfigurations[0]
  if (!fallback) {
    throw new Error('No valid renderer path configuration found')
  }
  return {
    rendererPath: fallback.renderer,
    assetsPath: fallback.assets,
  }
}

const { rendererPath, assetsPath } = findProjectPaths()

async function uiRoutes(fastify: FastifyInstance): Promise<void> {
  // Serve app images (e.g., MeSame_icon.png)
  if (fs.existsSync(assetsPath)) {
    await fastify.register(fastifyStatic, {
      root: assetsPath,
      prefix: '/app-images/',
      decorateReply: false,
    })
  }

  // Serve Vite-built JS/CSS bundles
  const rendererDistPath = path.join(rendererPath, 'assets')
  if (fs.existsSync(rendererDistPath)) {
    await fastify.register(fastifyStatic, {
      root: rendererDistPath,
      prefix: '/assets/',
      decorateReply: false,
    })
  }

  // Serve index.html for root route and client-side routes
  const serveIndexHtml = async (_request: FastifyRequest, reply: FastifyReply) => {
    const indexPath = path.join(rendererPath, 'index.html')
    try {
      const html = fs.readFileSync(indexPath, 'utf-8')
      return reply.type('text/html').send(html)
    } catch {
      return reply.type('text/html').send(`
        <!DOCTYPE html>
        <html>
        <head><title>MeSame</title></head>
        <body style="font-family: sans-serif; background: #1a1a2e; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
          <div style="text-align: center;">
            <h1>MeSame</h1>
            <p>Server running at <a href="http://localhost:3001/health" style="color: #667eea;">/health</a></p>
            <p style="color: #94a3b8; font-size: 0.9rem;">Renderer not found at: ${rendererPath}</p>
          </div>
        </body>
        </html>
      `)
    }
  }

  // Root route
  fastify.get('/', serveIndexHtml)

  // Client-side routes (chat, dashboard, etc.)
  fastify.get('/chat', serveIndexHtml)
  fastify.get('/chat/:id', serveIndexHtml)
  fastify.get('/dashboard', serveIndexHtml)
  fastify.get('/dashboard/*', serveIndexHtml)

  // Serve favicon.ico
  fastify.get('/favicon.ico', async (_request: FastifyRequest, reply: FastifyReply) => {
    const faviconPath = path.join(rendererPath, 'favicon.ico')
    try {
      const favicon = fs.readFileSync(faviconPath)
      return reply.type('image/x-icon').send(favicon)
    } catch {
      // Favicon doesn't exist, return 204 No Content
      return reply.code(204).send()
    }
  })
}

export { uiRoutes }
