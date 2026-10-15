// Cuts the @fontsource IBM Plex files (tech.md: Sans 400/500/600, Mono 400) down to the characters the
// app's text uses, so the first visit downloads far less. src/theme/fonts.css declares these after the
// full files with a matching unicode-range: the browser takes the subset for these characters and only
// fetches a full file for anything else (a typed "é", say). Run after changing the character set:
//   node scripts/subset-fonts.mjs
import subsetFont from 'subset-font'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

// Basic Latin + the punctuation the copy uses (· × – — ‘ ’ “ ” • … →) and a no-break space.
export const RANGE = 'U+20-7E, U+A0, U+B7, U+D7, U+2013-2014, U+2018-2019, U+201C-201D, U+2022, U+2026, U+2192'
const chars = RANGE.split(', ')
  .flatMap((r) => {
    const [a, b = a] = r.replace(/U\+/g, '').split('-').map((h) => parseInt(h, 16))
    return Array.from({ length: b - a + 1 }, (_, i) => String.fromCodePoint(a + i))
  })
  .join('')

const FACES = [
  ['ibm-plex-sans', 'ibm-plex-sans-latin-400-normal', 'plex-sans-400'],
  ['ibm-plex-sans', 'ibm-plex-sans-latin-500-normal', 'plex-sans-500'],
  ['ibm-plex-sans', 'ibm-plex-sans-latin-600-normal', 'plex-sans-600'],
  ['ibm-plex-mono', 'ibm-plex-mono-latin-400-normal', 'plex-mono-400'],
]

mkdirSync('src/theme/fonts', { recursive: true })
for (const [pkg, file, out] of FACES) {
  const src = readFileSync(`node_modules/@fontsource/${pkg}/files/${file}.woff2`)
  const sub = await subsetFont(src, chars, { targetFormat: 'woff2' })
  writeFileSync(`src/theme/fonts/${out}.woff2`, sub)
  console.log(`${out}: ${(src.length / 1024).toFixed(1)} KB → ${(sub.length / 1024).toFixed(1)} KB`)
}
