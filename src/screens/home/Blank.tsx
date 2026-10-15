import { useEffect } from 'react'
import s from '../../app/screen.module.css'
import { useStore } from '../../data/store'

/** M1–M3: the empty Home screen. Home replaces it in M4. Reaching it starts the arrival timer. */
export function Blank() {
  const startArrivals = useStore((st) => st.startArrivals)
  useEffect(() => startArrivals(), [startArrivals])
  return (
    <div className={s.screen}>
      <h1 className="sr-only">Nudge</h1>
    </div>
  )
}
