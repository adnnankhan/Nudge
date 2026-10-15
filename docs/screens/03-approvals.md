# Approvals

## Approval card (on Home)
- Meta: agent logo · **Claude Code** · `my-app` (mono, grey) · `2 min ago` (mono, grey, right)
- Risk chip · title (Headline) · command box (mono)
- Buttons: **Deny** (secondary) · **Approve** (primary, fingerprint icon). High risk: **Review** (no icon) instead of Approve.
- Footnote: "Goes back to your computer after 10 min"
- **Approve** → Face ID sheet → success → card collapses out of Needs you → toast "Approved · running" → session appears in Working.
- **Deny** → card collapses → toast "Denied" with **Undo** (4 s) → session goes to Completed today as "Denied".
- **Review** → ApprovalHighRisk.

## ApprovalDetail (low) — `/request/:id`
Ref: `ApprovalDetail.jpg`
- Top bar: agent logo · **Claude Code · my-app** · trailing `1 of 3` (position in the queue)
- Chip **Low risk** · "Needs your approval · 3 min ago" · title **Delete the old build folder**
- **Command**: `rm -rf dist`
- **What this does**: green shield icon + "Deletes the old build folder. Your code isn't touched."
- **Before this**: "Updated 3 files for the login page."
- Footnote "Goes back to your computer after 10 min"
- Bottom: **Deny** (secondary) · **Approve** (primary, fingerprint, wider)
- After approve/deny: go to ApprovalSent, or straight to the next request if the user came from the queue.

## ApprovalMedium — `/request/:id`
Ref: `ApprovalMedium.jpg`
Same layout. Chip **Medium risk** · title **Install a new package** · command `npm install jsonwebtoken@9` · amber icon + "Adds a library to the project and changes package.json. It downloads code from the internet." · Before this: "Set up the login form and wrote two tests." · `2 of 3`.

## ApprovalHighRisk — `/request/:id`
Ref: `ApprovalHighRisk.jpg`
- Top bar: **Claude Code · portfolio** · `3 of 3`
- Chip **High risk** · "Needs your approval · 6 min ago" · title **Force-push to main**
- Command `git push --force origin main`
- Red warning icon + "Replaces the main branch on GitHub with your local version. Other people's recent changes on main could be lost."
- Before this: "Finished the login page and committed it."
- Bottom: **Deny** · **Hold to approve** (hold 1.2 s; fill sweeps; release early cancels with a shake + hint "Keep holding to approve") → Face ID → ApprovalSent.

## ApprovalQueue — `/queue/:agent`
Ref: `ApprovalQueue.jpg`
- Top bar: Codex logo · **Codex · api**
- Title **3 requests waiting** · "Review them one at a time. The oldest is first."
- Three compact cards: Low risk · **Install a package** · `npm install zod` — Medium risk · **Change config file** · `edit .env.example` — High risk · **Delete a folder** · `rm -rf migrations/old`
- Bottom primary: **Review one by one** → first request (with `1 of 3`)

## ApprovalSent — `/request/:id/sent`
Ref: `ApprovalSent.jpg`
- Chip **Approved** · title **Delete the old build folder** · command box
- Card with progress steps that advance on a timer: **Sent** (done) → **Reached your computer** (done after 0.8 s) → **Running** (current, spinner)
- Bottom: secondary **Back to Home** · primary **Next request (2 of 3)** (hidden when none left)

## ApprovalStates — demo screen `/demo/states`
Ref: `ApprovalStates.jpg` (dark shows placeholders — use this copy)
Title **Approval and answer states** · "Messages shown in place of the buttons when something goes wrong."
Inline alerts, in this order:
1. error · "Not sent: no internet connection. Nothing was sent." · **Retry**
2. error · "Didn't reach your computer. Your answer was sent but not received." · **Retry**
3. info · "Answered on your computer. This request was handled there."
4. warning · "Too late. This request went back to your computer." · **Message agent**
5. warning · "Face ID didn't match. Use your phone passcode instead." · **Use passcode**
6. info · "AI explanation is off. Showing the risk level and command only."
7. error · "Type an answer first."
These also appear in context: e.g. turning "offline mode" on in the demo menu makes Approve show alert 1 instead of sending.

## Face ID rule (don't ask twice)
- **Low and medium:** after one successful Face ID, further low/medium approvals skip it for **5 minutes** (a small "Face ID · still verified" line shows on the button press instead of the sheet).
- **High risk:** always **Hold to approve + Face ID**, every time (they check different things: that you meant it, and that it's you).
- **Approve all** (Home): one Face ID for all the low-risk requests it approves.

## Face ID sheet (component)
Small sheet: fingerprint/face icon animates 0.9 s → tick → closes automatically. Text: "Confirm it's you" → "Done". Cancel link closes without approving.
