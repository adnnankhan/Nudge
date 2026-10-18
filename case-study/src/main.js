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
