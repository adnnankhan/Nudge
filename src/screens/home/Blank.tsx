import s from '../../app/screen.module.css'

/** M1: the empty app screen. Home replaces it in M4. */
export function Blank() {
  return (
    <main className={s.screen}>
      <h1 className="sr-only">Nudge</h1>
    </main>
  )
}
