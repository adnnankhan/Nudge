import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const BASE = '/Nudge/app/'

// Served from https://adnnankhan.github.io/Nudge/app/ (docs/tech.md).
export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    // Installable + offline (tech.md): app shell, fonts and brand SVGs are precached, so the
    // second open is instant and works without a connection.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script-defer',
      includeAssets: ['brand/*.svg', 'brand/*.png', 'icons/*.png'],
      manifest: {
        id: BASE,
        name: 'Nudge',
        short_name: 'Nudge',
        description: 'Approve and answer your coding agents from anywhere.',
        lang: 'en',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0E0F12',
        background_color: '#0E0F12',
        categories: ['developer', 'productivity'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'brand/app-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        // woff2 only: every browser that can install the app reads woff2.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Hidden developer pages (/dev/…) aren't part of the app people install.
        globIgnores: ['**/assets/{Components,RefScreens,Tokens,State}-*'],
        navigateFallback: `${BASE}index.html`,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
  // Lightning CSS handles CSS Modules (incl. composes across files) without PostCSS.
  css: { transformer: 'lightningcss' },
  build: {
    outDir: 'site/app',
    emptyOutDir: true,
    target: 'es2020',
    assetsInlineLimit: 0,
    // One stylesheet: shared components otherwise get their own small CSS files, each one more
    // render-blocking request before the first paint on a slow phone.
    cssCodeSplit: false,
  },
})
