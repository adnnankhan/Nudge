import type { AgentId, AskMe, Computer, LibraryItem, Phone, Settings } from './types'

/**
 * Request library — docs/fake-data.md (approvals, questions) and docs/screens/04-questions.md (plan).
 * Copy is final; decisions.md (4) approves the extra sample requests, the second question's
 * options and the full plan steps as written.
 */
export const LIBRARY: LibraryItem[] = [
  {
    kind: 'approval',
    agent: 'claude',
    project: 'my-app',
    risk: 'low',
    title: 'Delete the old build folder',
    command: 'rm -rf dist',
    what: 'Deletes the old build folder. Your code isn’t touched.',
    before: 'Updated 3 files for the login page.',
  },
  {
    kind: 'approval',
    agent: 'claude',
    project: 'my-app',
    risk: 'medium',
    title: 'Install a new package',
    command: 'npm install jsonwebtoken@9',
    what: 'Adds a library to the project and changes package.json. It downloads code from the internet.',
    before: 'Set up the login form and wrote two tests.',
  },
  {
    kind: 'approval',
    agent: 'claude',
    project: 'portfolio',
    risk: 'high',
    title: 'Force-push to main',
    command: 'git push --force origin main',
    what: 'Replaces the main branch on GitHub with your local version. Other people’s recent changes on main could be lost.',
    before: 'Finished the login page and committed it.',
  },
  {
    kind: 'approval',
    agent: 'codex',
    project: 'api',
    risk: 'low',
    title: 'Install a package',
    command: 'npm install zod',
    what: 'Adds a small library for checking data.',
    before: 'Started the sign-up form.',
  },
  {
    kind: 'approval',
    agent: 'codex',
    project: 'api',
    risk: 'medium',
    title: 'Change config file',
    command: 'edit .env.example',
    what: 'Changes an example settings file. Real secrets aren’t touched.',
    before: 'Added the database settings.',
  },
  {
    kind: 'approval',
    agent: 'codex',
    project: 'api',
    risk: 'high',
    title: 'Delete a folder',
    command: 'rm -rf migrations/old',
    what: 'Deletes old database migration files. They can’t be restored from here.',
    before: 'Wrote new migrations.',
  },
  {
    kind: 'question',
    agent: 'codex',
    project: 'api',
    title: 'Which login method should I add?',
    options: ['Email and password', 'Google sign-in'],
    why: 'It’s adding sign-in to the login page. Both options work with the current setup.',
  },
  {
    kind: 'question',
    agent: 'claude',
    project: 'my-app',
    title: 'How should errors be shown on the login page?',
    options: ['Under each field', 'One message at the top'],
  },
  {
    kind: 'plan',
    agent: 'claude',
    project: 'portfolio',
    title: 'Add sign-in to the portfolio',
    summary: ['Add a sign-in form with email and password', 'Add a forgot password page', 'Write tests for both'],
    steps: [
      'Create LoginForm.tsx with email and password fields',
      'Add a “Forgot password?” link that opens a reset page',
      'Create ResetPassword.tsx that sends a reset email',
      'Add tests for signing in and resetting the password',
      'Run the tests and fix anything that fails',
    ],
  },
]

/** Library indexes used by the demo menu's "Send a … request". */
export const DEMO_PICKS = {
  low: [0, 3],
  medium: [1, 4],
  high: [2, 5],
  question: [6, 7],
  plan: [8],
} as const

/** Lines a working session adds to Recent every ~6 s (fake-data.md → Living app). */
export const RECENT_LINES = ['Read 3 files', 'Updated LoginForm.tsx', 'Ran the tests']

/** Progress lines added to a task thread (fake-data.md → Task threads, step pool). */
export const STEP_POOL = [
  'Read 3 files',
  'Updated LoginForm.tsx',
  'Created ResetPassword.tsx',
  'Ran the tests · 12 passed',
  'Updated routes.ts',
  'Fixed a type error',
  'Updated the README',
]

/** Fake reply to anything you send in a thread (fake-data.md). */
export const REPLY = 'Got it — I’ll do that next.'

/** Ask me options (09-chat-and-tasks.md). `chip` is the composer chip; `short` is the Task menu value. */
export const ASK_ME: Record<AskMe, { title: string; description: string; chip: string; short: string }> = {
  every: { title: 'Ask me before every action', description: 'Safest when you’re away', chip: 'Ask every action', short: 'Every action' },
  commands: { title: 'Ask me only before commands', description: 'It edits files on its own', chip: 'Ask before commands', short: 'Only commands' },
  done: { title: 'Just tell me when it’s done', description: 'No questions unless it’s stuck', chip: 'Tell me when done', short: 'When done' },
}

/** Project folders (06-new-task.md → FolderPicker). */
export const FOLDERS = [
  { name: 'my-app', path: 'C:\\Users\\you\\projects\\my-app' },
  { name: 'portfolio', path: 'C:\\Users\\you\\projects\\portfolio' },
  { name: 'api-server', path: 'C:\\Users\\you\\work\\api-server' },
]

/** New task chat suggestions (09-chat-and-tasks.md). */
export const SUGGESTIONS = ['Fix the failing tests', 'Add a dark mode', 'Write tests for the login page']

/** Tasks tab → Earlier: 12 older tasks (fake-data.md: plain ones from the same agents and projects). */
export const EARLIER: { agent: AgentId; project: string; title: string; daysAgo: number; failed?: boolean }[] = [
  { agent: 'claude', project: 'my-app', title: 'Add form validation', daysAgo: 1 },
  { agent: 'codex', project: 'api', title: 'Add rate limiting', daysAgo: 1 },
  { agent: 'claude', project: 'portfolio', title: 'Fix the mobile menu', daysAgo: 1 },
  { agent: 'cursor', project: 'site', title: 'Update the footer links', daysAgo: 2 },
  { agent: 'codex', project: 'docs', title: 'Fix broken links', daysAgo: 2, failed: true },
  { agent: 'claude', project: 'my-app', title: 'Rename the user model', daysAgo: 2 },
  { agent: 'codex', project: 'api', title: 'Write tests for sign-up', daysAgo: 3 },
  { agent: 'claude', project: 'portfolio', title: 'Compress the images', daysAgo: 3 },
  { agent: 'cursor', project: 'site', title: 'Add a newsletter form', daysAgo: 4 },
  { agent: 'claude', project: 'my-app', title: 'Upgrade the router', daysAgo: 5 },
  { agent: 'codex', project: 'docs', title: 'Add an FAQ page', daysAgo: 6 },
  { agent: 'claude', project: 'portfolio', title: 'Set up deploys', daysAgo: 6 },
]

/** Failed sessions say why (fake-data.md → Completed today). */
export const FAILED_TEXT = '2 tests failed, so it stopped'

/** Model picker values (decisions.md: placeholders until real names are chosen). */
export const MODELS = ['Default', '[Model name]', '[Model name]']

export const COMPUTERS: Computer[] = [
  {
    id: 'win',
    name: 'Windows PC',
    state: 'awake',
    keepAwake: true,
    agents: [
      { agent: 'claude', status: 'connected' },
      { agent: 'codex', status: 'disconnected' },
      { agent: 'cursor', status: 'connected' },
    ],
  },
  { id: 'mac', name: 'MacBook', state: 'asleep', keepAwake: false, agents: [{ agent: 'claude', status: 'connected' }] },
  { id: 'mac2', name: 'Mac 2', state: 'offline', lastSeen: '1 day ago', keepAwake: false, agents: [] },
]

export const PHONES: Phone[] = [
  { id: 'this', name: 'This phone', detail: 'iPhone · active now', current: true },
  { id: 'android', name: 'Old Android', detail: 'Last used yesterday' },
]

export const DEFAULT_SETTINGS: Settings = {
  timeoutMin: 10,
  aiExplanation: true,
  notifyFinished: true,
  notifyFailed: true,
  notificationsOn: null,
}

export const USER_EMAIL = 'you@email.com'
