import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  root: 'portal',
  resolve: {
    alias: { '@': resolve(__dirname, 'portal/src') }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  }
})
