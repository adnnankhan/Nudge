# Home

## Home — `/` (tab: Home)
Refs: `Home.jpg` (top), `HomeScrolled.jpg` (lower part of the same screen)
One scrolling screen, top to bottom:
1. **Header**: Nudge mark + **Nudge** (Title 3, next to the mark) · Settings icon button (→ Settings). Note: the dark reference shows only the mark — the name was added after the design; follow this doc.
2. **Computer switcher** pill: green dot · **Windows PC** · "· awake" · chevron → opens Computer menu
3. **Summary card**: Waiting · Working · Completed (live counts from fake data)
4. **Needs you** + count — request cards, oldest first:
   - When **2 or more low-risk** requests are waiting, show an **Approve all** bar first (ref `docs/reference/new/Home-with-tasks-tab.jpg`): surface radius 20, green shield + "3 low-risk requests" + primary M button with fingerprint **Approve all** → **one** Face ID approves all of them → toast "3 approved · running". Medium and high are never included.
   - Approval card (see `03-approvals.md`): **Deny** (secondary) · **Approve** (primary, fingerprint) — or **Review** for high risk
   - Question card (see `04-questions.md`): tap an option = send it immediately; or type in "Or write your own answer"
   - **Tapping the card anywhere except its buttons/options opens the Task thread (chat)** — see `09-chat-and-tasks.md`.
5. **Working** + count — session rows (tap → Task thread)
6. **Completed today** + count — session rows (tap → Task thread; the thread shows the Done/Failed summary from SessionDone/SessionFailed below)
7. Footnote: "Completed sessions clear after 24 hours"
- Floating **tab bar** (Home · Tasks · New task · Agents) at the bottom; content scrolls under it (blurred).
- Home stays exactly as designed — no other changes from the chat work.
- Pull down to refresh (fake: spinner 0.6 s).
- Coming back to Home (from a chat or any screen) returns to **the same scroll position**.
- When the app is open, a new request shows **only the in-app banner** — never a phone notification as well.

## HomeWarnings — state of `/`
Ref: `HomeWarnings.jpg`
Shown when the demo menu sets "computer offline" (see flows):
- Switcher shows grey dot + "· offline"
- Alerts at top: warning "Notifications are off. You'll miss requests." (**Turn on**) · error "Windows PC is offline · last seen 2 min ago" · info "Codex disconnected after an update. Reconnect on your computer."
- Section **Paused** 2: Claude Code · portfolio · chip Paused · "Paused until your computer is back" · 2m — and Claude Code · my-app · chip Paused · "Usage limit · continues at 3:45 pm" · 18m

## HomeEmpty — state of `/`
Ref: `HomeEmpty.jpg`
When nothing is waiting/working/completed: summary 0 · 0 · 0, centred tick, **No sessions yet**, "Start a task here, or start one on your computer and it will show up.", primary **New task** (+) → New task.
(When only "Needs you" is empty but others exist, show a small line under Needs you: "You're all caught up".)

## ComputerSwitcher — menu over Home
Ref: `ComputerSwitcher.jpg`
- Menu under the pill: **Windows PC** (green dot, "Awake · 3 sessions", tick) · **MacBook** (amber dot, "Asleep") · **Mac 2** (grey dot, "Offline · last seen 1 day ago") · divider · **+ Add a computer** (→ AddComputer)
- Picking a computer switches Home to that computer's fake data. Tap outside closes.

## AddComputer — `/computers/add`
Ref: light `AddComputer.jpg` (no dark version exists — build it in dark with the same layout)
- Top bar: **Add a computer** · Title **Add another computer** · "Same steps as before, on the new computer."
- Numbered steps: 1 Install the helper (On the new computer) · 2 Connect its agents (Tap Yes for each one) · 3 Scan its code (With this phone)
- Bottom: secondary **Email me the link** · primary with QR **Scan the code** (→ Scan, then back to Home)

## SessionDone — `/session/:id` (status done)
Ref: `SessionDone.jpg`
- Top bar: Cursor logo · **Cursor · site**
- Chip **Done** · title **Added a contact form to the homepage** · "Finished 10 min ago"
- **What it did**: "Added a contact form to the homepage, updated 3 files and ran the tests. All passed."
- **Files changed** list (file icons): index.html · styles/contact.css · scripts/form.js
- Footnote "Clears from Home in 3 h."
- Bottom primary: **Start a follow-up task** → New task prefilled (agent Cursor is not allowed → use Claude Code; show the Cursor note)

## SessionFailed — `/session/:id` (status failed)
Ref: `SessionFailed.jpg`
- Top bar: Codex logo · **Codex · docs**
- Chip **Failed** · title **Stopped: tests didn't pass**
- **Why it stopped**: red warning icon + "2 tests failing in docs.test.js"
- **What it did before**: "Rewrote the setup guide and updated 2 files."
- Answer input: "Tell the agent what to do next" (mic)
- Footnote "Clears from Home in 20 h."
- Bottom primary with arrow: **Send to agent** → toast "Sent to Codex", session becomes Working.
