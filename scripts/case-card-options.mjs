// Renders four card styles side by side with real case study content, for Adnan to choose from.
//   node scripts/case-card-options.mjs   → .shots/card-options.png
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const url = (p) => pathToFileURL(resolve(p)).href
const font = (pkg, w) => url(`node_modules/@fontsource/${pkg}/files/${pkg}-latin-${w}-normal.woff2`)
const ic = {
  hourglass: '<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>',
  moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  minus: '<path d="M5 12h14"/>',
}
const svg = (k) => `<svg viewBox="0 0 24 24" class="ic">${ic[k]}</svg>`

const content = (o) => `
<div class="row two">
  <div class="c pc">${o.icon ? `<span class="tic">${svg('hourglass')}</span>` : ''}<span class="num">01</span><h3>Work stops</h3><p>The agent waits until the person comes back.</p></div>
  <div class="c pc ${o.spot ? 'spot' : ''}">${o.icon ? `<span class="tic">${svg('moon')}</span>` : ''}<span class="num">02</span><h3>The session can drop</h3><p>On Windows laptops, sleep drops the connection.</p></div>
</div>
<div class="row two">
  <div class="c pt"><span class="num">01</span><h3>Familiar sign-in</h3><p>Google or email and password, the two most familiar options.</p></div>
  <div class="c pt"><span class="num">02</span><h3>Nothing fails silently</h3><p>Every failure gets one clear message and one next step.</p></div>
</div>
<div class="row"><div class="c tile"><span class="lbl">Agents</span><h3>Only what each agent supports</h3><p>A button that can’t work is worse than no button.</p>
  <table><tr><td></td><th>Approvals</th><th>Questions</th><th>Control</th></tr>
  <tr><td class="n">Claude Code</td><td><i class="y">${svg('check')}</i></td><td><i class="y">${svg('check')}</i></td><td><i class="y">${svg('check')}</i></td></tr>
  <tr><td class="n">Cursor</td><td><i class="y">${svg('check')}</i></td><td><i class="x">${svg('minus')}</i></td><td><i class="x">${svg('minus')}</i></td></tr></table></div></div>`

const OPTIONS = [
  { key: 'a', name: 'A · Editorial', note: 'No boxes. Hairline rules, big orange numbers, more air. Diagrams sit on a faint frame.', icon: false },
  { key: 'b', name: 'B · Hairline', note: 'Transparent cards with a thin light-to-dark gradient edge. Hover lights the edge.', icon: true },
  { key: 'c', name: 'C · Soft depth', note: 'Gradient fill, a fine top highlight and a deep soft shadow. Feels like the app.', icon: true },
  { key: 'd', name: 'D · Spotlight', note: 'Near-black cards; an orange glow follows the cursor and lights the edge (shown on one card).', icon: true, spot: true },
]

const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Plex;font-weight:400;src:url(${font('ibm-plex-sans', 400)})}
@font-face{font-family:Plex;font-weight:500;src:url(${font('ibm-plex-sans', 500)})}
@font-face{font-family:Plex;font-weight:600;src:url(${font('ibm-plex-sans', 600)})}
@font-face{font-family:Mono;font-weight:400;src:url(${font('ibm-plex-mono', 400)})}
*{box-sizing:border-box;margin:0}
body{background:#0e0f12;color:#b4b4b9;font:400 15px/1.5 Plex;padding:40px;display:grid;grid-template-columns:repeat(4,1fr);gap:40px;width:1840px}
.col>header{margin-bottom:22px}
.col>header b{display:block;color:#f5f5f7;font:600 22px/1.2 Plex}
.col>header span{display:block;margin-top:6px;color:#a1a1a6;font-size:14px}
.row{display:grid;gap:14px;margin-bottom:14px}.two{grid-template-columns:1fr 1fr}
.ic{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.c{position:relative}
.c h3{color:#f5f5f7;font:600 17px/1.3 Plex}
.c p{margin-top:6px;font-size:14.5px;line-height:1.5}
.num{display:block;color:#d97757;font:400 12px/1 Mono;letter-spacing:.06em}
.lbl{color:#d97757;font:400 11px/1 Mono;letter-spacing:.08em;text-transform:uppercase}
.tic{display:grid;place-items:center;width:36px;height:36px;border-radius:11px;background:rgba(217,119,87,.14);color:#d97757;margin-bottom:16px}
.pc .num{position:absolute;top:22px;right:22px}
table{width:100%;border-collapse:collapse;margin-top:14px;font-size:13px}
th{color:#a1a1a6;font:400 11px Mono;padding-bottom:8px}
td{text-align:center;padding:8px 0;border-top:1px solid rgba(255,255,255,.06)}
td.n{text-align:left;color:#f5f5f7;font-weight:500}
tr:first-child td{border-top:0}
i{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%}
i .ic{width:14px;height:14px}
i.y{background:rgba(217,119,87,.14);color:#d97757}i.x{color:#a1a1a6}

/* A · Editorial */
.a .c{padding:22px 4px 4px;border-top:1px solid rgba(255,255,255,.12);border-radius:0}
.a .pc .num,.a .pt .num{position:static;font-size:28px;font-family:Plex;font-weight:600;letter-spacing:-.5px;margin-bottom:14px}
.a .c h3{font-size:18px}
.a .tile{padding:24px;border:1px solid rgba(255,255,255,.07);border-radius:24px;background:rgba(255,255,255,.015)}
.a .row{gap:28px;margin-bottom:28px}

/* B · Hairline gradient */
.b .c{padding:22px;border-radius:22px;background:linear-gradient(#0e0f12,#0e0f12) padding-box,linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,.03)) border-box;border:1px solid transparent}
.b .pt .num{margin-bottom:12px}
.b .c:nth-child(2){background:linear-gradient(#111216,#111216) padding-box,linear-gradient(180deg,rgba(217,119,87,.55),rgba(255,255,255,.04)) border-box}

/* C · Soft depth */
.c-opt .c{padding:22px;border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.075),rgba(255,255,255,.025));box-shadow:inset 0 1px 0 rgba(255,255,255,.09),inset 0 0 0 .5px rgba(255,255,255,.05),0 24px 48px -12px rgba(0,0,0,.6)}
.c-opt .pt .num{margin-bottom:12px}
.c-opt .tic{box-shadow:inset 0 0 0 1px rgba(217,119,87,.35)}

/* D · Spotlight */
.d .c{padding:22px;border-radius:22px;background:#121317;border:1px solid rgba(255,255,255,.06);overflow:hidden}
.d .pt .num{margin-bottom:12px}
.d .spot{background:radial-gradient(220px circle at 70% 20%,rgba(217,119,87,.16),transparent 70%),#121317;border-color:rgba(217,119,87,.45)}
</style>
${OPTIONS.map((o) => `<section class="col ${o.key === 'c' ? 'c-opt' : o.key}"><header><b>${o.name}</b><span>${o.note}</span></header>${content(o)}</section>`).join('')}`

mkdirSync('.shots', { recursive: true })
writeFileSync('.shots/card-options.html', html)
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1920, height: 900 }, deviceScaleFactor: 1 })
await p.goto(url('.shots/card-options.html'))
await p.evaluate(() => document.fonts.ready)
await p.waitForTimeout(200)
await p.screenshot({ path: '.shots/card-options.png', fullPage: true })
await b.close()
console.log('.shots/card-options.png')
