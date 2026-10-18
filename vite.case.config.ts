import { defineConfig, type Plugin } from 'vite'
import { readFileSync, readdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const OUT = resolve(import.meta.dirname, 'site')

// The case study lives at the site root (https://adnnankhan.github.io/Nudge/) and the prototype
// in site/app/, built first by vite.config.ts. Clear the old case study files but never site/app.
function cleanSiteKeepApp(): Plugin {
  return {
    name: 'clean-site-keep-app',
    apply: 'build',
    buildStart() {
      for (const entry of readdirSync(OUT, { withFileTypes: true })) {
        if (entry.name !== 'app') rmSync(resolve(OUT, entry.name), { recursive: true, force: true })
      }
    },
  }
}

// App screens are written in index.html as <img data-shot="final-home" data-sizes="…" alt="…">
// and expanded here into a <picture>: AVIF and WebP at half and full width, the PNG as the
// fallback, width/height set so nothing shifts as it loads (scripts/case-images.mjs makes the
// files and the manifest). Runs before Vite's own HTML pass, so every URL still gets hashed.
// Images load lazily unless the tag says loading="eager".
function shots(): Plugin {
  const manifest: Record<string, { width: number; height: number; widths: number[] }> = JSON.parse(
    readFileSync(resolve(import.meta.dirname, 'case-study/img/manifest.json'), 'utf8'),
  )
  return {
    name: 'case-shots',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(/<img data-shot="([\w-]+)"([^>]*)>/g, (_, name: string, rest: string) => {
          const m = manifest[name]
          if (!m) throw new Error(`case-shots: no image "${name}" in case-study/img/manifest.json`)
          const sizes = /data-sizes="([^"]+)"/.exec(rest)?.[1] ?? '100vw'
          const attrs = rest.replace(/\s*data-sizes="[^"]+"/, '')
          const set = (ext: string) => m.widths.map((w) => `./img/${name}-${w}.${ext} ${w}w`).join(', ')
          const loading = /\sloading=/.test(attrs) ? '' : ' loading="lazy"'
          return (
            `<picture>` +
            `<source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">` +
            `<source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">` +
            `<img src="./img/${name}-${m.width}.png" width="${m.width}" height="${m.height}"${loading} decoding="async"${attrs}>` +
            `</picture>`
          )
        })
      },
    },
  }
}

// Text the build writes into index.html:
// - "→" in text becomes a small SVG arrow: the Plex files have no → glyph, and a system-font
//   arrow looks out of place. Screen readers still hear "→".
// - <!--quotes:research--> / <!--quotes:feedback--> become quote cards for the quotes marked
//   "confirmed": true in docs/case-study/quotes.json, and nothing while none are.
const ARROW =
  '<svg class="arr" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 8h10.5M9.5 4.5 13 8l-3.5 3.5"/></svg><span class="sr">→</span>'
function caseText(): Plugin {
  const quotesFile = resolve(import.meta.dirname, 'docs/case-study/quotes.json')
  return {
    name: 'case-text',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const quotes = JSON.parse(readFileSync(quotesFile, 'utf8')) as Record<string, { text: string; confirmed: boolean }[]>
        html = html.replace(/<!--quotes:(\w+)-->/g, (_, key: string) => {
          const shown = (quotes[key] ?? []).filter((q) => q.confirmed === true)
          if (!shown.length) return ''
          return `<ul class="quotes reveal">${shown.map((q) => `<li><blockquote>“${q.text}”</blockquote></li>`).join('')}</ul>`
        })
        // Only text between tags; attributes (alt, aria-label) keep the character.
        return html.replace(/>([^<]*)</g, (_, text: string) => `>${text.replace(/→/g, ARROW)}<`)
      },
    },
  }
}

// Plain HTML/CSS + a little vanilla JS (docs/case-study/style.md); Vite only bundles, hashes
// and minifies.
export default defineConfig({
  root: 'case-study',
  base: '/Nudge/',
  publicDir: 'public',
  resolve: { alias: { '@fontsource': resolve(import.meta.dirname, 'node_modules/@fontsource') } },
  css: { transformer: 'lightningcss' },
  plugins: [cleanSiteKeepApp(), caseText(), shots()],
  build: {
    outDir: OUT,
    emptyOutDir: false,
    target: 'es2020',
    assetsInlineLimit: 0,
    cssCodeSplit: false,
  },
})
