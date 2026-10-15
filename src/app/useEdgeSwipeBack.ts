import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const EDGE = 24
const DISTANCE = 72

/** Swipe in from the left edge (24 px) to go back (flows.md). Not on tab screens. */
export function useEdgeSwipeBack(host: HTMLElement | null) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  // No swipe-back on tab screens or the first auth screens (nothing to go back to).
  const root = ['/', '/new', '/agents', '/signin', '/setup/connecting'].includes(pathname)

  useEffect(() => {
    if (!host || root) return
    let start: { x: number; y: number; id: number } | null = null
    const down = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return
      const left = host.getBoundingClientRect().left
      if (e.clientX - left <= EDGE) start = { x: e.clientX, y: e.clientY, id: e.pointerId }
    }
    const up = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return
      const dx = e.clientX - start.x
      const dy = Math.abs(e.clientY - start.y)
      start = null
      if (dx > DISTANCE && dy < dx * 0.6) navigate(-1)
    }
    const cancel = () => (start = null)
    host.addEventListener('pointerdown', down)
    host.addEventListener('pointerup', up)
    host.addEventListener('pointercancel', cancel)
    return () => {
      host.removeEventListener('pointerdown', down)
      host.removeEventListener('pointerup', up)
      host.removeEventListener('pointercancel', cancel)
    }
  }, [host, root, navigate])
}
