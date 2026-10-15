# Chat, New task, Tasks (approved designs)

Reference images: **`docs/reference/new/*.jpg`** — approved by Adnan. Match them. Copy in this file is final.
Nudge is still an approval app: chat appears only for **starting a task** and **following a task**. Home stays the approval hub.

**Look and feel: follow the patterns people know from the Claude and ChatGPT apps** (Jakob's Law) — user messages in a right-aligned bubble, assistant messages as plain full-width text, tool activity as one collapsible line, a rounded composer at the bottom with + / mic / send. Don't copy their branding, only the patterns.

---

## Task chat — `/task/:id`
Refs: `Chat-approval.jpg`, `Chat-after-approve.jpg`, `Chat-question.jpg`, `Chat-high-risk.jpg`
Opened by: tapping a Home card (anywhere except its buttons/options) · a Working/Completed row on Home · a row in Tasks · after starting a new task.

**Top bar** (solid `--bg`, no divider): back (44) · centre: agent logo (18) + **agent name** (Subhead bold 16) + small chevron, and under it Footnote `--ink-2` "**project · computer**" (e.g. "my-app · Windows PC") · right: **•••** (44) → Task menu.

**Messages** (16px side margins, 18px between turns, opens scrolled to the bottom):
- **Your message:** right-aligned bubble, max 80% width, `--raised`, radius 22, padding 10×16, Body 16/1.45. Under your **first** message only, Footnote `--ink-2`: the Ask-me setting (e.g. "Ask me before every action").
- **Agent turn:** agent logo (20) on its own line, then plain text, Body 16/1.55, full width, no bubble, no name.
- **Tool activity:** one line, `--ink-2` 15px: tool icon + summary ("Read 5 files, edited 3") + chevron. Tap to expand into the list of steps (icon + text, 14px, indented). Collapsed by default.
- **Approval (permission card):** card radius 22, `--surface`. Header line Footnote-ish 14/500 `--ink-2`: "**Claude Code wants to run a command**". Row: risk chip (left) + "back to PC in 8 min" (mono 12, right). Title (Headline). Command box. Buttons: **Deny** (secondary) · **Approve** (primary, fingerprint). **High risk:** **Deny** · **Hold to approve**, and under the card a red warning icon + the risk sentence in 14px `--ink-2` (e.g. "Other people's recent changes on main could be lost.").
  - **No meta row in the chat** (agent / project / time are already in the top bar).
- **After you answer:** the card is replaced by one quiet line: green tick + "You approved · rm -rf dist" (or red ✕ "You denied · …"). The agent continues below.
- **Question:** the agent's question as normal agent text, then the answers as **numbered choices** (field surface, radius 20, number circle 24 mono + label 16). Tap = send that answer. Under them, Footnote: "Or type your own answer below · back to PC in 6 min".
- **Suggested replies:** after an agent message that asks something simple, show secondary pill buttons (e.g. "Yes, run the tests" · "Not now"). Tap = send.
- **Status lines:** centred Footnote + icon for events ("Paused · Windows PC went offline", "Finished · 10:42", "Stopped by you").
- **Working indicator:** while the agent works, the last item is the agent logo + three pulsing dots.

**Composer** (fixed bottom, solid `--bg`, safe area): rounded box (`--field`, radius 26): placeholder "Reply to Claude Code…" (agent name) on top; bottom row: **+** (36 circle, `--raised`) left · **mic** + **send** (36 circle, up arrow; filled `--primary-bg` when there's text, otherwise `rgba(255,255,255,0.12)` dark) right.
- Mic: 2 s "Listening…" then the transcript **drops into the input** to edit and send (no separate voice screen in chats).
- Cursor tasks: composer replaced by info line "Cursor runs in its editor. You can approve its requests here."
- Done/Failed tasks: placeholder "Ask a follow-up…".

**Task menu** (••• → sheet) — ref `Chat-task-menu.jpg`: title **Task** · list: **Model** — Default › · **Intensity** — Medium › · **Ask me** — Every action › · destructive L button with stop icon **Stop task** → existing StopConfirm / TakeOverConfirm / Cursor sheet.

---

## New task — `/new` (tab: New task)
Ref: `NewTask-agents.jpg`
- Large title **New task**.
- Card (`--surface`, radius 26, padding 16) with Subhead bold `--ink-2` "**Who should do it?**" and a **horizontal row of agent tiles**, one per connected agent (3 now; scrolls sideways if more). Tile: `--field`, radius 20, logo 32, name (15/600), status (12, `--ink-2`): "Ready". **Cursor:** 45% opacity, status "Start in Cursor", not tappable (tap shows toast "Cursor can't start tasks from the phone").
- **Recent** (Section title) — last 2–3 tasks as rows (`--field`, radius 18): logo, task title (15/600), project (mono 13), chevron → opens that task's chat.
- Tapping an agent tile → **New task chat**.
- **No folder, computer or safety fields here.** They use defaults (see below).

## New task chat — `/new/:agent`
Refs: `NewTask-chat.jpg`, `AskMe-sheet.jpg`
- Top bar: back · agent logo + **Claude Code** + chevron, sub-line "New task" · •••
- Empty state, centred: agent logo (40) · Title 2 "**What should Claude Code do?**" · Subhead `--ink-2` "**my-app · Windows PC**" + chevron (tap → sheet to change project and computer: FolderPicker list + ChooseComputer) · Footnote "Last used project. Tap to change."
- Suggestions (field rows, radius 18): "Fix the failing tests" · "Add a dark mode" · "Write tests for the login page" — tap fills the composer.
- Composer as in Task chat, placeholder "Message Claude Code…", and next to **+** an **Ask me chip** (raised pill 32 tall, shield icon + "Ask every action" + chevron) → **Ask me sheet**: title **Ask me** · "When should Claude Code check with you?" · options:
  - **Ask me before every action** — Safest when you're away (default)
  - **Ask me only before commands** — It edits files on its own
  - **Just tell me when it's done** — No questions unless it's stuck
- Send → toast "Task started" → this screen becomes the Task chat (`/task/:id`), your message first.
- **Defaults:** agent-specific last used project + computer + Ask-me setting, remembered in `localStorage`. First time ever: project = first recent folder (my-app), computer = Windows PC, Ask me = every action.
- If the default computer is offline: the sub-line shows "Windows PC · offline" and sending shows the alert "Windows PC is offline. Start a task when it's back online."

---

## Tasks — `/tasks` (tab: Tasks)
Refs: `Tasks.jpg`, `Tasks-full-page.jpg`
- Large title **Tasks** · search field "Search tasks or projects" (filters live)
- Filter chips (36, no wrap): **All 8** (selected = `--primary-bg` fill) · **Claude 4** · **Codex 3** · **Cursor 1** (counts in mono)
- Groups (Section title + count), each a `--surface` list (radius 26, hairline dividers):
  - **Needs you** — row chip = risk chip or **Question** chip (message icon, working colours)
  - **Running** — Working / Paused (shows which computer, e.g. "· MacBook")
  - **Done today** — Done / Failed / **Denied** (red ✕ chip)
  - **Earlier** — collapsed, with text link "Show 12"
- Task row: logo 20 · title 16/600 one line ellipsis · "project (mono) · computer" 13 `--ink-2` · status chip · time (mono 13, right). Tap → Task chat.
- Empty: tick + "No tasks yet" + "Start one from New task." + button **New task**.

## Tab bar (updated)
**Home · Tasks · New task · Agents** — ref `Home-with-tasks-tab.jpg`. New task keeps its solid pill. Tasks icon: list with ticks. Red dot on Tasks when something needs you. Width ≈ 340, stronger glass (blur 40).
