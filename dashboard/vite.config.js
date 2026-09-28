import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Neuroshield-2026/',
  server: {
    port: 3000,
    open: false,
    host: true,
  },
  build: {
    outDir: 'dist',
  },
})