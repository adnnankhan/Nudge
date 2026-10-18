# Style — the case study looks like the app

Match `docs/case-study/reference/nudge-case-study-full-part*.png` for layout and feel (but rebuild every diagram natively — the reference still shows some white document images; those must NOT be copied).

## Tokens
- Background `#0E0F12` · Surface `rgba(255,255,255,0.065)` · Raised `rgba(255,255,255,0.10)` · Edge `inset 0 0 0 0.5px rgba(255,255,255,0.05)`
- Ink `#F5F5F7` · Secondary `#A1A1A6` · Body text `#B4B4B9` · Divider `rgba(255,255,255,0.06)`
- Risk colours (only for risk/status chips and, in flowcharts, edge cases): low `#7FDDA0`/`#132A1C` · medium `#FFC46B`/`#2E230F` · high `#FF9A8F`/`#331715` · working `#C9CDD3`/`#24272C`
- Fonts: **IBM Plex Sans** (400/500/600) + **IBM Plex Mono** (400/500), self-hosted (`@fontsource`), `font-display: swap`

## Layout
- Desktop: content width 1248 (page 1440), side padding 96 · Tablet: 32 · Phone (≤ 480): 20
- Section: label (mono 14, `--ink-2`, letter-spacing .06em, e.g. "04 · RESEARCH") → **visual first** → headline (bold lead line) → short points
- Hero h1 72/1.03, −2px (phone: 40) · section headline 34/1.2 · body 17–18/1.6 · points 17/1.55
- Phone frames: screenshot radius 36, ring `0 0 0 7px #1A1B1F, 0 0 0 8px #2A2B2F`, shadow `0 30px 60px rgba(0,0,0,.5)`
- Cards radius 20–26 · buttons full pill: primary `#F5F5F7` on `#0E0F12` text, secondary `rgba(255,255,255,0.10)`
- Points: 2-column grid of small cards on desktop, 1 column on phone
- Glass only on the sticky top bar (blur 20) — nowhere decorative

## Behaviour
- Sticky slim top bar: Nudge mark + "Nudge" · section progress (current section name) · **Open the prototype** button
- Subtle reveal on scroll (fade + 12px rise, 300 ms) — disabled for `prefers-reduced-motion`
- Images lazy-loaded, sized (no layout shift), WebP/AVIF with PNG fallback
