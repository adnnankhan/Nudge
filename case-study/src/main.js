// Nudge case study — the only script on the page (docs/case-study/style.md, Behaviour):
// the top bar shows the section you're reading, and blocks fade in as they scroll into view.

// Section progress: whichever section crosses the middle of the screen names itself in the bar.
const progress = document.querySelector('[data-progress]')
const sections = document.querySelectorAll('main > section[data-name]')
const current = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) if (entry.isIntersecting) progress.textContent = entry.target.dataset.name
  },
  { rootMargin: '-50% 0px -50% 0px' },
)
sections.forEach((s) => current.observe(s))

// Reveal: the CSS only hides .reveal when motion is allowed, so with reduced motion this
// just adds a class that changes nothing.
const reveal = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.add('in')
      reveal.unobserve(entry.target)
    }
  },
  { rootMargin: '0px 0px -8% 0px' },
)
document.querySelectorAll('.reveal').forEach((el) => reveal.observe(el))

// Flowcharts: tabs (arrow keys move between them, Home/End jump to the ends).
const tabs = [...document.querySelectorAll('[role="tab"]')]
function select(tab, focus) {
  for (const t of tabs) {
    const on = t === tab
    t.setAttribute('aria-selected', String(on))
    t.tabIndex = on ? 0 : -1
    document.getElementById(t.getAttribute('aria-controls')).classList.toggle('is-active', on)
  }
  if (focus) tab.focus()
  tab.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => select(tab, false))
  tab.addEventListener('keydown', (e) => {
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key]
    if (next === undefined) return
    e.preventDefault()
    select(tabs[(next + tabs.length) % tabs.length], true)
  })
})

// Prototype: on wide screens the live app loads into the phone frame once it's near the screen.
// On phones the frame is hidden and never loads (the screens and the button show instead).
const device = document.querySelector('[data-proto]')
if (device && matchMedia('(min-width: 900px)').matches) {
  const load = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return
      load.disconnect()
      const frame = document.createElement('iframe')
      frame.src = device.dataset.src
      frame.title = 'Nudge prototype'
      frame.loading = 'lazy'
      device.append(frame)
    },
    { rootMargin: '400px 0px' },
  )
  load.observe(device)
}
