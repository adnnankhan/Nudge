import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from https://adnnankhan.github.io/Nudge/app/ (docs/tech.md).
export default defineConfig({
  base: '/Nudge/app/',
  plugins: [react()],
  // Lightning CSS handles CSS Modules (incl. composes across files) without PostCSS.
  css: { transformer: 'lightningcss' },
  build: {
    outDir: 'site/app',
    emptyOutDir: true,
    target: 'es2020',
    assetsInlineLimit: 0,
  },
})
