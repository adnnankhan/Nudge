# Nudge — prototype

Approve and answer your coding agents from anywhere. Clickable prototype with fake data.
Live (after deploy): https://adnnankhan.github.io/Nudge/app/

## Run it

```bash
npm install
npm run dev        # http://localhost:5173/Nudge/app/
npm run build      # → site/app/
npm run preview    # http://localhost:4173/Nudge/app/ (the built app, with offline support)
```

- First visit starts at **Sign in** (any email and password; password `wrong` shows the error).
- **Demo menu**: press `D`, or long-press the Nudge mark on Home. It sends requests, fails sessions, turns the computer offline, opens the lock screens, the computer helper and the states screens, and resets the demo.
- **Light mode**: Settings → Appearance → Dark mode.
- On a computer the app sits in a phone frame; on a phone it fills the screen and installs to the Home Screen.

## Tests (run against `npm run preview`)

| Script | What it checks |
|---|---|
| `node scripts/check-sim.mjs` | The living app: arrivals, sessions finishing, time to answer, refresh, demo menu (fake clock) |
| `node scripts/check-flow.mjs` | The main loop on Home: approve / deny / high risk / questions / plan / offline / banners |
| `node scripts/check-m5.mjs` | Sessions, new task, agents, settings |
| `node scripts/check-m6.mjs` | Sign in and setup, first-visit routing |
| `node scripts/check-m7.mjs` | Lock screens, computer helper, states screens |
| `node scripts/check-pwa.mjs` | Installable, offline, deep links after refresh |
| `node scripts/check.mjs m7` | Screenshots (phone + desktop, dark + light), axe, console, 44pt targets, copy, colours, JS budget |
| `node scripts/lighthouse.mjs` | Lighthouse, mobile + desktop, as a first visit |
| `node scripts/compare-ref.mjs <out> Name=/route` | Reference · app · difference overlay |

`BROWSER=webkit node scripts/check-flow.mjs` runs a suite in Safari's engine.

## Deploy (GitHub Pages)

1. Create the GitHub repo **Nudge** (`adnnankhan/Nudge`) and push this folder to `main`.
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml` (build → upload `site/` → deploy). The app is served at `/Nudge/app/`; `/Nudge/` is left for the case study.

## What's here
- `CLAUDE.md` — rules for every session
- `docs/` — product, design system, screens (final copy), flows, fake data, tech, build order, **decisions** (incl. every small call made while building)
- `docs/reference/` — the design references
- `src/` — `app/` (shell, routing, feedback), `theme/` (tokens), `components/` (every component once), `screens/`, `data/` (store, library, simulation)
- `public/brand/`, `public/icons/` — logos and the exported app icons
