# Tech

## Stack (decided — don't swap)
- **Vite + React + TypeScript**
- **React Router** with `createHashRouter` (URLs like `/Nudge/app/#/request/abc` — refresh and deep links work on GitHub Pages without 404s)
- **Zustand** for the fake-data store (tiny), persisted to `localStorage`
- **CSS Modules or plain CSS with variables** for tokens (no Tailwind, no UI kit) — keeps the bundle small and the design exact
- **Framer Motion** *only if* the budget allows; otherwise CSS transitions + the Web Animations API
- **lucide-react** icons (import individually)
- **@fontsource/ibm-plex-sans** (400/500/600) + **@fontsource/ibm-plex-mono** (400), `font-display: swap`
- **vite-plugin-pwa** (Workbox) for install + offline

## Performance budget (it must open fast)
- JS ≤ **150 KB gzipped** on first load; lazy-load demo screens (lock screens, helper, states).
- First paint ≤ **1 s** on a mid-range phone on 4G; Lighthouse Performance ≥ 95, Accessibility ≥ 95, PWA installable.
- Precache the app shell, fonts and brand SVGs; second open is instant and works offline.
- No images bigger than needed; all logos are SVG.

## Works everywhere
- Phones (iOS Safari, Android Chrome): full screen, `viewport-fit=cover`, `env(safe-area-inset-*)` for notch and home indicator, `100dvh` (not `100vh`).
- Installable: manifest `display: standalone`, `theme_color: #0E0F12`, `background_color: #0E0F12`, icons from `public/brand/app-icon.svg` (export 192/512 PNG + maskable), iOS `apple-touch-icon` 180 PNG, `apple-mobile-web-app-status-bar-style: black-translucent`.
- Desktop (Mac, Windows, any laptop): phone frame centred (see `flows.md`). Keyboard: Tab/Enter/Space work on everything; Esc closes sheets; `D` opens the demo menu.
- Touch feel: `touch-action: manipulation` (no double-tap zoom delay), no text selection on buttons, `-webkit-tap-highlight-color: transparent`, pressed states on every tappable thing. Inputs ≥ 16px font so iOS doesn't zoom.
- Haptics: `navigator.vibrate(10)` where supported (Android); silently skip elsewhere (iPhone browsers don't support it).

## Accessibility
Real `<button>`s and `<a>`s, labelled icon buttons, focus rings (2px `--ink` offset 2), `aria-live="polite"` for toasts and banners, sheets trap focus, colour never the only signal, `prefers-reduced-motion` respected.

## Folder structure
```
src/
  app/            router, providers, phone frame
  theme/          tokens.css (dark + light), global.css
  components/     Button, HoldButton, Chip, TextField, CodeInput, AnswerOption, AnswerInput,
                  OptionRow, FormField, Toggle, ListGroup, ListRow, AgentRow, InlineAlert,
                  ProgressStep, NumberedStep, SummaryCard, SectionTitle, RequestCard,
                  QuestionCard, SessionRow, HomeHeader, TopBar, BottomBar, TabBar, Sheet,
                  ComputerMenu, Banner, Toast, FaceIdSheet, LockNotification, EmptyState
  screens/        onboarding/, home/, requests/, session/, newtask/, agents/, settings/, demo/
  data/           store.ts, library.ts (requests from fake-data.md), simulation.ts (timers)
public/brand/     logos (already provided)
```

## Deploy to GitHub Pages (repo: `Nudge`)
- The app lives at **`https://adnnankhan.github.io/Nudge/app/`** (the case study will later sit at `/Nudge/`).
- `vite.config.ts`: `base: '/Nudge/app/'`. PWA `scope` and `start_url`: `/Nudge/app/`.
- Build output goes to `site/app/` (so the case study can later live in `site/`).
- GitHub Action (`.github/workflows/deploy.yml`): on push to `main` → `npm ci` → `npm run build` → upload `site/` with `actions/upload-pages-artifact` → `actions/deploy-pages`. In repo Settings → Pages, set Source to **GitHub Actions**.
- After deploy, check: the URL loads, a deep link (e.g. `#/settings`) loads after refresh, it installs to the Home Screen, and it opens offline.
