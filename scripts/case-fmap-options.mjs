// Four layouts for the Concept feature map, with its real content, for Adnan to choose from.
//   node scripts/case-fmap-options.mjs   → .shots/fmap-a.png … fmap-d.png
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const url = (p) => pathToFileURL(resolve(p)).href
const font = (pkg, w) => url(`node_modules/@fontsource/${pkg}/files/${pkg}-latin-${w}-normal.woff2`)
const P = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  qr: '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  sliders: '<path d="M10 5H3"/><path d="M12 19H3"/><path d="M14 3v4"/><path d="M16 17v4"/><path d="M21 12h-9"/><path d="M21 19h-5"/><path d="M21 5h-7"/><path d="M8 10v4"/><path d="M8 12H3"/>',
  mark: '<circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" stroke-width="7" stroke-dasharray="180 33.6" transform="rotate(112 50 50)" stroke-linecap="round"/><circle cx="50" cy="50" r="21" fill="none" stroke="currentColor" stroke-width="7"/><circle cx="50" cy="50" r="9" fill="currentColor" stroke="none"/>',
}
const ic = (k, cls = 'ic') => `<svg class="${cls}" viewBox="${k === 'mark' ? '0 0 100 100' : '0 0 24 24'}">${P[k]}</svg>`

const G = {
  setup: { t: 'Setup', i: 'qr', f: ['Pair by QR', 'See and remove paired phones', 'Claude Code, Codex, Cursor'] },
  hub: { t: 'Home (the hub)', i: 'mark', f: ['All sessions on one screen', 'One-line live status', 'Computer status + keep-awake'] },
  appr: { t: 'Approvals and questions', i: 'shield', f: ['Approve / deny from the lock screen', 'Plain explanation + risk', 'Summary of what the agent did', 'Answer questions', 'Delivery confirmation', 'Timeout back to the computer'] },
  ctrl: { t: 'Control', i: 'sliders', f: ['Stop → Continue / Redirect / Undo', 'Model and intensity', 'Voice', 'Start a new task<span class="badge">questioned, then kept</span>'] },
}
const LATER = ['Approval history', 'Trust rules']
const CUT = [['Commit and push buttons', 'Approvals already cover them'], ['Editing code on the phone', 'Clutters a quick tool']]
const list = (fs, mark = 'check') => `<ul class="fl">${fs.map((f) => `<li>${ic(mark)}<span>${f}</span></li>`).join('')}</ul>`
const head = (g) => `<div class="gh"><span class="tic">${ic(g.i, g.i === 'mark' ? 'ic mk' : 'ic')}</span><b>${g.t}</b><em>${g.f.length}</em></div>`
const laterCut = `
<div class="lc">
  <div class="lcol"><div class="lh">${ic('clock')}<b>Later</b><span>Need real usage first</span></div>${list(LATER, 'clock')}</div>
  <div class="lcol cut"><div class="lh">${ic('x')}<b>Cut</b><span>Wrong job for a phone</span></div><ul class="fl">${CUT.map(([a, b]) => `<li>${ic('x')}<span><s>${a}</s><small>${b}</small></span></li>`).join('')}</ul></div>
</div>`

const OPTIONS = {
  a: {
    name: 'A · Hub and spokes',
    note: 'Home is the centre; the other groups connect to it, like buttons around a remote. Later and Cut sit below.',
    html: `<div class="hub">
      <div class="side">${['setup', 'ctrl'].map((k) => `<div class="g">${head(G[k])}${list(G[k].f)}</div>`).join('')}</div>
      <div class="core"><span class="lineL"></span><span class="lineR"></span><div class="ring"><span class="mk2">${ic('mark', 'ic big')}</span></div><b>${G.hub.t}</b>${list(G.hub.f)}</div>
      <div class="side"><div class="g">${head(G.appr)}${list(G.appr.f)}</div></div>
    </div>${laterCut}`,
  },
  b: {
    name: 'B · Scorecard',
    note: 'Counts first (kept, later, cut), then each group as a clean checklist. No pills.',
    html: `<div class="score"><div><b>16</b><span>${ic('check')}Kept</span></div><div><b>2</b><span>${ic('clock')}Later</span></div><div><b>2</b><span>${ic('x')}Cut</span></div></div>
    <div class="cols">${['setup', 'hub', 'appr', 'ctrl'].map((k) => `<div class="g">${head(G[k])}${list(G[k].f)}</div>`).join('')}</div>${laterCut}`,
  },
  c: {
    name: 'C · Bento',
    note: 'Home gets the big tile; the other groups fit around it in framed tiles of different sizes.',
    html: `<div class="bento">
      <div class="t hubT">${head(G.hub)}<div class="glow"></div>${list(G.hub.f)}</div>
      <div class="t apprT">${head(G.appr)}${list(G.appr.f)}</div>
      <div class="t">${head(G.setup)}${list(G.setup.f)}</div>
      <div class="t">${head(G.ctrl)}${list(G.ctrl.f)}</div>
      <div class="t laterT"><div class="lh">${ic('clock')}<b>Later</b></div>${list(LATER, 'clock')}</div>
      <div class="t cutT"><div class="lh">${ic('x')}<b>Cut</b></div><ul class="fl">${CUT.map(([a, b]) => `<li>${ic('x')}<span><s>${a}</s><small>${b}</small></span></li>`).join('')}</ul></div>
    </div>`,
  },
  d: {
    name: 'D · Kept, later, cut lanes',
    note: 'Three lanes show the decision itself; kept features stay grouped inside the first lane.',
    html: `<div class="lanes">
      <div class="lane kept"><div class="lane-h">${ic('check')}<b>Kept</b><em>16</em></div><div class="lane-g">${['setup', 'hub', 'appr', 'ctrl'].map((k) => `<div class="g">${head(G[k])}${list(G[k].f)}</div>`).join('')}</div></div>
      <div class="lane"><div class="lane-h">${ic('clock')}<b>Later</b><em>2</em></div>${list(LATER, 'clock')}<p class="why">Need real usage before they can be designed well.</p></div>
      <div class="lane cut"><div class="lane-h">${ic('x')}<b>Cut</b><em>2</em></div><ul class="fl">${CUT.map(([a, b]) => `<li>${ic('x')}<span><s>${a}</s><small>${b}</small></span></li>`).join('')}</ul></div>
    </div>`,
  },
}

const css = `
@font-face{font-family:Plex;font-weight:400;src:url(${font('ibm-plex-sans', 400)})}
@font-face{font-family:Plex;font-weight:500;src:url(${font('ibm-plex-sans', 500)})}
@font-face{font-family:Plex;font-weight:600;src:url(${font('ibm-plex-sans', 600)})}
@font-face{font-family:Mono;font-weight:400;src:url(${font('ibm-plex-mono', 400)})}
*{box-sizing:border-box;margin:0;padding:0}ul{list-style:none}
body{background:#0e0f12;color:#b4b4b9;font:400 15px/1.5 Plex;padding:48px 56px;width:1360px}
header{margin-bottom:36px;text-align:center}header b{display:block;color:#f5f5f7;font:600 26px/1.2 Plex}header span{display:block;margin-top:8px;color:#a1a1a6;font-size:15px}
.ic{width:15px;height:15px;flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ic.mk,.ic.big{stroke:none}.ic.mk circle,.ic.big circle{stroke:currentColor}.ic.mk circle:last-child,.ic.big circle:last-child{stroke:none}
.badge{display:inline-block;margin-left:8px;padding:1px 8px;border-radius:999px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.22);color:#a1a1a6;font:400 11px/1.6 Mono;white-space:nowrap}
.gh{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.gh b{color:#f5f5f7;font:600 18px/1.25 Plex}.gh em{margin-left:auto;color:#a1a1a6;font:400 12px Mono;font-style:normal}
.tic{display:grid;place-items:center;width:34px;height:34px;border-radius:11px;background:rgba(217,119,87,.14);color:#d97757}.tic .ic{width:17px;height:17px}
.fl{display:grid;gap:10px}.fl li{display:flex;gap:10px;align-items:flex-start;color:#e4e4e7;font-size:15px;line-height:1.4}
.fl li>.ic{margin-top:3px;color:#d97757}
.fl small{display:block;color:#a1a1a6;font-size:13.5px}.fl s{color:#e4e4e7;text-decoration-color:#a1a1a6}
.lc{display:grid;grid-template-columns:1fr 2fr;gap:36px;margin-top:44px;padding-top:28px;border-top:1px solid rgba(255,255,255,.12)}
.lh{display:flex;align-items:center;gap:10px;margin-bottom:14px;color:#a1a1a6}.lh b{color:#f5f5f7;font:600 17px Plex}.lh span{font-size:13.5px}
.lcol .fl li>.ic,.cut .fl li>.ic{color:#a1a1a6}
.lcol.cut .fl{grid-template-columns:1fr 1fr}

/* A */
.hub{display:grid;grid-template-columns:1fr 320px 1fr;gap:56px;align-items:center}
.side{display:grid;gap:40px}.g{position:relative}
.core{position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;padding:36px 28px;border:1px solid rgba(217,119,87,.45);border-radius:28px;background:radial-gradient(260px 160px at 50% 0%,rgba(217,119,87,.16),transparent 70%),rgba(255,255,255,.02)}
.core>b{margin:18px 0 16px;color:#f5f5f7;font:600 22px Plex}.core .fl li{justify-content:center}
.ring{display:grid;place-items:center;width:84px;height:84px;border-radius:50%;box-shadow:0 0 0 10px rgba(217,119,87,.08),0 0 0 22px rgba(217,119,87,.04);background:#0a0a0a;color:#f5f5f7}.ic.big{width:44px;height:44px}
.lineL,.lineR{position:absolute;top:50%;width:56px;border-top:1.5px dashed rgba(217,119,87,.5)}.lineL{right:100%}.lineR{left:100%}

/* B */
.score{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-bottom:40px}
.score div{display:flex;align-items:baseline;gap:14px;padding:22px 26px;border:1px solid rgba(255,255,255,.075);border-radius:22px;background:rgba(255,255,255,.018)}
.score b{color:#d97757;font:600 48px/1 Plex;letter-spacing:-1px}.score span{display:flex;align-items:center;gap:8px;color:#f5f5f7;font:600 17px Plex}
.score div:not(:first-child) b{color:#f5f5f7}
.cols{display:grid;grid-template-columns:repeat(4,1fr);gap:36px}.cols .g{padding-top:24px;border-top:1px solid rgba(255,255,255,.12)}

/* C */
.bento{display:grid;grid-template-columns:1.3fr 1fr 1fr;grid-template-rows:auto auto auto;gap:16px}
.t{position:relative;overflow:hidden;padding:26px;border:1px solid rgba(255,255,255,.075);border-radius:24px;background:rgba(255,255,255,.018)}
.hubT{grid-row:span 2;border-color:rgba(217,119,87,.45)}.hubT .gh b{font-size:24px}
.glow{position:absolute;right:-60px;bottom:-60px;width:240px;height:240px;border-radius:50%;background:radial-gradient(closest-side,rgba(217,119,87,.22),transparent)}
.apprT{grid-row:span 2}
.laterT,.cutT{padding:22px 26px}.cutT{grid-column:span 2}.cutT .fl{grid-template-columns:1fr 1fr}.laterT .fl li>.ic,.cutT .fl li>.ic{color:#a1a1a6}

/* D */
.lanes{display:grid;grid-template-columns:2.6fr 1fr 1fr;gap:16px;align-items:start}
.lane{padding:24px;border:1px solid rgba(255,255,255,.075);border-radius:24px;background:rgba(255,255,255,.018)}
.lane.kept{border-color:rgba(217,119,87,.4)}
.lane-h{display:flex;align-items:center;gap:10px;margin-bottom:22px;color:#a1a1a6}.lane-h b{color:#f5f5f7;font:600 18px Plex}.lane-h em{margin-left:auto;font:400 12px Mono;font-style:normal}
.kept .lane-h .ic{color:#d97757}
.lane-g{display:grid;grid-template-columns:1fr 1fr;gap:28px 32px}
.lane .fl li>.ic{color:#a1a1a6}.lane.kept .fl li>.ic{color:#d97757}
.lane .why{margin-top:16px;color:#a1a1a6;font-size:13.5px}
`

mkdirSync('.shots', { recursive: true })
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1360, height: 800 }, deviceScaleFactor: 1 })
for (const [k, o] of Object.entries(OPTIONS)) {
  writeFileSync(`.shots/fmap-${k}.html`, `<!doctype html><meta charset="utf-8"><style>${css}</style><header><b>${o.name}</b><span>${o.note}</span></header>${o.html}`)
  await p.goto(url(`.shots/fmap-${k}.html`))
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(150)
  await p.screenshot({ path: `.shots/fmap-${k}.png`, fullPage: true })
  console.log(`.shots/fmap-${k}.png`)
}
await b.close()
