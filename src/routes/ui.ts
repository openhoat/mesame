import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fastifyStatic from '@fastify/static'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// The renderer files are in electron/renderer/ relative to project root
// From dist-electron/src/routes/ui.js, we go up 3 directories to reach project root
const rendererPath = path.join(__dirname, '../../../electron/renderer')
const assetsPath = path.join(__dirname, '../../../assets')

async function uiRoutes(fastify: FastifyInstance): Promise<void> {
  // Serve static assets (images, etc.)
  await fastify.register(fastifyStatic, {
    root: assetsPath,
    prefix: '/assets/',
  })

  // Serve index.html for root route
  fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    const indexPath = path.join(rendererPath, 'index.html')
    try {
      const html = fs.readFileSync(indexPath, 'utf-8')
      return reply.type('text/html').send(html)
    } catch {
      // Fallback: serve a simple status page if index.html not found
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
