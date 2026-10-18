// Three ways to show the Concept decisions, which sit between two visuals (feature map above,
// sketches below), so each stays light and text-led.
//   node scripts/case-concept-options.mjs   → .shots/cc-a.png, cc-b.png, cc-c.png
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const url = (p) => pathToFileURL(resolve(p)).href
const font = (pkg, w) => url(`node_modules/@fontsource/${pkg}/files/${pkg}-latin-${w}-normal.woff2`)
const P = {
  check: '<path d="M20 6 9 17l-5-5"/>', x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>', target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
}
const ic = (k) => `<svg class="ic" viewBox="0 0 24 24">${P[k]}</svg>`
const D = [
  ['target', 'Principle', 'Built on the gaps', 'Basic alerts and approvals already exist. The gaps were one place for every agent, plain-language risk, proof an answer arrived and a computer that stays awake.'],
  ['link', 'Principle', 'Every feature answers a fact', 'From pairing by QR to voice replies, each kept feature traces back to the research.'],
  ['check', 'Kept', 'New task: questioned, then kept', 'A task often finishes while you’re away, and you want to start the next step without going back.'],
  ['x', 'Cut', 'Editing code and commit buttons', 'A phone is the wrong place to write code, and commits already arrive as approvals.'],
  ['clock', 'Later', 'History and trust rules', '“Always allow this in this project” needs real usage before it can be designed well.'],
]
const css = `
@font-face{font-family:Plex;font-weight:400;src:url(${font('ibm-plex-sans', 400)})}
@font-face{font-family:Plex;font-weight:500;src:url(${font('ibm-plex-sans', 500)})}
@font-face{font-family:Plex;font-weight:600;src:url(${font('ibm-plex-sans', 600)})}
@font-face{font-family:Mono;font-weight:400;src:url(${font('ibm-plex-mono', 400)})}
*{box-sizing:border-box;margin:0;padding:0}ul,ol{list-style:none}
body{background:#0e0f12;color:#b4b4b9;font:400 15px/1.5 Plex;padding:48px 56px;width:1360px}
header{margin-bottom:40px;text-align:center}header b{display:block;color:#f5f5f7;font:600 26px/1.2 Plex}header span{display:block;margin-top:8px;color:#a1a1a6}
.ic{width:15px;height:15px;flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
h4{color:#f5f5f7;font:600 17px/1.3 Plex}p{margin-top:6px;font-size:14.5px;line-height:1.55}
.tag{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;font:500 12px Mono}
.t-Principle{background:rgba(255,255,255,.07);color:#e4e4e7}.t-Kept{background:rgba(217,119,87,.14);color:#d97757}.t-Cut,.t-Later{background:rgba(255,255,255,.05);color:#a1a1a6}
.t-Cut{text-decoration:none}
/* A: principles + verdicts */
.ga{display:grid;grid-template-columns:1fr 1fr;gap:48px;max-width:1160px;margin:0 auto}
.ga .col>em{display:block;margin-bottom:14px;color:#a1a1a6;font:400 12px Mono;letter-spacing:.06em;text-transform:uppercase;font-style:normal}
.ga .pr{display:grid;grid-template-columns:40px 1fr;gap:16px;padding:20px 0;border-top:1px solid rgba(255,255,255,.12)}
.ga .pr .i{display:grid;place-items:center;width:40px;height:40px;border-radius:13px;background:rgba(217,119,87,.14);color:#d97757}
.ga .v{display:grid;grid-template-columns:96px 1fr;gap:16px;align-items:baseline;padding:16px 0;border-top:1px solid rgba(255,255,255,.12)}
.ga .v:last-child,.ga .pr:last-child{border-bottom:1px solid rgba(255,255,255,.12)}
/* B: one row of five */
.gb{display:grid;grid-template-columns:repeat(5,1fr);border-top:1px solid rgba(255,255,255,.12);border-bottom:1px solid rgba(255,255,255,.12)}
.gb li{padding:24px 22px}.gb li+li{border-left:1px solid rgba(255,255,255,.08)}.gb .tag{margin-bottom:14px}
/* C: verdict rows */
.gc{max-width:1040px;margin:0 auto}
.gc li{display:grid;grid-template-columns:120px 300px 1fr;gap:24px;align-items:baseline;padding:16px 0;border-top:1px solid rgba(255,255,255,.12)}
.gc li:last-child{border-bottom:1px solid rgba(255,255,255,.12)}.gc p{margin:0}
`
const tag = (t, i) => `<span class="tag t-${t}">${ic(i)}${t}</span>`
const OPTIONS = {
  a: {
    name: 'A · Principles, then verdicts',
    note: 'Left: the two rules every feature had to pass. Right: what they decided (kept, cut, later). Links the map above to the reasoning.',
    html: `<div class="ga"><div class="col"><em>The rules</em>${D.slice(0, 2).map(([i, , t, r]) => `<div class="pr"><span class="i">${ic(i)}</span><div><h4>${t}</h4><p>${r}</p></div></div>`).join('')}</div>
      <div class="col"><em>The calls</em>${D.slice(2).map(([i, k, t, r]) => `<div class="v">${tag(k, i)}<div><h4>${t}</h4><p>${r}</p></div></div>`).join('')}</div></div>`,
  },
  b: { name: 'B · One row of five', note: 'A single band between the two visuals: a tag, a title and a reason per column.', html: `<ul class="gb">${D.map(([i, k, t, r]) => `<li>${tag(k, i)}<h4>${t}</h4><p>${r}</p></li>`).join('')}</ul>` },
  c: { name: 'C · Verdict rows', note: 'Same spec-sheet style as User flow: tag, title, reason per row.', html: `<ul class="gc">${D.map(([i, k, t, r]) => `<li>${tag(k, i)}<h4>${t}</h4><p>${r}</p></li>`).join('')}</ul>` },
}
mkdirSync('.shots', { recursive: true })
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1360, height: 700 } })
for (const [k, o] of Object.entries(OPTIONS)) {
  writeFileSync(`.shots/cc-${k}.html`, `<!doctype html><meta charset="utf-8"><style>${css}</style><header><b>${o.name}</b><span>${o.note}</span></header>${o.html}`)
  await p.goto(url(`.shots/cc-${k}.html`))
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(200)
  await p.screenshot({ path: `.shots/cc-${k}.png`, fullPage: true })
  console.log(`.shots/cc-${k}.png`)
}
await b.close()
