/** Short vibration where supported (Android); iPhone browsers don't support it, so it's skipped silently. */
export function haptic(ms = 10) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* not supported */
  }
}
