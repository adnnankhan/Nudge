import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from https://adnnankhan.github.io/Nudge/app/ (docs/tech.md).
export default defineConfig({
  base: '/Nudge/app/',
  plugins: [react()],
  build: {
    outDir: 'site/app',
    emptyOutDir: true,
    target: 'es2020',
    assetsInlineLimit: 0,
  },
})
