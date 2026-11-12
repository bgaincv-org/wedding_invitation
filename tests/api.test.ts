import { test } from 'node:test'
import assert from 'node:assert/strict'
import { handleApi } from '../server/api'
import { openDatabase } from '../server/database'
import { buildCalendar } from '../src/lib/calendar'
import { wedding } from '../shared/wedding'

const valid = () => ({ name: 'Local Test Guest', email: 'test@example.invalid', attendance: 'yes', guests: 2, note: 'Test only', consent: true, website: '', requestId: crypto.randomUUID() })
const request = (body: unknown, headers = {}, method = 'POST') => new Request('https://invitation.example/api/rsvp', { method, headers: { 'Content-Type': 'application/json', origin: 'https://invitation.example', ...headers }, ...(method !== 'GET' ? { body: JSON.stringify(body) } : {}) })

test('RSVP saves durably, returns a receipt, and retries are idempotent', async () => {
  const { db, sqlite } = openDatabase(':memory:')
  try {
    const body = valid()
    const first = await handleApi(request(body), db, { ip: 'test-one' })
    assert.equal(first.status, 201)
    const saved = await first.json()
    assert.match(saved.receipt, /^[A-F0-9]{16}$/)
    const duplicate = await handleApi(request(body), db)
    assert.equal((await duplicate.json()).receipt, saved.receipt)
    assert.equal((await db.first<{ count: number }>('SELECT COUNT(*) AS count FROM rsvps'))?.count, 1)
    assert.equal((await db.first<{ email: string }>('SELECT email FROM rsvps'))?.email, body.email)
  } finally { sqlite.close() }
})
test('invalid data, cross-site requests, bots, oversized input and wrong methods are rejected', async () => {
  const { db, sqlite } = openDatabase(':memory:')
  try {
    for (const change of [{ consent: false }, { email: 'no-email' }, { guests: 9 }, { website: 'bot.example' }, { name: 'a' }, { attendance: 'maybe-yes' }, { extra: true }]) {
      assert.equal((await handleApi(request({ ...valid(), ...change }), db)).status, 400)
    }
    assert.equal((await handleApi(request(valid(), { origin: 'https://evil.example' }), db)).status, 403)
    assert.equal((await handleApi(request(valid(), { 'content-type': 'text/plain' }), db)).status, 415)
    assert.equal((await handleApi(request({}, {}, 'GET'), db)).status, 405)
    assert.equal((await handleApi(request({ ...valid(), note: 'a'.repeat(9000) }), db)).status, 413)
    assert.equal((await db.first<{ count: number }>('SELECT COUNT(*) AS count FROM rsvps'))?.count, 0)
  } finally { sqlite.close() }
})
test('rate limiting is atomic and no responses are exposed publicly', async () => {
  const { db, sqlite } = openDatabase(':memory:')
  try {
    const results = await Promise.all(Array.from({ length: 12 }, () => handleApi(request(valid()), db, { ip: 'same-test-ip' })))
    assert.equal(results.filter(r => r.status === 201).length, 10)
    assert.equal(results.filter(r => r.status === 429).length, 2)
    assert.equal((await handleApi(new Request('https://invitation.example/api/admin/rsvps'), db)).status, 401)
  } finally { sqlite.close() }
})
test('declines count zero guests; SQL-like names remain plain data', async () => {
  const { db, sqlite } = openDatabase(':memory:')
  try {
    assert.equal((await handleApi(request({ ...valid(), attendance: 'no', name: "Guest'); DROP TABLE rsvps;--" }), db)).status, 201)
    const row = await db.first<{ guests: number; name: string }>('SELECT guests, name FROM rsvps')
    assert.equal(row?.guests, 0)
    assert.match(row?.name ?? '', /DROP TABLE/)
  } finally { sqlite.close() }
})
test('admin requires a secret and supports authenticated export and deletion', async () => {
  const { db, sqlite } = openDatabase(':memory:')
  const secret = 'test-only-secret-that-is-at-least-32-characters'
  try {
    const response = await handleApi(request(valid()), db)
    const { receipt } = await response.json()
    const headers = { Authorization: `Bearer ${secret}` }
    const exported = await handleApi(new Request('https://invitation.example/api/admin/rsvps', { headers }), db, { adminToken: secret })
    assert.equal((await exported.json()).replies.length, 1)
    const removed = await handleApi(new Request(`https://invitation.example/api/admin/rsvps/${receipt}`, { headers, method: 'DELETE' }), db, { adminToken: secret })
    assert.equal(removed.status, 200)
    assert.equal((await db.first<{ count: number }>('SELECT COUNT(*) AS count FROM rsvps'))?.count, 0)
  } finally { sqlite.close() }
})
test('calendar refuses unconfirmed dates and correctly converts IST to UTC', () => {
  assert.throws(() => buildCalendar({ ...wedding.events[1], status: 'planned' }))
  assert.throws(() => buildCalendar({ ...wedding.events[1], startsAt: null }))
  const event = { ...wedding.events[1], startsAt: '2026-12-01T10:00:00+05:30', endsAt: '2026-12-01T12:00:00+05:30', location: 'Test; Venue, Only' }
  const calendar = buildCalendar(event)
  assert.match(calendar, /DTSTART:20261201T043000Z/)
  assert.match(calendar, /DTEND:20261201T063000Z/)
  assert.ok(calendar.includes('Test\\; Venue\\, Only'))
  assert.ok(calendar.endsWith('\r\n'))
  for (const line of calendar.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75)
})

test('versioned API persists event selection and rejects conflicting retries', async () => {
  const { db, sqlite } = openDatabase(':memory:')
  try {
    const input = { ...valid(), eventIds: ['wedding', 'reception', 'wedding'] }
    const versioned = () => new Request('https://invitation.example/api/v1/rsvp', { method: 'POST', headers: { 'Content-Type': 'application/json', origin: 'https://invitation.example' }, body: JSON.stringify(input) })
    assert.equal((await handleApi(versioned(), db)).status, 201)
    assert.equal((await db.first<{event_ids: string}>('SELECT event_ids FROM rsvps'))?.event_ids, '["reception","wedding"]')
    assert.equal((await handleApi(versioned(), db)).status, 200)
    input.name = 'Changed Guest'
    assert.equal((await handleApi(versioned(), db)).status, 409)
    assert.equal((await handleApi(request({ ...valid(), eventIds: ['unknown'] }), db)).status, 400)
  } finally { sqlite.close() }
})
