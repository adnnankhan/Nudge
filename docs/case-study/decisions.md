# Case study — small calls made while building

Small decisions I made myself (logged so they can be reversed). Bigger ones were asked.

## M1

1. **Build:** plain HTML/CSS + vanilla JS in `case-study/`, bundled by a second Vite config (`vite.case.config.ts`) into `site/`; the prototype still builds into `site/app/` first. The case build clears `site/` except `app/`. `npm run build` does both.
2. **Images:** `scripts/case-images.mjs` (sharp) makes AVIF + WebP at half and full width and a PNG fallback into `case-study/img/`, committed so the deploy doesn't depend on sharp. In the HTML a screen is `<img data-shot="name" …>`; the build expands it into a sized `<picture>` (lazy unless marked eager).
3. **Fonts:** the @fontsource latin files of Plex Sans 400/500/600 and Mono 400/500, Sans 400 and 600 preloaded. These files have no "→" glyph, so arrows in text will be drawn as small inline SVGs (M2).
4. **Hero label** "Case study · 2026" as in the mockup; section labels zero-padded ("02 · Key screens") as in style.md. The progress text in the top bar uses the same label, and is hidden below 640px wide, where it doesn't fit next to the button.
5. **Prototype buttons open a new tab** so the reader keeps their place; screen readers hear "(opens in a new tab)".
6. **Headings:** the hero h1, then each section's label is its h2 (so section names are what a screen reader lists); subsections will be h3.
7. **Key screens on phones and tablets (below 1024px)** scroll sideways inside their own box with snap; the box is focusable so it can be scrolled with a keyboard.
8. **Hero headline** scales with the window (40–72px), so it stays on three lines like the mockup at 1280 and 1440.
9. **Not shown:** the name in the mockup's header ("Adnan Asif Khan"), because content.md doesn't include it. Waiting on Adnan.

## M2–M4

10. **Open questions answered with defaults (Adnan to confirm):** section 8 keeps the feasibility re-check but not the other app's name ("an app built on the same idea"), because the brief says never to mention another project; the name stays out of the header; "installs to the home screen" stays (the prototype is an installable PWA) without the "[confirm]" tag.
11. **Each section:** label (h2) → visual (marked `data-visual`) → bold decision headline with its reason underneath → points as "**decision** — why" cards, two columns on desktop. Subsections of Research are h3.
12. **Problem:** the four cards are the visual; the problem statement keeps content.md's wording; "How might we" closes the section as a large pull line. Card titles follow content.md ("The session can drop").
13. **Research:** the relay node is outlined and carries the lock; "One approval, step by step" is a `<details>` toggle. The facts table scrolls inside its own box on phones. The "what the facts showed" list is cut because the table shows the same six rows; the brief's three rules become points with their reasons.
14. **Quotes:** written in at build time from quotes.json, confirmed only. None are confirmed, so none show; the "10–12 people" point stays.
15. **Arrows** in text are SVG (the Plex files have no "→"); screen readers still hear "→".
16. **Flows** are HTML lists, not images, so they read in order with a screen reader. Edge cases amber (the one colour in flowcharts), alternatives dashed. On phones the branches drop under their step.
17. **Flowcharts** as tabs (arrow keys, Home/End). Without JavaScript every chart shows one after another. "New task" carries a "before feedback" badge.
18. **Prototype embed:** the live app loads into a phone frame only on screens ≥ 900px wide and only when the section is near; phones get three screens and the button instead, so they never load the app twice. It opens on Sign in, as a first visit does.
19. **Design section:** logo tiles (in-app mark, dark tile, light tile, lockup) sit under the before → after row; the optional second row of explored directions was left out to keep the section short.
20. **Trim:** prose 2,079 words (visual labels not counted). Cut: the facts list (the table shows it), "You always know what happened to your answer" (the user-flow chart shows those edge cases), and repeats of "Home shows what's waiting first" (covered in Key screens and Design).
21. **Share:** og.png (1200×630) made from the hero by `scripts/case-og.mjs`; apple-touch-icon from the app icon; canonical URL.
22. **Deploy:** the workflow still runs `npm run build` (now both pages), checks that `site/index.html`, `site/app/index.html` and `site/og.png` exist, and links the deployment to the site root.

## Redesign pass (Adnan's feedback, 2026-10-18)

23. **One accent: Claude orange (#D97757, the app's `--claude`)**, as Adnan asked ("orange and white as in app"). It marks numbers, icon tiles, ticks, moving packets and the "How might we" lead; flowchart edge cases switch from amber to it, so the page never shows two warm colours. Risk colours stay on risk chips only. This overrides style.md's "colour only for risk/status" for the page itself, not the app.
24. **Key screens:** captions cut to a few words each, still decision — why.
25. **Problem:** four equal cards with an icon, number, title and one line each of about the same length; Windows kept in card 02.
26. **Research — Can it be built:** the architecture diagram gets icons, an "End-to-end encrypted" tag and moving packets; the six points became tiles with small graphs: a capability matrix (Claude Code, Codex, Cursor × approvals, questions, control), the encryption path (QR → lock → phone), cost ("Free tier"), undo (files vs commands bars), and constraint → what the user sees. Tile labels use content.md words (Agents, Encryption, Cost, Undo, Technical).
27. **Research — Is the problem real:** the brief is a prompt bar with its three rules as chips (each with its reason); the table became six fact → change cards with the assumption underneath. "What people told me" is one number card (10–12).
28. **Design system:** the rationale moved onto the board (one note per card); points cut from 7 to 4.
29. **Points everywhere:** numbered in the accent, bold decision on its own line, reason underneath (screen readers still hear "decision — reason").
30. **Motion:** cards rise in one after another; cards lift on hover; packets travel the connection lines three times; ticks pop in; the undo bar fills; the brief's caret blinks five times. All off with reduced motion; nothing loops for long.
31. **Prose 1,740 words**, under the earlier 1,800 floor, because Adnan asked to cut text.
32. **Local server gzips** like GitHub Pages, so local Lighthouse matches what visitors get (mobile 99, desktop 100).

## Second feedback pass (2026-10-18)

33. **Card style A · Editorial**, chosen by Adnan from four options (`scripts/case-card-options.mjs`): text items have no boxes (hairline rule, big orange number, title, reason); diagrams, tiles and boards share one faint frame; hover brightens a rule or edge instead of lifting.
34. **No dashes** in visible text. Every point is a short title that reads as a title, with the reason as a sentence underneath; section titles are short ("Two checks before any design") with the reasoning in the line below. A few title words aren't in content.md (listed as TITLE_WORDS in check-case.mjs); they rephrase decisions and add no claims.
35. **Hero description** cut to two sentences.
36. **Centred:** section labels, titles, reasons, subsection titles, "How might we", diagram captions, rows of screens, flows, tabs, legends. The hero stays split (text left, phones right).
37. **One spacing rhythm** in `layout.css`: label → visual 48, visual → title 72, title → points 40, before a subsection 120 (phones: 32 / 48 / 28 / 72).
38. **Every screen in a row is the same size** (196px wide on desktop, 200 in phone scrollers, cropped to the same shape); the helper wireframe's window matches the phones' height. Only the hero phones and the live embed differ, on purpose.
39. **Prose 1,572 words.**

## Closing and publish (2026-10-18)

40. **Closing section** ("Thanks for reading"), as Adnan asked: the Nudge mark, one line restating the "How might we" as what Nudge does, Open the prototype + Say hello (email), and social links taken from his live portfolio (LinkedIn, Behance, Medium, Instagram, Portfolio, Resume) as text pills with an outward arrow, since lucide has no brand logos. The footer now names him (Adnan Asif Khan · Product Designer · 2026) with his email, matching his other case studies.

## Point visuals (2026-10-19)

41. **One decision at a time** and **Better by removing things**: each point has its own small visual, drawn in code above its title and reason (Adnan asked for "the particular visuals near the text", not rows of screens). Design system: grey layout with risk colours arriving last, a 44 pt target on an 8-point grid, a glass tab bar over blurred content, the type ramp. Design: Needs you → Working → Completed, the tab bar with + in the centre and Settings top-right, a struck-out 8:42 ring → "3 min ago", tap vs hold by risk, an alert with only the icon coloured, a black-and-white summary, grey vs dark background, the mark with rings opening, dark and light halves. Decorative to screen readers; motion only on arrival and off with reduced motion.

## Feature map (2026-10-19)

42. **Concept feature map rebuilt as "Hub and spokes"** (option A of four, `scripts/case-fmap-options.mjs`, chosen by Adnan and then made consistent): Home (the hub) in the centre with the ring mark; Setup and Control on the left, Approvals and questions on the right at full height; a dashed orange spoke with a dot joins each group to the hub. Every group is the same framed tile (icon, title, count, checklist). Later (dashed) and Cut sit below as an even pair. Tablet: hub across the top, groups in two columns; phones: one column, no spokes.
