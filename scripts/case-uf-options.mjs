// Three ways to show the User flow decisions, with the real content.
//   node scripts/case-uf-options.mjs   → .shots/uf-a.png, uf-b.png, uf-c.png
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const url = (p) => pathToFileURL(resolve(p)).href
const font = (pkg, w) => url(`node_modules/@fontsource/${pkg}/files/${pkg}-latin-${w}-normal.woff2`)
const P = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  qr: '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/>',
  finger: '<path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>',
  sliders: '<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
}
const ic = (k, c = 'ic') => `<svg class="${c}" viewBox="0 0 24 24">${P[k]}</svg>`
const PHASES = [
  { t: 'Set up', i: 'qr', d: [
    ['Familiar sign-in', 'Google or email and password.'],
    ['A short explanation first', 'The first step happens on the computer.'],
    ['You confirm each agent', 'Nothing connects without a yes.'],
    ['Notifications, with a reason', 'Asked right after pairing, when the value is obvious.'],
    ['Keep-awake from the start', 'So the session doesn’t drop on the first use.'],
  ] },
  { t: 'Answer', i: 'finger', d: [
    ['Face ID or fingerprint', 'Approve from anywhere; a typed answer gets a full screen.'],
    ['One queue per session', 'Review in order instead of hunting.'],
  ] },
  { t: 'Control', i: 'sliders', d: [
    ['Stop confirms only when files changed', 'Asking every time teaches people to tap through.'],
    ['Undo, one step at a time', '“Go back further” makes bigger rollbacks deliberate.'],
    ['Limits explained, not hidden', 'Cursor’s Stop is shown, with why.'],
    ['Take over from Stop', 'One question instead of a Take over button.'],
  ] },
  { t: 'When it fails', i: 'alert', d: [
    ['Nothing fails silently', 'One clear message and one next step, from a sleeping computer to a failed QR scan.'],
  ] },
]
const css = `
@font-face{font-family:Plex;font-weight:400;src:url(${font('ibm-plex-sans', 400)})}
@font-face{font-family:Plex;font-weight:500;src:url(${font('ibm-plex-sans', 500)})}
@font-face{font-family:Plex;font-weight:600;src:url(${font('ibm-plex-sans', 600)})}
@font-face{font-family:Mono;font-weight:400;src:url(${font('ibm-plex-mono', 400)})}
*{box-sizing:border-box;margin:0;padding:0}ul,ol{list-style:none}
body{background:#0e0f12;color:#b4b4b9;font:400 15px/1.5 Plex;padding:48px 56px;width:1360px}
header{margin-bottom:40px;text-align:center}header b{display:block;color:#f5f5f7;font:600 26px/1.2 Plex}header span{display:block;margin-top:8px;color:#a1a1a6}
.ic{width:16px;height:16px;flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.tic{display:grid;place-items:center;width:40px;height:40px;border-radius:13px;background:rgba(217,119,87,.14);color:#d97757}.tic .ic{width:19px;height:19px}
.row{display:flex;gap:10px;align-items:flex-start}.row>.ic{width:14px;height:14px;margin-top:4px;color:#d97757}
.row b{display:block;color:#f5f5f7;font:600 15.5px/1.35 Plex}.row span{display:block;color:#a1a1a6;font-size:14px;line-height:1.45}
/* A: journey */
.ja{position:relative;display:grid;grid-template-columns:repeat(4,1fr);gap:28px}
.ja:before{content:'';position:absolute;top:20px;left:20px;right:calc(25% - 20px);border-top:1.5px dashed rgba(217,119,87,.45)}
.ph{position:relative}.ph .head{display:flex;align-items:center;gap:12px;margin-bottom:22px}.ph .tic{position:relative;z-index:1;box-shadow:0 0 0 6px #0e0f12}
.ph .head b{color:#f5f5f7;font:600 19px Plex}.ph .head em{color:#a1a1a6;font:400 12px Mono;font-style:normal;margin-left:auto}
.ph ul{display:grid;gap:16px}
/* B: principles */
.pb{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.card{display:flex;flex-direction:column;gap:16px;padding:24px;border:1px solid rgba(255,255,255,.075);border-radius:24px;background:rgba(255,255,255,.018)}
.card .h{display:flex;align-items:center;gap:12px}.card .h b{color:#f5f5f7;font:600 18px/1.25 Plex}.card .h em{margin-left:auto;padding:2px 9px;border-radius:999px;background:rgba(255,255,255,.06);color:#a1a1a6;font:400 12px Mono;font-style:normal}
.card ul{display:grid;gap:14px}
/* C: spec sheet */
.sc{display:grid;gap:0;max-width:1060px;margin:0 auto}
.grp{display:grid;grid-template-columns:200px 1fr;gap:32px;padding:22px 0;border-top:1px solid rgba(255,255,255,.12)}.grp:last-child{border-bottom:1px solid rgba(255,255,255,.12)}
.grp .gh{display:flex;align-items:center;gap:12px;align-self:start}.grp .gh b{color:#f5f5f7;font:600 18px Plex}
.grp ul{display:grid;gap:0}.grp li{display:grid;grid-template-columns:300px 1fr;gap:24px;padding:9px 0}.grp li+li{border-top:1px solid rgba(255,255,255,.05)}
.grp li b{display:flex;gap:10px;align-items:center;color:#f5f5f7;font:600 15.5px Plex}.grp li b .ic{width:14px;height:14px;color:#d97757}.grp li span{color:#a1a1a6;font-size:14.5px}
`
const rows = (d) => d.map(([t, r]) => `<li class="row">${ic('check')}<div><b>${t}</b><span>${r}</span></div></li>`).join('')
const OPTIONS = {
  a: {
    name: 'A · One journey, four stops',
    note: 'The decisions sit under the moment they happen: set up, answer, control, failure. A dashed line ties the stops together.',
    html: `<div class="ja">${PHASES.map((p) => `<div class="ph"><div class="head"><span class="tic">${ic(p.i)}</span><b>${p.t}</b><em>${p.d.length}</em></div><ul>${rows(p.d)}</ul></div>`).join('')}</div>`,
  },
  b: {
    name: 'B · Four framed groups',
    note: 'Same grouping, each in a framed card with its count. Calm and even.',
    html: `<div class="pb">${PHASES.map((p) => `<div class="card"><div class="h"><span class="tic">${ic(p.i)}</span><b>${p.t}</b><em>${p.d.length}</em></div><ul>${rows(p.d)}</ul></div>`).join('')}</div>`,
  },
  c: {
    name: 'C · Spec sheet',
    note: 'One row per decision: title on the left, reason on the right, grouped by moment. Reads like a design spec.',
    html: `<div class="sc">${PHASES.map((p) => `<div class="grp"><div class="gh"><span class="tic">${ic(p.i)}</span><b>${p.t}</b></div><ul>${p.d.map(([t, r]) => `<li><b>${ic('check')}${t}</b><span>${r}</span></li>`).join('')}</ul></div>`).join('')}</div>`,
  },
}
mkdirSync('.shots', { recursive: true })
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1360, height: 800 } })
for (const [k, o] of Object.entries(OPTIONS)) {
  writeFileSync(`.shots/uf-${k}.html`, `<!doctype html><meta charset="utf-8"><style>${css}</style><header><b>${o.name}</b><span>${o.note}</span></header>${o.html}`)
  await p.goto(url(`.shots/uf-${k}.html`))
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(200)
  await p.screenshot({ path: `.shots/uf-${k}.png`, fullPage: true })
  console.log(`.shots/uf-${k}.png`)
}
await b.close()
