// Share image (1200×630) made from the case study's hero: the headline and the two phones,
// in the page's own tokens and fonts. Also the Apple touch icon from the Nudge mark.
//   node scripts/case-og.mjs    → case-study/public/og.png, case-study/public/apple-touch-icon.png
import { chromium } from 'playwright'
import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const url = (p) => pathToFileURL(resolve(p)).href
const font = (pkg, w) => url(`node_modules/@fontsource/${pkg}/files/${pkg}-latin-${w}-normal.woff2`)

const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Plex;font-weight:400;src:url(${font('ibm-plex-sans', 400)})}
@font-face{font-family:Plex;font-weight:600;src:url(${font('ibm-plex-sans', 600)})}
@font-face{font-family:PlexMono;font-weight:400;src:url(${font('ibm-plex-mono', 400)})}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;background:#0e0f12;color:#b4b4b9;font-family:Plex;position:relative}
.copy{position:absolute;left:72px;top:0;bottom:0;width:600px;display:flex;flex-direction:column;justify-content:center;gap:28px}
.brand{display:flex;align-items:center;gap:12px;color:#f5f5f7;font-weight:600;font-size:28px}
.brand svg{width:34px;height:34px}
h1{color:#f5f5f7;font-weight:600;font-size:66px;line-height:1.03;letter-spacing:-2px}
.label{font:400 18px/1 PlexMono;letter-spacing:.06em;text-transform:uppercase;color:#a1a1a6}
.phone{position:absolute;border-radius:36px;overflow:hidden;box-shadow:0 0 0 7px #1a1b1f,0 0 0 8px #2a2b2f,0 30px 60px rgba(0,0,0,.5)}
.phone img{display:block;width:100%}
.back{width:270px;left:700px;top:96px;transform:rotate(-4deg)}
.front{width:290px;left:870px;top:52px}
</style>
<div class="copy">
  <div class="brand"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" stroke-width="7" stroke-dasharray="180 33.6" transform="rotate(112 50 50)" stroke-linecap="round"/><circle cx="50" cy="50" r="21" fill="none" stroke="currentColor" stroke-width="7"/><circle cx="50" cy="50" r="9" fill="currentColor"/></svg>Nudge</div>
  <h1>Never miss what your coding agent needs.</h1>
  <p class="label">Case study · 2026</p>
</div>
<div class="phone back"><img src="${url('case-study/assets/final-chat-approval.png')}"></div>
<div class="phone front"><img src="${url('case-study/assets/final-home.png')}"></div>`

mkdirSync('.shots', { recursive: true })
writeFileSync('.shots/og.html', html)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.goto(url('.shots/og.html'))
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(300)
const png = await page.screenshot()
await browser.close()
await sharp(png).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile('case-study/public/og.png')

await sharp('public/brand/app-icon.svg', { density: 400 }).resize(180, 180).png().toFile('case-study/public/apple-touch-icon.png')
console.log('og.png + apple-touch-icon.png written')
