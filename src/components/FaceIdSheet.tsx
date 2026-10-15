import { useEffect, useState } from 'react'
import { CircleCheck, Fingerprint } from 'lucide-react'
import { TextButton } from './Button'
import { ICON } from './icons'
import { Sheet } from './Sheet'
import { cssMs } from './cssTime'
import s from './FaceId.module.css'

type Props = {
  open: boolean
  onSuccess: () => void
  onCancel: () => void
  /** Gallery only: freeze on one state. */
  demoState?: 'scanning' | 'success'
}

/**
 * Simulated Face ID: 0.9 s scan animation, then a success tick, then it closes by itself.
 * Text: "Confirm it's you" → "Done". Cancel closes without approving.
 */
export function FaceIdSheet({ open, onSuccess, onCancel, demoState }: Props) {
  const [state, setState] = useState<'scanning' | 'success'>(demoState ?? 'scanning')

  useEffect(() => {
    if (!open) return
    if (demoState) {
      setState(demoState)
      return
    }
    setState('scanning')
    const ms = cssMs('--dur-faceid', 900)
    const a = window.setTimeout(() => setState('success'), ms)
    const b = window.setTimeout(onSuccess, ms + 500)
    return () => {
      window.clearTimeout(a)
      window.clearTimeout(b)
    }
  }, [open, demoState, onSuccess])

  const done = state === 'success'
  return (
    <Sheet open={open} onClose={onCancel} title={done ? 'Done' : 'Confirm it’s you'} centered dismissible={false} inline={!!demoState}>
      <div className={s.wrap}>
        <span className={[s.disc, done && s.done].filter(Boolean).join(' ')} aria-hidden="true">
          {done ? <CircleCheck size={40} {...ICON} /> : <Fingerprint size={40} className={s.scan} {...ICON} />}
        </span>
        <TextButton onClick={onCancel} disabled={done} data-autofocus>
          Cancel
        </TextButton>
      </div>
    </Sheet>
  )
}
