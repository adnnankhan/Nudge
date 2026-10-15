// Saved state the test scripts start from. Persist merges this onto the app's fresh seed,
// so a set-up user lands on Home with the starting fake data; onboarding routes start fresh.
export const SETUP_DONE = JSON.stringify({ state: { signedIn: true, onboarded: true }, version: 5 })
export const ONBOARDING = (signedIn) => JSON.stringify({ state: { signedIn, onboarded: false }, version: 5 })

/**
 * Seed the saved state before any app code runs, once per tab (sessionStorage remembers), so the
 * app can't save over it while loading and later reloads keep what the test did.
 */
export async function seedOnce(page, state = SETUP_DONE) {
  await page.addInitScript((s) => {
    if (sessionStorage.getItem('nudge-test-seeded')) return
    localStorage.clear()
    localStorage.setItem('nudge-proto-v1', s)
    sessionStorage.setItem('nudge-test-seeded', '1')
  }, state)
}
