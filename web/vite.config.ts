import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const webRoot = new URL('.', import.meta.url).pathname

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  const llmPort = Number(env.MESAME_LLM_PORT) || 3001
  const webPort = Number(env.MESAME_WEB_PORT) || 3000
  const devPort = Number(env.MESAME_DEV_PORT) || 5173

  return {
    root: webRoot,
    base: '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
    build: {
      outDir: '../dist/web',
      emptyOutDir: true,
      sourcemap: true,
    },
    server: {
      port: devPort,
      proxy: {
        '/api': {
          target: `http://127.0.0.1:${webPort}`,
          changeOrigin: true,
          ws: true,
          timeout: 120000, // 2 minutes for LLM processing
          proxyTimeout: 120000,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              // Silence connection refused errors during startup
              if ((err as any).code !== 'ECONNREFUSED') {
                console.error('proxy error', err)
              }
            })
          },
        },
        '/v1/conversations': {
          target: `http://127.0.0.1:${webPort}`,
          changeOrigin: true,
        },
        '/v1': {
          target: `http://127.0.0.1:${llmPort}`,
          changeOrigin: true,
        },
        '/health': {
          target: `http://127.0.0.1:${webPort}`,
          changeOrigin: true,
        },
      },
    },
  }
})
