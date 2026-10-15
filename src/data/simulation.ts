import { useEffect, useState } from 'react'
import { isModalOpen } from '../components/Overlay'
import { useStore } from './store'

const TICK_MS = 1000

/**
 * The living app (docs/fake-data.md): one 1-second loop drives arrivals, Recent lines, finishes
 * and time-outs. Everything is timestamp-based, so a refresh or a backgrounded tab catches up.
 * The arrival timer holds while a sheet or the demo menu is open.
 */
export function useSimulation() {
  useEffect(() => {
    let last = Date.now()
    const step = () => {
      const now = Date.now()
      useStore.getState().tick(now, now - last, isModalOpen())
      last = now
    }
    step()
    const id = window.setInterval(step, TICK_MS)
    return () => window.clearInterval(id)
  }, [])
}

/** Re-render on an interval so "x min ago" and elapsed times stay current (every 30 s by default). */
export function useNow(everyMs = 30_000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), everyMs)
    return () => window.clearInterval(id)
  }, [everyMs])
  return now
}
