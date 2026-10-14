import { useEffect } from 'react'
import { useStore, type Theme } from '../data/store'

/** Puts the theme on <html> and keeps the browser chrome colour in step with --theme-color. */
export function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.dataset.theme = theme
  const color = getComputedStyle(root).getPropertyValue('--theme-color').trim()
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  if (meta && color) meta.content = color
}

/** Mount once at the app root: applies the saved theme and every later change instantly (no reload). */
export function useThemeSync() {
  const theme = useStore((s) => s.theme)
  useEffect(() => applyTheme(theme), [theme])
}
