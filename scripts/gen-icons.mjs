// Exports the PWA / home-screen icons from public/brand (tech.md): 192, 512, maskable 512, apple-touch 180.
// Run once with `node scripts/gen-icons.mjs`; the PNGs are committed.
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
const svg = (f) => 'data:image/svg+xml;base64,' + readFileSync(`public/brand/${f}`).toString('base64')
const jobs = [
  ['app-icon.svg', 192, 'icon-192.png', false],
  ['app-icon.svg', 512, 'icon-512.png', false],
  ['app-icon-maskable.svg', 512, 'icon-maskable-512.png', false],
  // iOS adds its own rounded corners and doesn't do transparency: use the full-bleed square.
  ['app-icon-maskable.svg', 180, 'apple-touch-icon.png', false],
  ['app-icon.svg', 32, 'favicon-32.png', true],
]
const b = await chromium.launch()
for (const [src, size, out, transparent] of jobs) {
  const p = await b.newPage({ viewport: { width: size, height: size } })
  await p.setContent(`<body style="margin:0;background:transparent"><img src="${svg(src)}" width="${size}" height="${size}" style="display:block"></body>`)
  await p.waitForTimeout(100)
  await p.screenshot({ path: `public/icons/${out}`, omitBackground: transparent || src === 'app-icon.svg' })
  await p.close()
}
await b.close()
console.log('icons written')
