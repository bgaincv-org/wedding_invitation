import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { gzipSync } from 'node:zlib'
import { handleApi } from './api'
import { siteHeaders } from './siteHeaders'
import { openDatabase } from './database'

const { db, sqlite } = openDatabase()
const production = process.argv.includes('--production')
const port = Number(process.env.API_PORT ?? 3001)
const host = process.env.HOST ?? '127.0.0.1'
const publicRoot = resolve('dist/client')
const types: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.ogg': 'audio/ogg' }
const server = createServer(async (req, res) => {
  try {
    const origin = process.env.PUBLIC_ORIGIN ?? `http://${req.headers.host}`
    const url = new URL(req.url ?? '/', origin)
    if (url.pathname.startsWith('/api/')) {
      const chunks: Buffer[] = []; let size = 0
      for await (const chunk of req) { size += chunk.length; if (size > 8192) { res.writeHead(413); res.end(); return } chunks.push(chunk) }
      const headers = new Headers()
      for (const [key, value] of Object.entries(req.headers)) { if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value) }
      const request = new Request(url, { method: req.method, headers, ...(!['GET', 'HEAD'].includes(req.method ?? 'GET') ? { body: Buffer.concat(chunks) } : {}) })
      const response = await handleApi(request, db, { ip: req.socket.remoteAddress, adminToken: process.env.ADMIN_TOKEN })
      res.writeHead(response.status, Object.fromEntries(response.headers)); res.end(Buffer.from(await response.arrayBuffer())); return
    }
    if (!production) { res.writeHead(404); res.end('Use the Vite preview URL.'); return }
    const filename = resolve(publicRoot, `.${decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)}`)
    if (!filename.startsWith(publicRoot + sep)) { res.writeHead(403); res.end(); return }
    try {
      const content = await readFile(filename)
      const type = types[extname(filename)] ?? 'application/octet-stream'
      if (type.startsWith('audio/')) {
        const headers = { ...siteHeaders, 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Cache-Control': 'public, max-age=86400' }
        const range = req.headers.range?.match(/^bytes=(\d*)-(\d*)$/)
        if (range && req.method === 'GET' && (range[1] || range[2])) {
          const start = range[1] ? Number(range[1]) : Math.max(0, content.length - Number(range[2]))
          const end = range[1] && range[2] ? Math.min(Number(range[2]), content.length - 1) : content.length - 1
          if (start >= content.length || start > end) { res.writeHead(416, { ...headers, 'Content-Range': `bytes */${content.length}` }); res.end(); return }
          res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${content.length}`, 'Content-Length': end - start + 1 })
          res.end(content.subarray(start, end + 1)); return
        }
        res.writeHead(200, { ...headers, 'Content-Length': content.length }); res.end(req.method === 'HEAD' ? undefined : content); return
      }
      const compress = /\btext\/|javascript|json|svg/.test(types[extname(filename)] ?? '') && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '')
      res.writeHead(200, { ...siteHeaders, 'Content-Type': types[extname(filename)] ?? 'application/octet-stream', 'Cache-Control': url.pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache', Vary: 'Accept-Encoding', ...(compress ? { 'Content-Encoding': 'gzip' } : {}) }); res.end(compress ? gzipSync(content) : content)
    } catch { res.writeHead(404); res.end('Not found') }
  } catch { res.writeHead(500); res.end('Unable to process request') }
})
server.listen(port, host, () => console.log(`Wedding ${production ? 'site' : 'API'} ready at http://${host}:${port}`))
const close = () => server.close(() => { sqlite.close(); process.exit(0) })
process.on('SIGINT', close); process.on('SIGTERM', close)
