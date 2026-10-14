import screen from '../../app/screen.module.css'
import { useStore } from '../../data/store'
import s from './Tokens.module.css'

const COLOURS = [
  'bg', 'surface', 'field', 'raised', 'pressed', 'ink', 'ink-2', 'hairline',
  'primary-bg', 'primary-fg', 'scrim', 'sheet',
]
const RISKS = [
  ['low', 'Low risk'],
  ['med', 'Medium risk'],
  ['high', 'High risk'],
  ['work', 'Working'],
] as const

function Column({ theme }: { theme: 'dark' | 'light' }) {
  return (
    <section className={s.col} data-theme={theme} aria-label={`${theme} tokens`}>
      <h2 className="t-subhead-bold">{theme}</h2>
      {COLOURS.map((name) => (
        <div className={s.swatch} key={name}>
          <span className={s.chip} style={{ background: `var(--${name})` }} />
          <span>--{name}</span>
        </div>
      ))}
      {RISKS.map(([key, label]) => (
        <span
          key={key}
          className={s.risk}
          style={{ background: `var(--${key}-bg)`, color: `var(--${key}-fg)` }}
        >
          {label}
        </span>
      ))}
      <div className={s.surface}>
        <p className="t-headline">Headline</p>
        <p className="t-subhead ink-2">Subhead</p>
        <p className={s.mono}>2 min ago</p>
      </div>
    </section>
  )
}

export function Tokens() {
  const theme = useStore((st) => st.theme)
  const setTheme = useStore((st) => st.setTheme)
  return (
    <div className={screen.screen}>
      <div className={s.wrap}>
        <div className={s.bar}>
          <h1 className="t-title-3">Tokens</h1>
          <button
            type="button"
            className={s.toggle}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            App theme: {theme}
          </button>
        </div>
        <div className={s.cols}>
          <Column theme="dark" />
          <Column theme="light" />
        </div>
      </div>
    </div>
  )
}
