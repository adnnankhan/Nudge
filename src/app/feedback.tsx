import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { FaceIdSheet } from '../components/FaceIdSheet'
import { Toast } from '../components/Notice'
import { haptic } from '../components/haptics'

/* ---------- Toasts ---------- */

type ToastInput = { text: string; success?: boolean; action?: { label: string; onPress: () => void }; ms?: number }
type ToastApi = (t: ToastInput) => void

const ToastContext = createContext<ToastApi>(() => {})
export const useToast = () => useContext(ToastContext)

/* ---------- Face ID ---------- */

/** `always`: high risk asks every time (03-approvals.md → Face ID rule). */
type FaceIdApi = (opts?: { always?: boolean }) => Promise<boolean>
const FaceIdContext = createContext<FaceIdApi>(async () => true)
/**
 * Ask for Face ID (simulated): resolves true on success, false on Cancel. After one success, low and
 * medium approvals skip it for 5 minutes and show "Face ID · still verified" instead of the sheet.
 */
export const useFaceId = () => useContext(FaceIdContext)

export const FACE_ID_WINDOW = 5 * 60_000
let verifiedAt = -Infinity

/** One toast and one Face ID sheet for the whole app; screens ask for them through hooks. */
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<(ToastInput & { key: number }) | null>(null)
  const [open, setOpen] = useState(false)
  const settle = useRef<((ok: boolean) => void) | null>(null)

  const showToast = useCallback<ToastApi>((t) => setToast({ ...t, key: Date.now() }), [])
  const hideToast = useCallback(() => setToast(null), [])

  const confirm = useCallback<FaceIdApi>(
    (opts) =>
      new Promise<boolean>((resolve) => {
        if (!opts?.always && Date.now() - verifiedAt < FACE_ID_WINDOW) {
          // Don't ask twice: a short line instead of the sheet, then carry on.
          setToast({ text: 'Face ID · still verified', success: true, ms: 900, key: Date.now() })
          haptic(10)
          window.setTimeout(() => resolve(true), 450)
          return
        }
        settle.current = resolve
        setOpen(true)
      }),
    [],
  )
  const finish = (ok: boolean) => {
    setOpen(false)
    if (ok) {
      haptic(20)
      verifiedAt = Date.now()
    }
    settle.current?.(ok)
    settle.current = null
  }
  const onSuccess = useCallback(() => finish(true), [])
  const onCancel = useCallback(() => finish(false), [])

  return (
    <ToastContext.Provider value={showToast}>
      <FaceIdContext.Provider value={confirm}>
        {children}
        <FaceIdSheet open={open} onSuccess={onSuccess} onCancel={onCancel} />
        <Toast
          key={toast?.key}
          open={!!toast}
          onDismiss={hideToast}
          success={toast?.success}
          action={
            toast?.action && {
              label: toast.action.label,
              onPress: () => {
                toast.action!.onPress()
                hideToast()
              },
            }
          }
          autoHideMs={toast?.ms ?? 4000}
        >
          {toast?.text}
        </Toast>
      </FaceIdContext.Provider>
    </ToastContext.Provider>
  )
}
