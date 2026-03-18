import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fastifyStatic from '@fastify/static'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Try to find the correct paths by checking if directories exist
// In dev (tsx): __dirname = /project/src/routes/
// In prod (electron): __dirname = /project/dist-electron/src/routes/
function findProjectPaths(): { rendererPath: string; assetsPath: string } {
  // Try development paths first (from src/routes/)
  const devRendererDist = path.join(__dirname, '../../electron/renderer/dist')
  const devRendererFallback = path.join(__dirname, '../../electron/renderer')
  const devAssetsPath = path.join(__dirname, '../../assets')

  if (fs.existsSync(devAssetsPath)) {
    const rendererPath = fs.existsSync(devRendererDist) ? devRendererDist : devRendererFallback
    return { rendererPath, assetsPath: devAssetsPath }
  }

  // Fall back to production paths (from dist-electron/src/routes/)
  const prodRendererDist = path.join(__dirname, '../../../electron/renderer/dist')
  const prodRendererFallback = path.join(__dirname, '../../../electron/renderer')
  const prodAssetsPath = path.join(__dirname, '../../../assets')

  const rendererPath = fs.existsSync(prodRendererDist) ? prodRendererDist : prodRendererFallback
  return { rendererPath, assetsPath: prodAssetsPath }
}

const { rendererPath, assetsPath } = findProjectPaths()

async function uiRoutes(fastify: FastifyInstance): Promise<void> {
  // Serve app images from /assets/ (e.g., MeSame_icon.png)
  if (fs.existsSync(assetsPath)) {
    await fastify.register(fastifyStatic, {
      root: assetsPath,
      prefix: '/assets/',
    })
  }

  // Serve Vite-built JS/CSS bundles from renderer dist
  const rendererDistPath = path.join(rendererPath, 'assets')
  if (fs.existsSync(rendererDistPath)) {
    await fastify.register(fastifyStatic, {
      root: rendererDistPath,
      prefix: '/renderer-assets/',
      decorateReply: false,
    })
  }

  // Serve index.html for root route
  fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    const indexPath = path.join(rendererPath, 'index.html')
    try {
      let html = fs.readFileSync(indexPath, 'utf-8')
      // Rewrite Vite asset paths from ./assets/ to /renderer-assets/
      html = html.replaceAll('./assets/', '/renderer-assets/')
      return reply.type('text/html').send(html)
    } catch {
      return reply.type('text/html').send(`
        <!DOCTYPE html>
        <html>
        <head><title>MeSame</title></head>
        <body style="font-family: sans-serif; background: #1a1a2e; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
          <div style="text-align: center;">
            <h1>MeSame</h1>
            <p>Server running at <a href="http://localhost:3000/health" style="color: #667eea;">/health</a></p>
            <p style="color: #94a3b8; font-size: 0.9rem;">Renderer not found at: ${rendererPath}</p>
          </div>
        </body>
        </html>
      `)
    }
  })
}

export { uiRoutes }
