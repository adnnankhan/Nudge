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
