// Serves site/ the way GitHub Pages does: the case study at /Nudge/ and the prototype at
// /Nudge/app/. Used by the case study checks.
//   node scripts/serve-site.mjs [port]   (default 4174)
import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../site/', import.meta.url))
const PORT = Number(process.argv[2] ?? 4174)
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp',
  '.avif': 'image/avif', '.woff2': 'font/woff2', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon', '.txt': 'text/plain',
}

createServer((req, res) => {
  const url = new URL(req.url, 'http://x')
  if (url.pathname === '/' ) { res.writeHead(302, { location: '/Nudge/' }); return res.end() }
  if (!url.pathname.startsWith('/Nudge/')) { res.writeHead(404); return res.end('not found') }
  let file = normalize(join(ROOT, decodeURIComponent(url.pathname.slice('/Nudge/'.length))))
  if (!file.startsWith(normalize(ROOT))) { res.writeHead(403); return res.end() }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  if (!existsSync(file)) { res.writeHead(404); return res.end('not found') }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-cache' })
  createReadStream(file).pipe(res)
}).listen(PORT, () => console.log(`site on http://localhost:${PORT}/Nudge/`))
