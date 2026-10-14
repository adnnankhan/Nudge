# Questions

## Question card (on Home)
- Meta: Codex logo · **Codex** · `api` · `5 min ago`
- Question: **Which login method should I add?**
- Options: **1 Email and password** · **2 Google sign-in** — tap = send immediately (short "Sent" tick on the option, then the card collapses → toast "Answer sent to Codex").
- Answer input "Or write your own answer" (mic). Typing shows the send button.
- Footnote "Goes back to your computer after 10 min"
- Tapping the question text opens AnswerQuestion.

## AnswerQuestion — `/request/:id` (question)
Ref: `AnswerQuestion.jpg`
- Top bar: Codex logo · **Codex · api** · `2 of 2`
- "Asked you a question · 5 min ago" · title **Which login method should I add?**
- **Why it's asking**: "It's adding sign-in to the login page. Both options work with the current setup."
- Options 1 **Email and password** · 2 **Google sign-in** (here tapping selects; doesn't send) · answer input last
- Footnote "Goes back to your computer after 10 min"
- Bottom: secondary **Answer later** (→ back) · primary with arrow **Send answer** (disabled until an option is picked or text typed; empty text + tap shows "Type an answer first.")

## VoiceAnswer — `/request/:id/voice`
Ref: `VoiceAnswer.jpg`
Reached by tapping the mic. Prototype: show a 2 s "Listening…" wave, then the transcript.
- Top bar: Codex logo · **Codex · api**
- Title **Your answer** · "Check the text before sending. Fix any wrong words."
- **Transcript** (editable field): "Use email and password, and add a forgot password link under the form."
- Bottom: secondary with mic **Record again** · primary with arrow **Send**

## PlanReview — `/request/:id` (plan)
Ref: `PlanReview.jpg`
- Top bar: Claude logo · **Claude Code · portfolio**
- "Plan ready for review · 6 min ago" · title **Add sign-in to the portfolio**
- **Summary** card with ticks: Add a sign-in form with email and password · Add a forgot password page · Write tests for both
- Text link **Read full plan** → expands to these steps (fake sample, use as written):
  1. Create `LoginForm.tsx` with email and password fields
  2. Add a "Forgot password?" link that opens a reset page
  3. Create `ResetPassword.tsx` that sends a reset email
  4. Add tests for signing in and resetting the password
  5. Run the tests and fix anything that fails
- Bottom: secondary **Ask for changes** (opens answer input) · primary **Approve plan**
