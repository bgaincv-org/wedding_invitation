
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },

  server: {
    host: '127.0.0.1',
    port: 3010,
    strictPort: true,
  },

  preview: {
    port: 3010,
    strictPort: true,
  },

  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 650,
  },
})
