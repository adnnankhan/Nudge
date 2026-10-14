// Screenshot a long page in slices: node scripts/shoot-slices.mjs <hashRoute> <outDir> [width] [sliceH] [dpr]
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
const [route, out, width = '900', sliceH = '1500', dpr = '1'] = process.argv.slice(2)
mkdirSync(out, { recursive: true })
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: +width, height: +sliceH }, deviceScaleFactor: +dpr })
await p.goto('http://localhost:4173/Nudge/app/' + route, { waitUntil: 'networkidle' })
await p.evaluate(() => document.fonts.ready)
await p.waitForSelector('main'); await p.waitForTimeout(800)
const h = await p.evaluate(() => document.documentElement.scrollHeight)
let i = 0
for (let y = 0; y < h; y += +sliceH) {
  await p.screenshot({ path: `${out}/slice-${String(i).padStart(2, '0')}.png`, fullPage: true, clip: { x: 0, y, width: +width, height: Math.min(+sliceH, h - y) } })
  i++
}
console.log(`${i} slices, page height ${h}`)
await b.close()
