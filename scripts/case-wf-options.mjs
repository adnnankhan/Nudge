// Three ways to give the Wireframes points visuals, with the real content.
//   node scripts/case-wf-options.mjs   → .shots/wf-a.png, wf-b.png, wf-c.png
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const url = (p) => pathToFileURL(resolve(p)).href
const font = (pkg, w) => url(`node_modules/@fontsource/${pkg}/files/${pkg}-latin-${w}-normal.woff2`)
const P = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
}
const ic = (k) => `<svg class="ic" viewBox="0 0 24 24">${P[k]}</svg>`

const POINTS = [
  ['Floating bottom navigation', 'Like iOS apps use today. Content stays visible, and it’s reachable with one thumb.'],
  ['Four items, not three', 'Three looked unfinished at the bottom of the screen.'],
  ['Add a computer, in the dropdown', 'That’s where people look for their computers.'],
  ['One more check', 'For anything missing before moving on, because a missing screen costs minutes now and days after visual design.'],
  ['Feasibility, checked again', 'Against an app built on the same idea, so the design wouldn’t promise anything impossible.'],
]
const tabbar = (n, cls = '') => `<div class="tb ${cls}">${Array.from({ length: n }, (_, i) => `<span class="${n === 4 && i === 1 ? 'pl' : ''}">${n === 4 && i === 1 ? '+' : ''}</span>`).join('')}</div>`
const V = [
  `<div class="mv v-float"><div class="bg"><i></i><i></i><i></i><i></i><i></i></div>${tabbar(4)}</div>`,
  `<div class="mv v-four"><div class="cmp off">${tabbar(3)}<em>${ic('x')}3</em></div><div class="cmp on">${tabbar(4)}<em>${ic('check')}4</em></div></div>`,
  `<div class="mv v-drop"><div class="dd"><div class="dd-btn"><b></b>Windows PC <small>· awake</small>${ic('down')}</div><div class="dd-menu"><span>${ic('check')}Windows PC</span><span class="mut">MacBook</span><span class="add">${ic('plus')}Add a computer</span></div></div></div>`,
  `<div class="mv v-grid"><div class="g53">${Array.from({ length: 53 }, (_, i) => `<i class="${i === 37 ? 'miss' : ''}"></i>`).join('')}</div><em>53</em></div>`,
  `<div class="mv v-feas"><span>${ic('check')}Undo restores files only</span><span class="no">${ic('x')}Cursor can’t be controlled</span><span>${ic('check')}Terminal sessions via Stop</span></div>`,
]

const css = `
@font-face{font-family:Plex;font-weight:400;src:url(${font('ibm-plex-sans', 400)})}
@font-face{font-family:Plex;font-weight:500;src:url(${font('ibm-plex-sans', 500)})}
@font-face{font-family:Plex;font-weight:600;src:url(${font('ibm-plex-sans', 600)})}
@font-face{font-family:Mono;font-weight:400;src:url(${font('ibm-plex-mono', 400)})}
*{box-sizing:border-box;margin:0;padding:0}ul{list-style:none}
body{background:#0e0f12;color:#b4b4b9;font:400 15px/1.5 Plex;padding:48px 56px;width:1360px}
header{margin-bottom:36px;text-align:center}header b{display:block;color:#f5f5f7;font:600 26px/1.2 Plex}header span{display:block;margin-top:8px;color:#a1a1a6}
.ic{width:14px;height:14px;flex:none;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
h4{color:#f5f5f7;font:600 18px/1.3 Plex}p{margin-top:6px;font-size:15px;line-height:1.5}
.mv{position:relative;display:flex;align-items:center;justify-content:center;height:140px;overflow:hidden;border:1px solid rgba(255,255,255,.075);border-radius:20px;background:rgba(255,255,255,.018);color:#f5f5f7}
.tb{display:flex;gap:10px;padding:6px 10px;border-radius:999px;background:rgba(40,41,46,.6);backdrop-filter:blur(8px);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)}
.tb span{width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,.22)}
.tb .pl{display:grid;place-items:center;background:#f5f5f7;color:#0e0f12;font:600 14px/1 Plex}
.v-float{align-items:flex-end;padding-bottom:14px}.v-float .bg{position:absolute;inset:14px 16px auto;display:grid;gap:8px}.v-float .bg i{height:13px;border-radius:6px;background:rgba(255,255,255,.15)}.v-float .bg i:nth-child(even){width:70%}
.v-four{flex-direction:column;gap:12px}.cmp{display:flex;align-items:center;gap:12px}.cmp em{display:flex;align-items:center;gap:4px;width:34px;font:500 12px Mono;font-style:normal}
.cmp.off{opacity:.45}.cmp.off em{color:#a1a1a6}.cmp.on em{color:#d97757}.cmp.on .tb{box-shadow:inset 0 0 0 1px rgba(217,119,87,.5)}
.v-drop{align-items:flex-start;padding-top:16px}.dd{width:200px}.dd-btn{display:flex;align-items:center;gap:6px;padding:7px 12px;border-radius:999px;background:rgba(255,255,255,.08);font:500 12.5px Plex}.dd-btn b{width:7px;height:7px;border-radius:50%;background:#7fdda0}.dd-btn small{color:#a1a1a6;font-size:12px}.dd-btn .ic{margin-left:auto;color:#a1a1a6}
.dd-menu{display:grid;gap:2px;margin-top:6px;padding:6px;border-radius:14px;background:#1b1c20;box-shadow:inset 0 0 0 1px rgba(255,255,255,.1),0 12px 24px rgba(0,0,0,.4)}
.dd-menu span{display:flex;align-items:center;gap:7px;padding:5px 8px;border-radius:9px;font-size:12.5px}.dd-menu .mut{padding-left:29px;color:#b4b4b9}.dd-menu .add{color:#d97757;background:rgba(217,119,87,.12)}
.v-grid{gap:18px}.g53{display:grid;grid-template-columns:repeat(11,10px);gap:4px}.g53 i{width:10px;height:14px;border-radius:3px;background:rgba(255,255,255,.16)}.g53 .miss{background:none;outline:1.5px dashed #d97757;outline-offset:-1px}
.v-grid em{color:#d97757;font:600 34px/1 Plex;font-style:normal;letter-spacing:-1px}
.v-feas{flex-direction:column;align-items:stretch;gap:8px;padding:0 20px}.v-feas span{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:10px;background:rgba(255,255,255,.05);font-size:12.5px}.v-feas .ic{color:#d97757}.v-feas .no .ic{color:#a1a1a6}

/* A: tiles */
.ga{display:grid;grid-template-columns:repeat(5,1fr);gap:20px}.ga .mv{margin-bottom:18px}.ga p{font-size:14.5px}
/* B: annotated */
.gb{display:grid;grid-template-columns:300px 1fr;gap:56px;align-items:center}
.ph{position:relative;border-radius:34px;overflow:visible;box-shadow:0 0 0 7px #1a1b1f,0 0 0 8px #2a2b2f,0 30px 60px rgba(0,0,0,.5)}.ph img{display:block;width:100%;border-radius:34px}
.pin{position:absolute;display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:#d97757;color:#0e0f12;font:600 13px Plex;box-shadow:0 0 0 5px rgba(217,119,87,.25)}
.legend{display:grid;gap:22px}.legend li{display:grid;grid-template-columns:32px 1fr;gap:14px;padding-top:18px;border-top:1px solid rgba(255,255,255,.12)}
.legend .n{display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:rgba(217,119,87,.14);color:#d97757;font:600 13px Plex}
.legend .n.solid{background:#d97757;color:#0e0f12}
/* C: rows */
.gc{display:grid;grid-template-columns:1fr 1fr;gap:20px 40px}.gc li{display:grid;grid-template-columns:200px 1fr;gap:20px;align-items:center}.gc .mv{height:120px}.gc li:last-child{grid-column:1/-1;grid-template-columns:200px 1fr;max-width:calc(50% - 20px)}
`
const OPTIONS = {
  a: { name: 'A · A visual for each point', note: 'Same as Design: a small drawing above each title and reason.', html: `<ul class="ga">${POINTS.map(([t, r], i) => `<li>${V[i]}<h4>${t}</h4><p>${r}</p></li>`).join('')}</ul>` },
  b: {
    name: 'B · Annotated wireframe',
    note: 'The Home wireframe with numbered pins on what each decision changed, and the points as a numbered legend.',
    html: `<div class="gb"><div class="ph"><img src="${url('case-study/assets/wf-home.png')}"><span class="pin" style="left:-12px;top:6%">3</span><span class="pin" style="left:46%;bottom:-12px">1</span><span class="pin" style="right:-12px;bottom:3%">2</span></div>
      <ul class="legend">${POINTS.map(([t, r], i) => `<li><span class="n ${i < 3 ? 'solid' : ''}">${i + 1}</span><div><h4>${t}</h4><p>${r}</p></div></li>`).join('')}</ul></div>`,
  },
  c: { name: 'C · Visual and text side by side', note: 'Each point is a row: drawing on the left, title and reason on the right.', html: `<ul class="gc">${POINTS.map(([t, r], i) => `<li>${V[i]}<div><h4>${t}</h4><p>${r}</p></div></li>`).join('')}</ul>` },
}
mkdirSync('.shots', { recursive: true })
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1360, height: 800 } })
for (const [k, o] of Object.entries(OPTIONS)) {
  writeFileSync(`.shots/wf-${k}.html`, `<!doctype html><meta charset="utf-8"><style>${css}</style><header><b>${o.name}</b><span>${o.note}</span></header>${o.html}`)
  await p.goto(url(`.shots/wf-${k}.html`))
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(200)
  await p.screenshot({ path: `.shots/wf-${k}.png`, fullPage: true })
  console.log(`.shots/wf-${k}.png`)
}
await b.close()
