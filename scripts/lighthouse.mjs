// Lighthouse on key screens, mobile and desktop, as a first visit (no service worker, no cache).
// Usage: node scripts/lighthouse.mjs <outDir>   (CHROME_PATH = a Chromium-based browser; default: Edge)
import * as chromeLauncher from 'chrome-launcher'
import { chromium } from 'playwright'
import lighthouse from 'lighthouse'
import desktopConfig from 'lighthouse/core/config/desktop-config.js'
import { mkdirSync, writeFileSync } from 'node:fs'

const out = process.argv[2] ?? '.shots/lh'
mkdirSync(out, { recursive: true })
const BASE = 'http://localhost:4173/Nudge/app/'
const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
// Sign in is what a new visitor loads first; Home is what everyone else opens; Settings is a lazy screen.
const SCREENS = [
  ['signin', '#/signin', false],
  ['home', '#/', true],
  ['settings', '#/settings', true],
]

const summary = []
for (const [name, route, setUp] of SCREENS) {
  for (const form of ['mobile', 'desktop']) {
    const chrome = await chromeLauncher.launch({ chromePath: CHROME, chromeFlags: ['--headless=new'] })
    // Prepare: saved user for set-up screens, and nothing cached.
    const b = await chromium.connectOverCDP(`http://127.0.0.1:${chrome.port}`)
    const ctx = b.contexts()[0]
    const p = await ctx.newPage()
    await p.goto(BASE + '#/signin')
    await p.evaluate((s) => {
      localStorage.clear()
      if (s) localStorage.setItem('nudge-proto-v1', JSON.stringify({ state: { signedIn: true, onboarded: true }, version: 4 }))
    }, setUp)
    const cdp = await ctx.newCDPSession(p)
    await cdp.send('Storage.clearDataForOrigin', { origin: 'http://localhost:4173', storageTypes: 'service_workers,cache_storage' })
    await cdp.send('Network.clearBrowserCache')
    await p.close()

    const r = await lighthouse(
      BASE + route,
      { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices'], disableStorageReset: true },
      form === 'desktop' ? desktopConfig : undefined,
    )
    await b.close().catch(() => {})
    chrome.kill()
    writeFileSync(`${out}/${name}-${form}.json`, r.report)
    const lhr = r.lhr
    const score = Object.fromEntries(Object.entries(lhr.categories).map(([k, v]) => [k, Math.round(v.score * 100)]))
    const failing = Object.values(lhr.audits)
      .filter((a) => a.score !== null && a.score < 0.9 && !['informative', 'manual', 'notApplicable'].includes(a.scoreDisplayMode))
      .map((a) => `${a.id}${a.displayValue ? ` (${a.displayValue})` : ''}`)
    summary.push({
      name,
      form,
      error: lhr.runtimeError?.code,
      ...score,
      FCP: lhr.audits['first-contentful-paint']?.displayValue,
      LCP: lhr.audits['largest-contentful-paint']?.displayValue,
      TBT: lhr.audits['total-blocking-time']?.displayValue,
      CLS: lhr.audits['cumulative-layout-shift']?.displayValue,
      SI: lhr.audits['speed-index']?.displayValue,
      failing,
    })
  }
}
for (const s of summary) console.log(JSON.stringify(s))
writeFileSync(`${out}/summary.json`, JSON.stringify(summary, null, 2))
