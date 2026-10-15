# Build order

Do these in order. After each milestone: run it on a phone-sized viewport, check every "done when", commit, and tell Adnan what changed.

## M1 · Foundation
Vite + React + TS, router (hash), tokens (dark + light), fonts, global styles, phone frame on desktop, theme switch stored in `localStorage`.
**Done when:** a blank screen shows in the phone frame on desktop and full screen on a phone; toggling `data-theme` swaps every token; first load JS < 60 KB.

## M2 · Components
Every component in `design-system.md` §5, with all states, on a hidden route `/#/dev/components` (dark and light side by side).
**Done when:** each component matches the dark references; all touch targets ≥ 44; focus rings visible; nothing hard-codes a colour.

## M3 · Fake data + simulation
Store, request library, timers, persistence, demo menu (`flows.md`).
**Done when:** requests arrive on their own, sessions progress and finish, refresh keeps state, "Reset demo" works.

## M4 · Home and requests
Home (all sections, warnings, empty), computer menu, approval cards (Approve → Face ID, Deny → Undo, Review), all approval screens, hold to approve, ApprovalSent, queue, questions (option tap sends), AnswerQuestion, VoiceAnswer, PlanReview, banners and toasts.
**Done when:** the "Main loop" in `flows.md` works end to end with no dead taps; high risk can never be approved in one tap.

## M5 · Sessions, new task, agents, settings
All of `05-session-control.md`, `06-new-task.md`, `07-agents-settings.md`, incl. the Dark mode toggle.
**Done when:** every row and button goes somewhere or does something; Light mode looks right on every screen.

## M5b · Chat, New task, Tasks
Task chat (Claude/ChatGPT pattern), New task (agent tiles → new task chat, defaults, Ask me chip + sheet), Tasks tab, 4-item tab bar, Approve all bar, Face ID 5-minute rule, inline voice (`09-chat-and-tasks.md`, `02`, `03`, `04`), fake threads + tasks (`fake-data.md`). Match `docs/reference/new/`.
**Done when:** every Home card, Working/Completed row and Tasks row opens its thread; approving/answering inside a thread updates Home and Tasks; sending a message gets a fake reply; a new task opens its thread; Cursor's limits show correctly.

## M6 · Onboarding
All of `01-onboarding.md`. First visit starts here; later visits skip to Home.
**Done when:** fresh browser → sign in → setup → Home works with no dead ends; wrong password and expired code states show.

## M7 · Demo screens
Lock-screen previews, computer helper, Approval states, New task states (`08-…`, `03-…`, `06-…`). Lazy-loaded.

## M8 · PWA, polish, deploy
Manifest, icons, offline, performance budget, accessibility pass, GitHub Action deploy to `/Nudge/app/`.
**Done when:** Lighthouse Perf ≥ 95 / A11y ≥ 95 / installable; works on iPhone Safari, Android Chrome, Mac and Windows browsers; installs to Home Screen and opens offline; deep links survive refresh.
