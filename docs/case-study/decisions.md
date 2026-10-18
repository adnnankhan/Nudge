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
