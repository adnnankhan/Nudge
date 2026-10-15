import { useEffect, useRef, useState } from 'react'
import s from './Voice.module.css'

/** The fake transcript (04-questions.md → VoiceAnswer). */
export const TRANSCRIPT = 'Use email and password, and add a forgot password link under the form.'

/**
 * Voice answers without an extra step (04-questions.md, decision 18): 2 s "Listening…", then the
 * transcript drops into the input to edit and send.
 */
export function useVoice(onText: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const cb = useRef(onText)
  cb.current = onText
  useEffect(() => {
    if (!listening) return
    const t = window.setTimeout(() => {
      setListening(false)
      cb.current(TRANSCRIPT)
    }, 2000)
    return () => window.clearTimeout(t)
  }, [listening])
  return { listening, start: () => setListening(true) }
}

/** Small wave + "Listening…", shown inside an input while it listens. */
export function Listening() {
  return (
    <span className={s.listening} role="status">
      <span className={s.wave} aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} style={{ animationDelay: `${i * 120}ms` }} />
        ))}
      </span>
      Listening…
    </span>
  )
}
