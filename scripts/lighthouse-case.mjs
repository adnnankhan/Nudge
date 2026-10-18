// Lighthouse on the case study, mobile and desktop, first visit. Needs scripts/serve-site.mjs
// (preview "nudge-site"). CHROME_PATH = a Chromium-based browser (default: Edge). LH_RUNS repeats.
//   node scripts/lighthouse-case.mjs [outDir]
import * as chromeLauncher from 'chrome-launcher'
import lighthouse from 'lighthouse'
import desktopConfig from 'lighthouse/core/config/desktop-config.js'
import { mkdirSync, writeFileSync } from 'node:fs'

const out = process.argv[2] ?? '.shots/lh-case'
mkdirSync(out, { recursive: true })
const URL = process.env.CASE_URL ?? 'http://localhost:4174/Nudge/'
const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const RUNS = Number(process.env.LH_RUNS ?? 1)

for (const form of ['mobile', 'desktop']) {
  for (let run = 0; run < RUNS; run++) {
    const chrome = await chromeLauncher.launch({ chromePath: CHROME, chromeFlags: ['--headless=new'] })
    const result = await lighthouse(
      URL,
      { port: chrome.port, output: 'html', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] },
      form === 'desktop' ? desktopConfig : undefined,
    )
    await chrome.kill()
    const lhr = result.lhr
    writeFileSync(`${out}/${form}-${run}.html`, result.report)
    const score = (c) => Math.round(lhr.categories[c].score * 100)
    const a = lhr.audits
    console.log(
      `${form}: perf ${score('performance')} · a11y ${score('accessibility')} · bp ${score('best-practices')} · seo ${score('seo')}` +
        ` | LCP ${a['largest-contentful-paint'].displayValue} · TBT ${a['total-blocking-time'].displayValue} · CLS ${a['cumulative-layout-shift'].displayValue}`,
    )
    for (const [id, audit] of Object.entries(a)) {
      if (audit.score !== null && audit.score < 0.9 && audit.scoreDisplayMode !== 'informative' && audit.scoreDisplayMode !== 'notApplicable' && audit.scoreDisplayMode !== 'manual')
        console.log(`   ✗ ${id}: ${audit.displayValue ?? ''} ${audit.title}`)
    }
  }
}
