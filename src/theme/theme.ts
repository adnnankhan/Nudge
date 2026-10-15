import { useEffect, useRef } from 'react'
import { useStore, type Theme } from '../data/store'

/** Puts the theme on <html> and keeps the browser chrome colour in step with --theme-color. */
export function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.dataset.theme = theme
  const color = getComputedStyle(root).getPropertyValue('--theme-color').trim()
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (meta && color) meta.content = color
}

/**
 * Mount once at the app root: applies the saved theme and every later change instantly (no reload).
 * On load, index.html has already put the theme on <html> before the first paint; reading
 * --theme-color then would force a style pass over the whole first screen inside React's first
 * render, so the browser-chrome colour is set just after that paint instead.
 */
export function useThemeSync() {
  const theme = useStore((s) => s.theme)
  const first = useRef(true)
  useEffect(() => {
    if (!first.current) return applyTheme(theme)
    first.current = false
    const id = window.setTimeout(() => applyTheme(theme), 0)
    return () => window.clearTimeout(id)
  }, [theme])
}
