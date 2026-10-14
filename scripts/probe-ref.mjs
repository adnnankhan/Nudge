// Measuring aid for matching docs/reference/dark: text extents and edge profiles, in 390-pt units.
// Usage: node scripts/probe-ref.mjs <spec.json>
// spec: { texts: [{img, y0, y1, x0, x1, text, family, weight}], lines: [{img, axis:'x'|'y', at, from, to}] }
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'

const spec = JSON.parse(readFileSync(process.argv[2], 'utf8'))
const S = 1290 / 844
const font = (f) => 'data:font/woff2;base64,' + readFileSync(`node_modules/@fontsource/${f}`).toString('base64')
const b = await chromium.launch()
const p = await b.newPage()
await p.setContent('<canvas id=c></canvas>')
await p.evaluate(async (fonts) => {
  for (const [fam, w, src] of fonts) {
    const ff = new FontFace(fam, `url(${src})`, { weight: String(w) })
    await ff.load(); document.fonts.add(ff)
  }
}, [
  ['IBM Plex Sans', 400, font('ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2')],
  ['IBM Plex Sans', 500, font('ibm-plex-sans/files/ibm-plex-sans-latin-500-normal.woff2')],
  ['IBM Plex Sans', 600, font('ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2')],
  ['IBM Plex Mono', 400, font('ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2')],
])
const imgs = {}
for (const n of new Set([...(spec.texts ?? []), ...(spec.lines ?? [])].map((t) => t.img)))
  imgs[n] = 'data:image/jpeg;base64,' + readFileSync(`docs/reference/dark/${n}.jpg`).toString('base64')

const res = await p.evaluate(async ({ spec, imgs, S }) => {
  const data = {}
  for (const [n, src] of Object.entries(imgs)) {
    const i = new Image(); i.src = src; await i.decode()
    const c = document.createElement('canvas'); c.width = i.width; c.height = i.height
    const x = c.getContext('2d'); x.drawImage(i, 0, 0)
    data[n] = { w: i.width, d: x.getImageData(0, 0, i.width, i.height).data }
  }
  const lum = (n, X, Y) => { const { w, d } = data[n]; const k = (Y * w + X) * 4; return 0.2126 * d[k] + 0.7152 * d[k + 1] + 0.0722 * d[k + 2] }
  const ctx = document.createElement('canvas').getContext('2d')
  const out = { texts: [], lines: [] }
  for (const t of spec.texts ?? []) {
    // background = median luminance in the band; text = pixels that differ by > 45
    const vals = []
    for (let Y = t.y0; Y <= t.y1; Y++) for (let X = t.x0; X <= t.x1; X++) vals.push(lum(t.img, X, Y))
    vals.sort((a, b) => a - b); const bg = vals[vals.length >> 1]
    let L = 1e9, R = -1, T = 1e9, B = -1
    for (let Y = t.y0; Y <= t.y1; Y++) for (let X = t.x0; X <= t.x1; X++)
      if (Math.abs(lum(t.img, X, Y) - bg) > 45) { L = Math.min(L, X); R = Math.max(R, X); T = Math.min(T, Y); B = Math.max(B, Y) }
    const w = (R - L + 1) / S
    let best = null
    for (let size = 9; size <= 40; size += 0.5) {
      ctx.font = `${t.weight ?? 400} ${size}px "${t.family ?? 'IBM Plex Sans'}"`
      const m = ctx.measureText(t.text)
      const mw = m.actualBoundingBoxRight + m.actualBoundingBoxLeft
      if (!best || Math.abs(mw - w) < Math.abs(best.mw - w)) best = { size, mw }
    }
    out.texts.push({ text: t.text, left: +(L / S).toFixed(1), right: +((R + 1) / S).toFixed(1), top: +(T / S).toFixed(1), bottom: +((B + 1) / S).toFixed(1), width: +w.toFixed(1), size: best.size })
  }
  for (const l of spec.lines ?? []) {
    // solid runs: stretches where luminance stays within ±3 for >= minLen px; reported in pt
    const runs = []; let st = l.from, base = null, sum = 0, n = 0
    const flush = (end) => { if (n >= (l.minLen ?? 4)) runs.push([+(st / S).toFixed(1), +((end + 1) / S).toFixed(1), Math.round(sum / n)]) }
    for (let v = l.from; v <= l.to; v++) {
      const L = l.axis === 'y' ? lum(l.img, l.at, v) : lum(l.img, v, l.at)
      if (base !== null && Math.abs(L - base) <= (l.tol ?? 3)) { sum += L; n++ } else { if (base !== null) flush(v - 1); st = v; base = L; sum = L; n = 1 }
    }
    flush(l.to)
    out.lines.push(l.name + ': ' + runs.map((r) => r.join('-')).join('  '))
  }
  return out
}, { spec, imgs, S })
await b.close()
console.log(JSON.stringify(res, null, 1).replace(/\n\s+(-?[\d.]+,?)/g, ' $1').replace(/\n\s+\]/g, ']'))
