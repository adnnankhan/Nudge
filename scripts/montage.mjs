// Contact sheet of screenshots: node scripts/montage.mjs <out.png> <cols> <width> <file>...
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
const [out, cols, width, ...files] = process.argv.slice(2)
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: (+width + 12) * +cols + 12, height: 800 } })
const cells = files
  .map((f) => `<figure style="margin:0;width:${width}px"><img src="data:image/png;base64,${readFileSync(f).toString('base64')}" style="width:${width}px;display:block;border-radius:10px"><figcaption style="font:11px monospace;color:#bbb;padding:4px 0 8px">${basename(f, '.png')}</figcaption></figure>`)
  .join('')
await p.setContent(`<body style="margin:0;padding:12px;background:#333;display:grid;grid-template-columns:repeat(${cols},${width}px);gap:12px">${cells}</body>`)
await p.waitForTimeout(300)
await p.screenshot({ path: out, fullPage: true })
await b.close()
