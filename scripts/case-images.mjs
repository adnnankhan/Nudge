// Makes the case study's responsive images from the originals in case-study/assets/:
// each PNG at half and full width as AVIF and WebP, plus a full-width PNG fallback (style.md:
// "WebP/AVIF with PNG fallback"). Output goes to case-study/img/ and is committed, so the deploy
// doesn't need sharp. Re-run after changing an asset:
//   node scripts/case-images.mjs
import sharp from 'sharp'
import { mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const SRC = 'case-study/assets'
const OUT = 'case-study/img'
mkdirSync(OUT, { recursive: true })

let total = 0
const manifest = {}
for (const file of readdirSync(SRC).filter((f) => f.endsWith('.png'))) {
  const name = file.replace(/\.png$/, '')
  const src = sharp(join(SRC, file))
  const { width, height } = await src.metadata()
  manifest[name] = { width, height, widths: [Math.round(width / 2), width] }
  const outputs = []
  for (const w of [Math.round(width / 2), width]) {
    const img = () => sharp(join(SRC, file)).resize({ width: w })
    outputs.push(img().avif({ quality: 55, effort: 6 }).toFile(join(OUT, `${name}-${w}.avif`)))
    outputs.push(img().webp({ quality: 80, effort: 6 }).toFile(join(OUT, `${name}-${w}.webp`)))
  }
  outputs.push(src.clone().png({ compressionLevel: 9, palette: false }).toFile(join(OUT, `${name}-${width}.png`)))
  await Promise.all(outputs)
  const size = readdirSync(OUT)
    .filter((f) => f.startsWith(`${name}-`))
    .reduce((s, f) => s + statSync(join(OUT, f)).size, 0)
  total += size
  console.log(`${name}: ${width}w → ${(size / 1024).toFixed(0)} KB in all formats`)
}
// Read by the case study build (vite.case.config.ts) to write each <picture> with sizes.
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
console.log(`total ${(total / 1024 / 1024).toFixed(1)} MB`)
