/**
 * After a new deploy, a page that was opened (or cached) earlier can ask for code files that no
 * longer exist. Instead of a blank screen, reload once to get the new version. A second failure in
 * the same tab is a real error and is rethrown.
 */
const KEY = 'nudge-stale-reload'

function reloadOnce(err: unknown): never {
  let already = false
  try {
    already = sessionStorage.getItem(KEY) === '1'
    if (!already) sessionStorage.setItem(KEY, '1')
  } catch {
    /* storage blocked: still try one reload */
  }
  if (already) throw err
  window.location.reload()
  // Never resolves: the page is reloading.
  return new Promise<never>(() => {}) as never
}

/** Wrap a dynamic import so a missing chunk reloads the page once. */
export function withStaleReload<T>(load: () => Promise<T>): () => Promise<T> {
  return () => load().catch(reloadOnce)
}

/** Call once at startup: preload failures reload too; a page that stays up clears the flag. */
export function installStaleReload() {
  window.addEventListener('vite:preloadError', (e) => {
    e.preventDefault()
    try {
      reloadOnce((e as Event & { payload?: unknown }).payload)
    } catch {
      /* already reloaded once; let the app carry on */
    }
  })
  window.setTimeout(() => {
    try {
      sessionStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  }, 10_000)
}
