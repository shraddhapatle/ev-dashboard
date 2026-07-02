import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Sajag Tactical Command — Vite config
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    // Proxy /api/* → the Express backend so the frontend never touches CORS.
    // The backend must be running on :5000 (npm run dev inside backend/).
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
