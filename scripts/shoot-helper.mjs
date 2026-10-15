// Screenshots of the computer helper (outside the phone frame): node scripts/shoot-helper.mjs <outDir>
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { SETUP_DONE } from './testState.mjs'
const out = process.argv[2]
mkdirSync(out, { recursive: true })
const b = await chromium.launch()
for (const [vp, size] of [['desktop', { width: 1280, height: 800 }], ['phone', { width: 390, height: 844 }]]) {
  for (const theme of ['dark', 'light']) {
    const p = await b.newPage({ viewport: size, deviceScaleFactor: 2, reducedMotion: 'reduce' })
    await p.addInitScript(([s, t]) => {
      const st = JSON.parse(s)
      st.state.theme = t
      localStorage.setItem('nudge-proto-v1', JSON.stringify(st))
    }, [SETUP_DONE, theme])
    for (const step of ['pair', 'connect', 'status']) {
      await p.goto(`http://localhost:4173/Nudge/app/#/demo/helper/${step}`, { waitUntil: 'networkidle' })
      await p.waitForTimeout(400)
      await p.screenshot({ path: `${out}/helper-${step}-${vp}-${theme}.png` })
    }
    await p.close()
  }
}
await b.close()
