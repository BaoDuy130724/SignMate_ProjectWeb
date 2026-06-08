import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // Proxy API requests to .NET Backend (SignMate_BE)
    proxy: {
      '/api': {
        target: 'http://localhost:5184',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
