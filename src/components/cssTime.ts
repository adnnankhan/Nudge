/**
 * Read a duration token (e.g. --dur-hold) in milliseconds. The CSS minifier may rewrite
 * "1200ms" as "1.2s", so units must be honoured — reading "1.2s" as 1.2 ms would make
 * Hold to approve complete instantly.
 */
export function cssMs(name: string, fallback: number, el: Element = document.documentElement) {
  const raw = getComputedStyle(el).getPropertyValue(name).trim()
  const n = parseFloat(raw)
  if (!Number.isFinite(n)) return fallback
  return raw.endsWith('ms') ? n : raw.endsWith('s') ? n * 1000 : n
}
