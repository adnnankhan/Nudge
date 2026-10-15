# Design system

Dark is the main mode. Light is a switch in Settings (`Settings → Appearance`). Build everything from the tokens below as CSS variables on `:root[data-theme="dark"]` and `:root[data-theme="light"]`. Default theme: **dark**. Remember the choice in `localStorage`.

Visual source of truth: `docs/reference/dark/*.jpg`. When this doc and an image disagree on **look**, follow the image. When they disagree on **text**, follow `docs/screens`.

## 1. Colour tokens

| Token | Dark (main) | Light | Use |
|---|---|---|---|
| `--bg` | `#0E0F12` | `#FFFFFF` | Screen background, top/bottom bars (solid, no divider) |
| `--surface` | `rgba(255,255,255,0.065)` ≈ `#1E1F21` | `rgba(255,255,255,0.62)` + glass | Cards, list groups, summary card |
| `--field` | `rgba(255,255,255,0.04)` ≈ `#17181C` | `rgba(255,255,255,0.7)` + 1px hairline | Text fields, command box, answer options, option rows |
| `--raised` | `rgba(255,255,255,0.10)` ≈ `#26272B` | `rgba(255,255,255,0.58)` + glass | Secondary buttons (Deny, Answer later, Google), icon buttons, switcher |
| `--pressed` | `rgba(255,255,255,0.16)` | `#EBEBEB` | Pressed state of raised buttons and rows |
| `--ink` | `#F5F5F7` | `#0A0A0A` | Main text, icons |
| `--ink-2` | `#A1A1A6` | `#5C5C5F` | Secondary text (times, captions, labels) |
| `--hairline` | `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.08)` | Dividers inside lists, field borders (light only) |
| `--primary-bg` | `#F5F5F7` | `#0A0A0A` | Primary buttons (Approve, Sign in, Send answer), New task pill, toggle "on" track |
| `--primary-fg` | `#0E0F12` | `#FFFFFF` | Text/icons on primary |
| `--scrim` | `rgba(0,0,0,0.5)` | `rgba(10,10,10,0.3)` | Behind sheets |
| `--sheet` | `#1C1D21` | `#FFFFFF` | Bottom sheets, menus, in-app banner |

**Risk and status colours** (text/icon on background):

| Kind | Dark fg / bg | Light fg / bg | Used for |
|---|---|---|---|
| Low / Done / Connected / Approved | `#7FDDA0` / `#132A1C` | `#1E5E2E` / `#E2F0E4` | Low risk, Done, Connected, Approved, online dot |
| Medium | `#FFC46B` / `#2E230F` | `#7A4A00` / `#FAEBD2` | Medium risk, warnings, "asleep" dot |
| High / Failed / Error | `#FF9A8F` / `#331715` | `#A3170E` / `#FBE5E2` | High risk, Failed, errors, destructive actions |
| Working / Paused / Stopped | `#C9CDD3` / `#24272C` | `#3E3C36` / `#ECE9E2` | Working, Paused, Stopped |

Agent logo colours: Claude `#D97757` (both modes). Codex and Cursor use `--ink`.
All text pairs above pass WCAG AA (4.5:1) on their background.

## 2. Type
Fonts: **IBM Plex Sans** (UI) and **IBM Plex Mono** (commands, project names, times). Self-host via `@fontsource/ibm-plex-sans` (400, 500, 600) and `@fontsource/ibm-plex-mono` (400) — no Google Fonts request (faster, works offline).

| Style | Size / line-height / weight | Use |
|---|---|---|
| Large title | 28–34 / 1.1 / 600 | Screen titles on top-level screens ("New task", "Agents", "Sign in") |
| Title 2 | 22 / 1.25 / 600 | Opened request title, sheet titles |
| Title 3 | 20 / 1.2 / 600 | Section titles ("Needs you"), app name |
| Stat number | 28 / 1 / 600 | Summary card numbers |
| Headline | 17 / 1.3 / 600 | Card titles, option titles, large button labels |
| Body | 17 / 1.45 / 400 | Body text, field values, row titles |
| Callout bold | 16 / 1.25 / 600 | Medium button labels |
| Subhead bold | 15 / 1.2 / 600 | Agent names, top-bar titles |
| Subhead | 15 / 1.4 / 400 | Descriptions, alert text |
| Footnote | 13 / 1.35 / 400 | Captions, "Goes back to your computer after 10 min" |
| Footnote bold | 13 / 1.25 / 600 | Field labels, list group headers, chip labels |
| Tab label | 10 / 1.2 / 500 (600 active) | Tab bar |
| Mono command | 15 / 1.35 / 400 mono | Commands |
| Mono project | 14 / 1.2 / 400 mono | Project names (`my-app`) |
| Mono time | 13 / 1.2 / 400 mono | Times (`2 min ago`, `10:42`, `1 of 3`) |

## 3. Spacing and shape
8-point grid. Screen side margin **16**. Card padding **16**. Inside a card **8–12**. Between cards **12**. Between sections **24**.

Radius: command box **12** · fields / summary card / answer options **24** · cards & list groups **26** · tab bar **32** · sheets **38** · buttons **full pill**.

Heights: buttons **44** (in cards) / **56** (bottom bars) · fields **48** · answer options min **48** · list rows min **52** · tab bar **64** · chips **28** (not tappable).

## 4. Glass and depth
- **Dark:** surfaces are flat tints of white on `--bg` (see tokens) with a very subtle 0.5px inner edge `rgba(255,255,255,0.045)` on cards. No glow.
- **Light:** cards and raised buttons are frosted glass: `backdrop-filter: blur(28px) saturate(170%)` (cards) / `blur(22px)` (buttons), inner top highlight `inset 0 1px 0 #fff`, 0.5px inner edge `rgba(0,0,0,0.035–0.07)`, soft shadow `0 10px 28px rgba(0,0,0,0.06)`.
- **Tab bar (both modes, stronger):** `backdrop-filter: blur(40px) saturate(180%)`; dark fill `rgba(30,30,32,0.72)`, light fill `rgba(255,255,255,0.72)`; shadow `0 8px 24px rgba(0,0,0,0.5)` dark / `0.10` light. Content scrolling under it must turn into haze.
- **Top and bottom bars on opened screens:** solid `--bg`, **no divider line**.
- Sheets and menus: solid `--sheet`, radius 38 (menus 26), shadow `0 20px 50px rgba(0,0,0,0.4)` dark / `0.18` light.

## 5. Components (build each once, reuse)
Look at the dark references for each one. States listed must all exist.

| Component | Variants / states | Notes |
|---|---|---|
| **Button** | Primary · Secondary (raised) · Destructive · Text link · Hold to approve; sizes M (44) / L (56); states default · pressed (scale 0.97 + `--pressed`) · disabled (40% opacity) | Optional leading icon (Face ID fingerprint on Approve, arrow on Send). Text link = underline-free in dark reference, ink colour, 600 weight. |
| **Hold button** | idle · holding (fill sweeps left→right over 1.2 s) · done | Release early = cancel with a small shake. Label "Hold to approve". |
| **Icon button** | 44×44 circle, `--raised` | Settings (sliders icon), back arrow (no background in top bar). |
| **Chip** | Low risk · Medium risk · High risk · Working · Paused · Stopped · Done · Approved · Connected · Failed | 28 tall, icon + word, risk colours. |
| **Text field** | default · focused (1.5px `--ink` ring) · filled · error (1.5px high-risk ring + red message below) · disabled; Password has 44×44 eye toggle | Label above (Footnote bold). |
| **Code input** | 6 cells 48×56, mono 22; empty · active · filled · error | Auto-advance, paste fills all. |
| **Answer input** | empty · focused · typed (send button appears) | "Or write your own answer" + mic. |
| **Answer option** | default · selected (1.5px ink ring, filled number circle) | Number circle + label. Tapping on Home = send immediately. |
| **Option row** (pickers) | default · selected (ring + filled radio) · disabled (50%) | Title + description, optional agent logo. |
| **Form field** (New task) | default · placeholder · with note · disabled | Label + value + chevron, opens a picker sheet. |
| **Toggle** | on · off · disabled | 51×31. Dark: on = white track + dark knob. |
| **List group + rows** | row types: navigation (value + chevron) · value · toggle · two-line · action (text button) · destructive | Group header (Footnote bold, `--ink-2`), hairline dividers inset 16. |
| **Agent row** | connected · disconnected · not connected | Logo + name + capabilities + dot + status word. |
| **Inline alert** | warning · error · info, optional action link | Neutral surface; **only the icon is coloured**. |
| **Progress step** | done · current (spinner) · pending | Sent → Reached your computer → Running. |
| **Numbered step** | — | Setup steps (1, 2, 3). |
| **Summary card** | — | Waiting · Working · Completed, numbers + icon + label, hairline dividers. |
| **Section title** | with/without count | "Needs you 2". |
| **Request card · Approval** | low · medium · high (High shows **Review**, no fingerprint icon) | Meta row (logo, agent, project mono, time mono) → chip → title → command box → Deny / Approve → "Goes back to your computer after 10 min". |
| **Request card · Question** | — | Meta → question → options → answer input → footnote. |
| **Session row** | working · paused · done · failed | Meta row + chip + one-line status text (ellipsis). |
| **Header (Home)** | — | Nudge mark + name "Nudge" (Title 3) · Settings icon button · computer switcher pill (status dot + name + "· awake" + chevron). |
| **Top bar** | title only · title + count (`1 of 3`) · title + action | Back arrow left, centred title (optional agent logo), trailing mono count. Solid, no divider. |
| **Bottom action bar** | one · two (secondary + primary, primary wider) · stacked | Solid, 34px bottom padding for home indicator. |
| **Tab bar** | Home · Tasks · New task (solid pill) · Agents; active = bubble + 600 label + filled icon; dot badge on Tasks | Floating, centred, ≈340 wide, bottom 24 (+ safe area). |
| **Chat: your message** | — | Right bubble, max 80%, `--raised`, radius 22, Body 16; Ask-me line only under the first message. (Claude/ChatGPT pattern) |
| **Chat: agent message** | — | Logo (20) on its own line, then plain full-width text 16/1.55, no bubble, no name. |
| **Tool activity** | collapsed (one summary line + chevron) · expanded (step list) | `--ink-2` 15px, tool icon. |
| **Permission card** (approval in chat) | low · medium · high (Hold to approve + risk line) · answered (one line) | Header "X wants to run a command", chip + "back to PC in N min", title, command, buttons. No meta row. |
| **Answer choices** (question in chat) | default · sent | Numbered field rows, tap = send. |
| **Suggested replies** | — | Secondary pills under an agent message. |
| **Agent tile** (New task) | ready · disabled ("Start in Cursor") | Field surface, radius 20, logo 32, name, status. |
| **Ask me chip** | — | Raised pill 32 tall in the composer, shield + setting + chevron. |
| **Approve all bar** | — | Home, ≥ 2 low-risk requests. |
| **Status line** | — | Centred Footnote + icon (paused, finished, stopped). |
| **Typing indicator** | — | Logo + 3 pulsing dots + "Working…". |
| **Composer** | empty · typing (send filled) · listening · disabled (info line) | Rounded box radius 26: text on top; + (and Ask me chip on new tasks) left; mic + up-arrow send right. |
| **Agent chip** | default · selected (ring) · disabled | 44 tall, logo + name. |
| **Context chip** | default · filled | Computer / folder / Ask me; 36 tall, 44 hit area, chevron. |
| **Filter chip** | default · selected | Tasks filters with mono counts. |
| **Task row** | needs you · running · done · failed · stopped | Logo, title, project + computer, chip, time; min 64. |
| **Bottom sheet** | — | Handle, title, body, buttons; slides up, drag down to close, scrim tap closes. |
| **Computer menu** | — | Drops under the switcher: computers with dot + status, check on current, "Add a computer". |
| **In-app banner** | request · not sent (Retry) | Slides down from top when a fake request arrives while the app is open. |
| **Face ID sheet** | scanning · success | Simulated: 0.9 s scan animation, then success tick. |
| **Lock-screen notification** | approval · question · info | Only for the "Lock screen" demo screens. |
| **Loading / Empty state** | — | Spinner or tick, title, body, optional link. |

## 6. Icons
Line icons, 24 grid, 1.75 stroke, round caps. Use **lucide-react** (tree-shaken) with these names: home, plus, laptop, sliders-horizontal, chevron-left, chevron-right, chevron-down, fingerprint, mic, arrow-right, shield-check, circle-alert, triangle-alert, loader (spinning), check, x, hourglass, eye, eye-off, pause, info, folder, smartphone, refresh-cw, square (stop), undo-2, qr-code, mail, bell, moon, file, terminal, search, list-checks, message-circle, more-horizontal. Active Home tab uses a filled house.

## 7. Motion (keep it subtle and quick)
- Screen push/pop: 260 ms slide + fade, `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- Sheets: 300 ms slide up; scrim fades.
- Card leaving "Needs you" after approve: collapse 220 ms, then appears in "Working".
- Respect `prefers-reduced-motion` (fade only).
- Press feedback on everything tappable (scale 0.97, 100 ms).
