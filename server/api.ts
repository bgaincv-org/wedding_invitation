import { rsvpSchema } from '../shared/rsvp'
import { wedding } from '../shared/wedding'

export interface Store {
  first<T>(sql: string, params?: unknown[]): Promise<T | null>
  all<T>(sql: string, params?: unknown[]): Promise<T[]>
  run(sql: string, params?: unknown[]): Promise<void>
}
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}
const json = (value: unknown, status = 200, extra = {}) => Response.json(value, { status, headers: { ...securityHeaders, 'Cache-Control': 'no-store', ...extra } })
async function digest(value: string) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), byte => byte.toString(16).padStart(2, '0')).join('')
}
async function authorized(request: Request, secret?: string) {
  if (!secret || secret.length < 32) return false
  const presented = request.headers.get('authorization')?.replace(/^Bearer /, '') ?? ''
  const [a, b] = await Promise.all([digest(presented), digest(secret)])
  let difference = 0
  for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return difference === 0
}
export async function handleApi(request: Request, db: Store, options: { ip?: string; adminToken?: string } = {}): Promise<Response> {
  const url = new URL(request.url)
  url.pathname = url.pathname.replace(/^\/api\/v1\//, '/api/')
  try {
    if (url.pathname === '/api/health' && request.method === 'GET') {
      await db.first('SELECT COUNT(*) AS ready FROM rsvps')
      return json({ status: 'ok' })
    }
    if (url.pathname.startsWith('/api/admin/')) {
      if (!await authorized(request, options.adminToken)) return json({ error: 'Unauthorized' }, 401)
      if (url.pathname === '/api/admin/rsvps' && request.method === 'GET') {
        return json({ replies: await db.all('SELECT receipt, name, email, attendance, guests, note, event_ids, created_at FROM rsvps ORDER BY created_at DESC LIMIT 10000') })
      }
      const match = url.pathname.match(/^\/api\/admin\/rsvps\/([A-F0-9]{16})$/)
      if (match && request.method === 'DELETE') {
        await db.run('DELETE FROM rsvps WHERE receipt = ?', [match[1]])
        return json({ deleted: true })
      }
      return json({ error: 'Not found' }, 404)
    }
    if (url.pathname !== '/api/rsvp') return json({ error: 'Not found' }, 404)
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, { Allow: 'POST' })
    if (!wedding.rsvpEnabled) return json({ error: 'RSVP is currently closed' }, 503)
    if (request.headers.get('origin') !== url.origin || request.headers.get('sec-fetch-site') === 'cross-site') return json({ error: 'Invalid origin' }, 403)
    if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return json({ error: 'JSON is required' }, 415)
    if (Number(request.headers.get('content-length') ?? 0) > 8192) return json({ error: 'Request too large' }, 413)
    const reader = request.body?.getReader()
    if (!reader) return json({ error: 'Body required' }, 400)
    const chunks: Uint8Array[] = []; let length = 0
    while (true) { const { done, value } = await reader.read(); if (done) break; length += value.length; if (length > 8192) { await reader.cancel(); return json({ error: 'Request too large' }, 413) } chunks.push(value) }
    const bytes = new Uint8Array(length); let offset = 0
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
    let body: unknown
    try { body = JSON.parse(new TextDecoder().decode(bytes)) } catch { return json({ error: 'Invalid JSON' }, 400) }
    const parsed = rsvpSchema.safeParse(body)
    if (!parsed.success) return json({ error: 'Please check the submitted details' }, 400)
    const input = parsed.data
    const guests = input.attendance === 'no' ? 0 : input.guests
    const eventIds = JSON.stringify(input.attendance === 'no' ? [] : [...new Set(input.eventIds)].sort())
    const previous = await db.first<{ receipt: string; name: string; email: string; attendance: string; guests: number; note: string; event_ids: string }>('SELECT receipt, name, email, attendance, guests, note, event_ids FROM rsvps WHERE request_id = ?', [input.requestId])
    if (previous) {
      if (previous.name !== input.name || previous.email !== input.email || previous.attendance !== input.attendance || previous.guests !== guests || previous.note !== input.note || previous.event_ids !== eventIds) return json({ error: 'This reference was already used for a different reply' }, 409)
      return json({ saved: true, receipt: previous.receipt })
    }
    const window = Math.floor(Date.now() / 600000)
    const rateKey = await digest(`${window}:${options.ip ?? 'unknown'}`)
    // Atomic counter prevents simultaneous requests bypassing the throttle.
    const rate = await db.first<{ count: number }>('INSERT INTO rate_limits (key, count, window) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1 RETURNING count', [rateKey, window])
    await db.run('DELETE FROM rate_limits WHERE window < ?', [window - 1])
    if (!rate || rate.count > 10) return json({ error: 'Please try again later' }, 429, { 'Retry-After': '600' })
    const receipt = crypto.randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase()
    await db.run('INSERT INTO rsvps (request_id, receipt, name, email, attendance, guests, note, consent, created_at, event_ids) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?) ON CONFLICT(request_id) DO NOTHING', [input.requestId, receipt, input.name, input.email, input.attendance, guests, input.note, new Date().toISOString(), eventIds])
    const saved = await db.first<{ receipt: string }>('SELECT receipt FROM rsvps WHERE request_id = ?', [input.requestId])
    if (!saved) return json({ error: 'Unable to save your reply' }, 503)
    return json({ saved: true, receipt: saved.receipt }, 201)
  } catch {
    // Never log or reflect guest details on errors.
    return json({ error: 'Unable to save your reply right now. Please try again.' }, 503)
  }
}
