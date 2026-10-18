Build the Nudge case study page in this repo.

CONTEXT
- This repo already hosts the live Nudge prototype at https://adnnankhan.github.io/Nudge/app/ (built into site/app/). Do NOT change or break it.
- The case study goes at https://adnnankhan.github.io/Nudge/ (the site root, site/index.html), with buttons that open the prototype.
- It's a standalone case study: never mention, compare to or borrow from any other project.

READ FIRST (don't write code before this)
- docs/case-study/content.md — the FULL content, 13 sections, in order. This is the only source of text.
- docs/case-study/visuals.md — what each section shows, with the data for every diagram.
- docs/case-study/style.md — tokens, layout, behaviour.
- docs/case-study/quotes.json — quotes (only confirmed ones may appear).
- docs/case-study/reference/*.png — mockups of the look. Match the feel and layout, but rebuild every diagram natively (the mockup still shows some white document images — don't copy those).
- case-study/assets/ — app screenshots and logos.
Then tell me in a few lines what you understood, and anything unclear or contradictory.

THE TWO RULES THAT MATTER MOST
1. Key screens and rationale first. Every section opens with its visual, then one bold decision line, then short points. Every point is a decision and its reason ("decision — why"). A senior designer reviewed it: it must be scannable, with little text.
2. Visuals in the same dark style as the page. Build every diagram, table, flowchart, feature map, sketch card and design-system board in HTML/CSS/SVG using the tokens — no white placeholders, no screenshots of documents. Only real app screens are images, shown in phone frames.

TRIMMING THE TEXT (we're using the full version, trimmed while building)
- Keep every decision and its reason. Cut repetition, filler and anything the visual already shows.
- Aim for roughly 1,800–2,200 words in total; a point should rarely go past ~25 words.
- Never add new claims, numbers, quotes or reasons. If trimming would lose a reason, keep the reason.
- Keep the problem statement's meaning exactly (section 3); you may shorten its wording only slightly.
- Sentence case, short, plain, human. No generic designer phrases.
- Quotes: render only those with "confirmed": true in quotes.json. Right now none are confirmed, so show none — keep the "10–12 people" line.

QUALITY BAR
- Fast: static page (plain HTML/CSS + a little vanilla JS, or Vite multi-page if you prefer), Lighthouse Performance and Accessibility ≥ 95, images lazy-loaded and sized (no layout shift), self-hosted IBM Plex.
- Works everywhere: 390, 768, 1280 and 1440 widths; wide diagrams scroll inside their own box on phones, never the whole page.
- Accessible: real headings in order, alt text on every screen image, diagrams with text alternatives, visible focus, WCAG AA contrast, reduced motion respected.
- Share-ready: page title, meta description, Open Graph image (make one from the hero), favicon from the Nudge mark.
- Deploy: update the existing GitHub Action so the case study builds into site/ and the prototype still builds into site/app/. After deploying, check both URLs work.

HOW TO WORK
Build in 4 milestones; stop after each for my go-ahead:
- M1 · Skeleton, tokens, fonts, sticky top bar, hero, Key screens
- M2 · Problem, Research (diagram, facts table, prompt card), Concept (feature map + sketch cards), User flow
- M3 · Flowcharts (all tabs), Wireframes, Moodboard, Design system board, Design, Prototype (embedded), Feedback and iteration
- M4 · Trim pass, polish, performance, accessibility, OG image, deploy setup
After each milestone run this cycle, at most 3 rounds, then stop even if small issues remain:
1. Build and open it. Use Playwright to screenshot every section at 390 and 1280.
2. Check: does each section open with its visual? Is every point "decision — why"? Is any text not from content.md? Are any visuals white/off-style? Do diagrams match the data in visuals.md? Any console errors, layout shift, horizontal page scroll, contrast failures (run axe)?
3. Fix what you found.
Then report: what's done, what each round found and fixed, anything still not right and why, the word count, and the 390 + 1280 screenshots next to the reference mockups. Wait for my go-ahead.
Don't deploy until I say so.

Start now: read everything, give me your summary and questions, then build M1.
