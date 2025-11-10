import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    watch: {
      usePolling: true
    },
    proxy: {
      '/api': {
        target: process.env.DOCKER_ENV === 'true' ? 'http://backend:3002' : 'http://localhost:3002',
        changeOrigin: true
      },
      '/uploads': {
        target: process.env.DOCKER_ENV === 'true' ? 'http://backend:3002' : 'http://localhost:3002',
        changeOrigin: true
      }
    }
  }
})

