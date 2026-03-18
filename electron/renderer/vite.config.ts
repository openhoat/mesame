import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const rendererRoot = new URL('.', import.meta.url).pathname

export default defineConfig({
  root: rendererRoot,
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/v1': 'http://localhost:3000',
      '/health': 'http://localhost:3000',
      '/assets': 'http://localhost:3000',
    },
  },
})
