import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const webRoot = new URL('.', import.meta.url).pathname

export default defineConfig({
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
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
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
      '/v1': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
})
