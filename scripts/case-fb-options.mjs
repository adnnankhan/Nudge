// Three ways to make the Feedback changes scannable, with the real content.
//   node scripts/case-fb-options.mjs   → .shots/fb-a.png, fb-b.png, fb-c.png
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const url = (p) => pathToFileURL(resolve(p)).href
const font = (pkg, w) => url(`node_modules/@fontsource/${pkg}/files/${pkg}-latin-${w}-normal.woff2`)
const P = {
  check: '<path d="M20 6 9 17l-5-5"/>', x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>', down: '<path d="m6 9 6 6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>', mic: '<path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
}
const ic = (k) => `<svg class="ic" viewBox="0 0 24 24">${P[k]}</svg>`
const POINTS = [
  ['Chat in three places only', 'A Home card opens its chat, New task opens a chat after you pick an agent, and Tasks lists every task. Home stays the approval hub.'],
  ['Patterns people already know', 'Like Claude and ChatGPT (Jakob’s Law): your messages on the right, the agent’s as plain text, tool activity as one collapsible line.'],
  ['New task lost its form', 'Filling fields was the friction people described. Your last project and computer are used automatically, shown as one line you can tap to change.'],
  ['“Ask me”, not everything', 'The agent comes to you only when you want it to: before every action, only before commands, or just when it’s done.'],
  ['Nothing asks twice', 'I walked the flows as a frustrated user and removed every repeated question.'],
]
const TWICE = ['New task remembers your choices', 'Cards don’t repeat who and where', 'Voice drops into the message box', 'An open app shows one banner', 'Home keeps your place', 'One check covers low and medium for 5 min']
const V = [
  `<div class="mv v-three"><span>Home card</span><span>New task</span><span>Tasks tab</span><i class="arrow">${ic('right')}</i><b>Chat</b></div>`,
  `<div class="mv v-chat"><span class="me">Clean up the build</span><span class="agent">On it. I’ll update the login page first.</span><span class="tool">${ic('wrench')}Read 5 files, edited 3 ${ic('right')}</span></div>`,
  `<div class="mv v-form"><div class="old"><i></i><i></i><i></i><i></i></div><i class="arrow">${ic('right')}</i><span class="one">my-app · Windows PC ${ic('down')}</span></div>`,
  `<div class="mv v-ask"><span class="on">${ic('shield')}Ask every action</span><span>Only before commands</span><span>Just when it’s done</span></div>`,
  `<div class="mv v-twice"><span>${ic('check')}Remembers choices</span><span>${ic('check')}One banner</span><span>${ic('check')}Keeps your place</span><span>${ic('check')}One check, 5 min</span></div>`,
]
const css = `
@font-face{font-family:Plex;font-weight:400;src:url(${font('ibm-plex-sans', 400)})}
@font-face{font-family:Plex;font-weight:500;src:url(${font('ibm-plex-sans', 500)})}
@font-face{font-family:Plex;font-weight:600;src:url(${font('ibm-plex-sans', 600)})}
@font-face{font-family:Mono;font-weight:400;src:url(${font('ibm-plex-mono', 400)})}
*{box-sizing:border-box;margin:0;padding:0}ul,ol{list-style:none}
body{background:#0e0f12;color:#b4b4b9;font:400 15px/1.5 Plex;padding:48px 56px;width:1360px}
header{margin-bottom:36px;text-align:center}header b{display:block;color:#f5f5f7;font:600 26px/1.2 Plex}header span{display:block;margin-top:8px;color:#a1a1a6}
.ic{width:13px;height:13px;flex:none;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
h4{color:#f5f5f7;font:600 18px/1.3 Plex}p{margin-top:6px;font-size:15px;line-height:1.5}
.mv{position:relative;display:flex;align-items:center;justify-content:center;height:150px;overflow:hidden;border:1px solid rgba(255,255,255,.075);border-radius:20px;background:rgba(255,255,255,.018);color:#f5f5f7;font-size:12.5px}
.v-three{display:grid;grid-template-columns:auto auto auto;grid-template-rows:auto auto;gap:8px 6px;align-content:center;justify-content:center}
.v-three span{padding:5px 9px;border-radius:999px;background:rgba(255,255,255,.07)}
.v-three .arrow{grid-column:1/-1;justify-self:center;color:#d97757;transform:rotate(90deg)}
.v-three b{grid-column:1/-1;justify-self:center;padding:6px 14px;border-radius:999px;background:#f5f5f7;color:#0e0f12;font-weight:600}
.v-chat{flex-direction:column;align-items:stretch;gap:8px;padding:0 16px}.v-chat .me{align-self:flex-end;padding:6px 10px;border-radius:12px;background:rgba(255,255,255,.1)}
.v-chat .agent{color:#e4e4e7}.v-chat .tool{display:flex;align-items:center;gap:6px;color:#a1a1a6;font-size:12px}
.v-form{gap:12px}.v-form .old{display:grid;gap:6px;width:70px;opacity:.4}.v-form .old i{height:12px;border-radius:4px;border:1px solid rgba(255,255,255,.4)}
.v-form .arrow{color:#d97757}.v-form .one{display:flex;align-items:center;gap:6px;padding:7px 12px;border-radius:999px;background:rgba(255,255,255,.08);font:400 12.5px Plex;color:#e4e4e7}
.v-ask{flex-direction:column;gap:6px}.v-ask span{display:flex;align-items:center;gap:6px;width:180px;padding:6px 10px;border-radius:10px;background:rgba(255,255,255,.05);color:#b4b4b9}
.v-ask .on{background:rgba(217,119,87,.14);color:#f5f5f7;box-shadow:inset 0 0 0 1px rgba(217,119,87,.5)}.v-ask .on .ic{color:#d97757}
.v-twice{flex-wrap:wrap;gap:6px;padding:0 14px;align-content:center}.v-twice span{display:flex;align-items:center;gap:5px;padding:5px 9px;border-radius:999px;background:rgba(255,255,255,.06);font-size:12px}.v-twice .ic{color:#d97757}
/* A */
.ga{display:grid;grid-template-columns:repeat(5,1fr);gap:20px}.ga .mv{margin-bottom:18px}.ga p{font-size:14.5px}
/* B: grouped by what people said */
.gb{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.theme{padding:26px;border:1px solid rgba(255,255,255,.075);border-radius:24px;background:rgba(255,255,255,.018)}
.theme>.said{display:flex;gap:10px;align-items:baseline;margin-bottom:22px;padding-bottom:18px;border-bottom:1px solid rgba(255,255,255,.1)}
.said em{flex:none;padding:2px 9px;border-radius:999px;background:rgba(255,255,255,.07);color:#a1a1a6;font:400 11px Mono;font-style:normal}
.said b{color:#f5f5f7;font:600 20px/1.3 Plex}
.pair{display:grid;grid-template-columns:200px 1fr;gap:18px;align-items:center}.pair+.pair{margin-top:18px}.pair .mv{height:120px}
.strip{grid-column:1/-1;display:grid;grid-template-columns:auto 1fr;gap:24px;align-items:center;padding:22px 26px;border:1px solid rgba(217,119,87,.4);border-radius:24px}
.strip ul{display:flex;flex-wrap:wrap;gap:8px}.strip li{display:flex;align-items:center;gap:6px;padding:6px 11px;border-radius:999px;background:rgba(255,255,255,.06);color:#e4e4e7;font-size:13.5px}.strip li .ic{color:#d97757}
/* C: annotated screen */
.gc{display:grid;grid-template-columns:300px 1fr;gap:64px;align-items:center}
.ph{position:relative;border-radius:34px;box-shadow:0 0 0 7px #1a1b1f,0 0 0 8px #2a2b2f,0 30px 60px rgba(0,0,0,.5)}.ph img{display:block;width:100%;border-radius:34px}
.pin{position:absolute;display:grid;place-items:center;width:28px;height:28px;margin:-14px 0 0 -14px;border-radius:50%;background:#d97757;color:#0e0f12;font:600 13px Plex;box-shadow:0 0 0 5px rgba(217,119,87,.25)}
.legend li{display:grid;grid-template-columns:30px 1fr;gap:16px;padding:18px 0;border-top:1px solid rgba(255,255,255,.12)}.legend li:last-child{border-bottom:1px solid rgba(255,255,255,.12)}
.legend .n{display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:#d97757;color:#0e0f12;font:600 13px Plex}
`
const OPTIONS = {
  a: { name: 'A · A visual for each change', note: 'A small drawing above each change, like Design.', html: `<ul class="ga">${POINTS.map(([t, r], i) => `<li>${V[i]}<h4>${t}</h4><p>${i === 4 ? r : r}</p></li>`).join('')}</ul>` },
  b: {
    name: 'B · Grouped by what people said',
    note: 'Two feedback themes, each with the changes it caused. The removed repeats sit in one strip.',
    html: `<div class="gb">
      <div class="theme"><div class="said"><em>Feedback</em><b>A chat-based way to work was missing</b></div>
        <div class="pair">${V[0]}<div><h4>${POINTS[0][0]}</h4><p>${POINTS[0][1]}</p></div></div>
        <div class="pair">${V[1]}<div><h4>${POINTS[1][0]}</h4><p>${POINTS[1][1]}</p></div></div></div>
      <div class="theme"><div class="said"><em>Feedback</em><b>Adding a new task felt complicated</b></div>
        <div class="pair">${V[2]}<div><h4>${POINTS[2][0]}</h4><p>${POINTS[2][1]}</p></div></div>
        <div class="pair">${V[3]}<div><h4>${POINTS[3][0]}</h4><p>${POINTS[3][1]}</p></div></div></div>
      <div class="strip"><div><h4>${POINTS[4][0]}</h4><p>${POINTS[4][1]}</p></div><ul>${TWICE.map((t) => `<li>${ic('check')}${t}</li>`).join('')}</ul></div>
    </div>`,
  },
  c: {
    name: 'C · Annotated chat screen',
    note: 'The new chat with numbered pins on what changed, like Wireframes, and the changes as a legend.',
    html: `<div class="gc"><div class="ph"><img src="${url('case-study/assets/final-newchat.png')}">
      <span class="pin" style="left:78%;top:8.5%">1</span><span class="pin" style="left:6%;top:88.5%">2</span><span class="pin" style="left:76%;top:32.6%">3</span><span class="pin" style="left:38%;top:89%">4</span><span class="pin" style="left:80%;top:89%">5</span></div>
      <ul class="legend">${POINTS.map(([t, r], i) => `<li><span class="n">${i + 1}</span><div><h4>${t}</h4><p>${i === 4 ? 'Voice drops straight into the message box, New task remembers your choices, and one check covers low and medium for 5 minutes.' : r}</p></div></li>`).join('')}</ul></div>`,
  },
}
mkdirSync('.shots', { recursive: true })
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1360, height: 800 } })
for (const [k, o] of Object.entries(OPTIONS)) {
  writeFileSync(`.shots/fb-${k}.html`, `<!doctype html><meta charset="utf-8"><style>${css}</style><header><b>${o.name}</b><span>${o.note}</span></header>${o.html}`)
  await p.goto(url(`.shots/fb-${k}.html`))
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(200)
  await p.screenshot({ path: `.shots/fb-${k}.png`, fullPage: true })
  console.log(`.shots/fb-${k}.png`)
}
await b.close()
