import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `vite build` -> /preview/ (noindex). `vite build --mode live` -> site root, staged in ../_live then copied by pages.mjs
export default defineConfig(({ mode }) => {
  const live = mode === 'live'
  return {
    base: live ? '/' : '/preview/',
    plugins: [react()],
    build: { outDir: live ? '../_live' : '../preview', emptyOutDir: true, assetsInlineLimit: 0, assetsDir: live ? 'assets/r' : 'assets', chunkSizeWarningLimit: 800 },
  }
})
