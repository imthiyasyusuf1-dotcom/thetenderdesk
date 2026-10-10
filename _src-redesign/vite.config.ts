import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/preview/',
  plugins: [react()],
  build: { outDir: '../preview', emptyOutDir: true, assetsInlineLimit: 0 },
})
