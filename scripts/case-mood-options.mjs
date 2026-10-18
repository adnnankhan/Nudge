// Three ways to give the Moodboard points visuals, with the real content.
//   node scripts/case-mood-options.mjs   → .shots/mood-a.png, mood-b.png, mood-c.png
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const url = (p) => pathToFileURL(resolve(p)).href
const font = (pkg, w) => url(`node_modules/@fontsource/${pkg}/files/${pkg}-latin-${w}-normal.woff2`)
const P = { check: '<path d="M20 6 9 17l-5-5"/>', x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>' }
const ic = (k) => `<svg class="ic" viewBox="0 0 24 24">${P[k]}</svg>`

const POINTS = [
  ['Dated styles rejected', 'The first set looked like styles from 2020, and a tool for AI agents has to feel current.'],
  ['A mix of two directions', 'Held to HCI and Google guidelines, contrast and spacing, so a style choice couldn’t turn into a usability problem later.'],
  ['Correct isn’t enough', 'Directions that looked lacking were rejected even when they followed the rules. It has to feel premium.'],
  ['Calm minimalism', 'Modern effects and strong typography, because a screen you decide on in seconds has to stay calm. Dribbble references set the quality bar.'],
]
const V = [
  `<div class="mv v-dated"><div class="retro"><i></i><i class="s"></i><b>2020</b></div><span class="strike"></span></div>`,
  `<div class="mv v-mix"><span class="c c1"></span><span class="c c2"></span><div class="rules"><i>HCI</i><i>Google</i><i>Contrast</i><i>Spacing</i></div></div>`,
  `<div class="mv v-correct"><ul><li>${ic('check')}Contrast</li><li>${ic('check')}Spacing</li><li>${ic('check')}Guidelines</li></ul><span class="verdict">${ic('x')}Lacking</span></div>`,
  `<div class="mv v-calm"><b>Aa</b><div class="calm-card"><i></i><i class="s"></i><span></span></div></div>`,
]
const css = `
@font-face{font-family:Plex;font-weight:400;src:url(${font('ibm-plex-sans', 400)})}
@font-face{font-family:Plex;font-weight:500;src:url(${font('ibm-plex-sans', 500)})}
@font-face{font-family:Plex;font-weight:600;src:url(${font('ibm-plex-sans', 600)})}
@font-face{font-family:Mono;font-weight:400;src:url(${font('ibm-plex-mono', 400)})}
*{box-sizing:border-box;margin:0;padding:0}ul,ol{list-style:none}
body{background:#0e0f12;color:#b4b4b9;font:400 15px/1.5 Plex;padding:48px 56px;width:1360px}
header{margin-bottom:36px;text-align:center}header b{display:block;color:#f5f5f7;font:600 26px/1.2 Plex}header span{display:block;margin-top:8px;color:#a1a1a6}
.ic{width:14px;height:14px;flex:none;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
h4{color:#f5f5f7;font:600 18px/1.3 Plex}p{margin-top:6px;font-size:15px;line-height:1.5}
.mv{position:relative;display:flex;align-items:center;justify-content:center;height:150px;overflow:hidden;border:1px solid rgba(255,255,255,.075);border-radius:20px;background:rgba(255,255,255,.018);color:#f5f5f7}
.v-dated .retro{position:relative;width:150px;padding:14px;border-radius:8px;background:linear-gradient(135deg,#6a5acd,#ff7eb3);box-shadow:4px 4px 0 rgba(0,0,0,.4);opacity:.5}
.v-dated .retro i{display:block;height:8px;margin-bottom:6px;border-radius:2px;background:rgba(255,255,255,.7)}.v-dated .retro .s{width:60%}
.v-dated .retro b{display:block;margin-top:6px;font:700 15px Plex;color:#fff}
.v-dated .strike{position:absolute;width:190px;height:2px;background:#a1a1a6;transform:rotate(-18deg)}
.v-mix .c{position:absolute;top:22px;width:70px;height:70px;border-radius:50%}
.v-mix .c1{left:calc(50% - 58px);background:rgba(255,255,255,.12);box-shadow:inset 0 0 0 1px rgba(255,255,255,.2)}
.v-mix .c2{left:calc(50% - 12px);background:rgba(217,119,87,.18);box-shadow:inset 0 0 0 1px rgba(217,119,87,.5)}
.v-mix .rules{position:absolute;bottom:14px;display:flex;gap:6px}.v-mix .rules i{padding:3px 8px;border-radius:999px;background:rgba(255,255,255,.07);font:400 11px Mono;font-style:normal;color:#e4e4e7}
.v-correct{gap:22px}.v-correct ul{display:grid;gap:7px}.v-correct li{display:flex;align-items:center;gap:7px;font-size:13px}.v-correct li .ic{color:#7fdda0}
.v-correct .verdict{display:flex;align-items:center;gap:6px;padding:7px 12px;border-radius:999px;background:rgba(217,119,87,.14);color:#d97757;font:600 13px Plex}
.v-calm{gap:22px}.v-calm b{font:600 44px/1 Plex;letter-spacing:-1px}
.v-calm .calm-card{width:120px;padding:14px;border-radius:14px;background:rgba(255,255,255,.06);box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}
.v-calm .calm-card i{display:block;height:8px;margin-bottom:7px;border-radius:4px;background:rgba(255,255,255,.22)}.v-calm .calm-card .s{width:60%}
.v-calm .calm-card span{display:block;width:60px;height:20px;margin-top:6px;border-radius:999px;background:#f5f5f7}
/* A */
.ga{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}.ga .mv{margin-bottom:18px}
/* B: a path from rejected to chosen */
.gb{display:grid;grid-template-columns:repeat(4,1fr);gap:0}
.gb>li{position:relative;padding:0 14px}
.gb .mv{margin-bottom:18px}
.gb .tag{display:inline-flex;align-items:center;gap:6px;margin-bottom:10px;padding:3px 10px;border-radius:999px;font:500 12px Mono}
.gb .rej{background:rgba(255,255,255,.06);color:#a1a1a6}.gb .ok{background:rgba(217,119,87,.14);color:#d97757}
.gb .step{position:absolute;top:66px;right:-14px;z-index:2;display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:#0e0f12;color:#d97757;box-shadow:inset 0 0 0 1px rgba(217,119,87,.5)}
.gb>li:last-child .mv{border-color:rgba(217,119,87,.5);background:radial-gradient(200px 120px at 50% 0%,rgba(217,119,87,.14),transparent 70%),rgba(255,255,255,.018)}
/* C: verdict list */
.gc{display:grid;gap:0;max-width:980px;margin:0 auto}
.gc>li{display:grid;grid-template-columns:220px 120px 1fr;gap:28px;align-items:center;padding:18px 0;border-top:1px solid rgba(255,255,255,.12)}
.gc>li:last-child{border-bottom:1px solid rgba(255,255,255,.12)}
.gc .mv{height:140px}.gc .mv .retro{transform:scale(.8)}.gc .v-mix .rules{transform:scale(.85)}.gc .v-correct{gap:12px}
.gc .tag{justify-self:start;display:inline-flex;gap:6px;align-items:center;padding:4px 11px;border-radius:999px;font:500 12px Mono}
.gc .rej{background:rgba(255,255,255,.06);color:#a1a1a6}.gc .ok{background:rgba(217,119,87,.14);color:#d97757}
`
const verdict = ['rej', 'ok', 'rej', 'ok']
const vlabel = (i) => (verdict[i] === 'rej' ? `${ic('x')}Rejected` : i === 3 ? `${ic('check')}Chosen` : `${ic('check')}Kept`)
const OPTIONS = {
  a: { name: 'A · A visual for each point', note: 'A small drawing above each decision, like Design.', html: `<ul class="ga">${POINTS.map(([t, r], i) => `<li>${V[i]}<h4>${t}</h4><p>${r}</p></li>`).join('')}</ul>` },
  b: {
    name: 'B · The path to the chosen style',
    note: 'Left to right: what was rejected and kept on the way, ending at the chosen style.',
    html: `<ol class="gb">${POINTS.map(([t, r], i) => `<li>${V[i]}${i < 3 ? `<span class="step">${ic('arrow')}</span>` : ''}<span class="tag ${verdict[i]}">${vlabel(i)}</span><h4>${t}</h4><p>${r}</p></li>`).join('')}</ol>`,
  },
  c: {
    name: 'C · Verdict list',
    note: 'One row per decision: drawing, verdict, title and reason. Very scannable.',
    html: `<ul class="gc">${POINTS.map(([t, r], i) => `<li>${V[i]}<span class="tag ${verdict[i]}">${vlabel(i)}</span><div><h4>${t}</h4><p>${r}</p></div></li>`).join('')}</ul>`,
  },
}
mkdirSync('.shots', { recursive: true })
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1360, height: 800 } })
for (const [k, o] of Object.entries(OPTIONS)) {
  writeFileSync(`.shots/mood-${k}.html`, `<!doctype html><meta charset="utf-8"><style>${css}</style><header><b>${o.name}</b><span>${o.note}</span></header>${o.html}`)
  await p.goto(url(`.shots/mood-${k}.html`))
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(200)
  await p.screenshot({ path: `.shots/mood-${k}.png`, fullPage: true })
  console.log(`.shots/mood-${k}.png`)
}
await b.close()
