// Case study checks (CASE-STUDY-PROMPT.md, "How to work"). Needs the built site served by
// scripts/serve-site.mjs (preview "nudge-site", http://localhost:4174/Nudge/).
//   node scripts/check-case.mjs <round>      e.g. m1-r1
// Writes .shots/case-<round>/: every section at 390 and 1280, plus a full page at each width.
// Reports: console errors, horizontal page scroll (390/768/1280/1440), layout shift, axe
// (WCAG 2.1 AA + best practice), sections that don't open with their visual, images without
// alt/size, words not found anywhere in the case study docs, and the word count.
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import { mkdirSync, readFileSync } from 'node:fs'

const ROUND = process.argv[2] ?? 'dev'
const URL = process.env.CASE_URL ?? 'http://localhost:4174/Nudge/'
const OUT = `.shots/case-${ROUND}`
mkdirSync(OUT, { recursive: true })

// Every visible word must come from the docs. Words a page needs that no doc can supply
// (the skip link, the new-tab note) are listed here.
// The closing and footer: thanks, contact and social links (Adnan asked for them, 2026-10-18).
const UI_WORDS = ['skip', 'to', 'content', 'opens', 'in', 'a', 'new', 'tab',
  'thanks', 'reading', 'say', 'hello', 'linkedin', 'behance', 'medium', 'instagram', 'portfolio', 'resume', 'adnan', 'asif', 'khan', 'adnanasifkhan24', 'gmail', 'com',
  ...Array.from({ length: 13 }, (_, i) => String(i + 1).padStart(2, '0'))] // section numbers "04 · RESEARCH" (style.md)
// Words used only to make titles read as titles (Adnan, 2026-10-18: "every title should feel like
// a title"). They rephrase a decision from content.md; they add no claim.
const TITLE_WORDS = ['checks', 'constraints', 'heard', 'failures', 'explained', 'better', 'countdowns', 'summaries', 'modes', 'installable', 'becoming',
  '42', "i'll", 'update', 'edited', 'pc', '14', 'principle'] // text drawn from real app screens in the small visuals (8:42 timer, chat lines, Windows PC)
const norm = (s) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"')
const words = (s) => norm(s).match(/[a-z0-9]+(?:'[a-z]+)?/g) ?? []
const DOCS = ['content.md', 'visuals.md', 'style.md', 'quotes.json']
  .map((f) => readFileSync(`docs/case-study/${f}`, 'utf8'))
  .join('\n')
const VOCAB = new Set([...words(DOCS), ...UI_WORDS, ...TITLE_WORDS])

const problems = []
const flag = (msg) => problems.push(msg)

const browser = await chromium.launch()

async function open(width, height, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, ...opts })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('requestfailed', (r) => errors.push(`request failed: ${r.url()}`))
  await page.addInitScript(() => {
    window.__cls = 0
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value
    }).observe({ type: 'layout-shift', buffered: true })
  })
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  return { ctx, page, errors }
}

// Scroll top to bottom so every reveal has fired and lazy images have loaded.
async function scrollThrough(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < h; y += 300) {
    await page.evaluate((y) => window.scrollTo(0, y), y)
    await page.waitForTimeout(60)
  }
  // Not networkidle: the embedded prototype keeps its own connections open.
  await page.waitForFunction(() => [...document.images].filter((i) => i.offsetParent && i.getBoundingClientRect().left < innerWidth).every((i) => i.complete), null, { timeout: 15000 })
  await page.waitForTimeout(400)
  await page.evaluate(() => window.scrollTo(0, 0))
}

for (const [width, height] of [
  [390, 844],
  [768, 1024],
  [1280, 800],
  [1440, 900],
]) {
  const { ctx, page, errors } = await open(width, height)
  await scrollThrough(page)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  if (overflow > 0) flag(`${width}: page scrolls sideways by ${overflow}px`)
  const cls = await page.evaluate(() => window.__cls)
  if (cls > 0.01) flag(`${width}: layout shift ${cls.toFixed(3)}`)
  for (const e of errors) flag(`${width}: console: ${e}`)

  if (width === 390 || width === 1280) {
    // Sections + full page
    // The sticky bar would be stitched into the middle of tall section shots.
    await page.addStyleTag({ content: '.bar{visibility:hidden}' })
    const ids = await page.$$eval('main > section[id]', (s) => s.map((x) => x.id))
    for (const id of ids) {
      const el = page.locator(`#${id}`)
      await el.scrollIntoViewIfNeeded()
      await page.waitForTimeout(350)
      await el.screenshot({ path: `${OUT}/${width}-${id}.png` })
    }
    await page.addStyleTag({ content: '.bar{visibility:visible}' })
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({ path: `${OUT}/${width}-full.png`, fullPage: true })

    const axe = await new AxeBuilder({ page }).exclude('iframe').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']).analyze()
    for (const v of axe.violations) flag(`${width}: axe ${v.id} (${v.nodes.length}): ${v.nodes[0]?.target.join(' ')}`)
  }

  if (width === 1280) {
    // Each section opens with its visual: the first thing after the label is marked data-visual.
    const notVisualFirst = await page.$$eval('main > section.section .section-body', (bodies) =>
      bodies
        .filter((b) => {
          const first = b.querySelector(':scope > .label + *')
          return !first || !first.hasAttribute('data-visual')
        })
        .map((b) => b.closest('section').id),
    )
    for (const id of notVisualFirst) flag(`section #${id} doesn't open with its visual`)

    // Images: alt text, intrinsic size, lazy below the hero
    const imgs = await page.$$eval('img', (list) =>
      list.map((i) => ({ src: i.currentSrc.split('/').pop(), alt: i.getAttribute('alt'), w: i.getAttribute('width'), h: i.getAttribute('height'), lazy: i.loading === 'lazy', hero: !!i.closest('.hero') })),
    )
    for (const i of imgs) {
      if (i.alt === null) flag(`img ${i.src}: no alt`)
      if (!i.w || !i.h) flag(`img ${i.src}: no width/height`)
      if (!i.hero && !i.lazy) flag(`img ${i.src}: not lazy`)
    }

    // Copy: visible words that appear in none of the docs
    const text = await page.evaluate(() => {
      const hidden = [...document.querySelectorAll('.sr')]
      hidden.forEach((h) => (h.dataset.t = h.textContent, (h.textContent = '')))
      const t = document.body.innerText
      hidden.forEach((h) => (h.textContent = h.dataset.t))
      return t
    })
    const unknown = [...new Set(words(text).filter((w) => !VOCAB.has(w)))]
    if (unknown.length) flag(`words not in the docs: ${unknown.join(', ')}`)

    // Word count: prose = everything in <main> outside the visuals
    const counts = await page.evaluate(() => {
      const count = (s) => (s.match(/[A-Za-z0-9’']+/g) ?? []).length
      const main = document.querySelector('main')
      const all = count(main.innerText)
      const visual = [...main.querySelectorAll('[data-visual]')].reduce((n, v) => n + count(v.innerText), 0)
      return { all, visual, prose: all - visual }
    })
    console.log(`words: ${counts.prose} prose + ${counts.visual} in visuals = ${counts.all}`)
  }
  await ctx.close()
}

// Flowchart tabs: click and arrow keys switch panels; one panel shows at a time.
{
  const { ctx, page } = await open(1280, 800)
  const shown = () => page.$$eval('.fc-panel', (ps) => ps.filter((p) => getComputedStyle(p).display !== 'none').map((p) => p.id).join())
  await page.click('#tab-home')
  if ((await shown()) !== 'fc-home') flag(`tabs: click Home shows ${await shown()}`)
  await page.keyboard.press('ArrowRight')
  const focused = await page.evaluate(() => document.activeElement.id)
  if (focused !== 'tab-questions' || (await shown()) !== 'fc-questions') flag(`tabs: ArrowRight → ${focused} / ${await shown()}`)
  await page.keyboard.press('End')
  if ((await shown()) !== 'fc-running') flag(`tabs: End shows ${await shown()}`)
  await ctx.close()
}

// Reduced motion: nothing is left hidden waiting for a reveal.
{
  const { ctx, page } = await open(1280, 800, { reducedMotion: 'reduce' })
  const hidden = await page.$$eval('.reveal, .stagger > *', (els) => els.filter((e) => getComputedStyle(e).opacity !== '1').length)
  if (hidden) flag(`reduced motion: ${hidden} blocks still hidden`)
  await ctx.close()
}

await browser.close()
console.log(problems.length ? problems.map((p) => `✗ ${p}`).join('\n') : '✓ no problems')
console.log(`shots: ${OUT}`)
