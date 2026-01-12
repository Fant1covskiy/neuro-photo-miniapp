import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  envPrefix: 'VITE_',
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('https://neuro-photo-backend-production.up.railway.app')
  },
  server: {
    port: 5174,
    host: true,
    allowedHosts: [
      '.ngrok-free.dev',
      '.ngrok.io',
      '.ngrok-free.app'
    ]
  }
})
