import 'reflect-metadata'
import { after, before, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { getConnectionToken } from '@nestjs/mongoose'
import type { NestExpressApplication } from '@nestjs/platform-express'
import type { Connection } from 'mongoose'
import request from 'supertest'
import { validateEnvironment } from '../src/config/environment.js'

const origin = 'http://127.0.0.1:5173'
const adminToken = 'integration-test-admin-secret-never-use-in-production'
let mongo: MongoMemoryServer
let app: NestExpressApplication
let connection: Connection
const valid = () => ({ name: 'Integration Guest', email: 'guest@example.invalid', attendance: 'yes', guests: 2, note: 'Isolated automated fixture.', consent: true, website: '', requestId: randomUUID(), eventIds: ['wedding'] })
const post = (payload: object) => request(app.getHttpServer()).post('/api/v1/rsvp').set('Origin', origin).send(payload)

before(async () => {
  mongo = await MongoMemoryServer.create({ binary: { version: '8.0.16' }, instance: { dbName: `wedding_test_${Date.now()}` } })
  process.env.NODE_ENV = 'test'
  process.env.MONGODB_URI = mongo.getUri()
  process.env.RATE_LIMIT_SECRET = 'integration-only-rate-hmac-key-never-use-in-production'
  process.env.ADMIN_TOKEN = adminToken
  process.env.ALLOWED_ORIGINS = origin
  process.env.RATE_LIMIT_MAX = '10'
  process.env.LOG_LEVEL = 'silent'
  const { createApplication } = await import('../src/bootstrap.js')
  const created = await createApplication()
  app = created.app
  await app.listen(0, '127.0.0.1')
  connection = app.get<Connection>(getConnectionToken())
}, { timeout: 180000 })

beforeEach(async () => {
  await connection.collection('rsvps').deleteMany({})
  await connection.collection('rate_limits').deleteMany({})
})
after(async () => { if (app) await app.close(); if (mongo) await mongo.stop() })

test('health uses a real MongoDB connection and returns no private information', async () => {
  const response = await request(app.getHttpServer()).get('/api/v1/health')
  assert.equal(response.status, 200)
  assert.deepEqual(response.body, { status: 'ok' })
  assert.equal(response.headers['cache-control'], 'no-store')
  assert.equal(response.headers['x-content-type-options'], 'nosniff')
})

test('RSVP persists in MongoDB, returns a receipt and replays idempotently', async () => {
  const body = valid()
  const first = await post(body)
  assert.equal(first.status, 201)
  assert.match(first.body.receipt, /^[A-F0-9]{16}$/)
  assert.deepEqual(Object.keys(first.body).sort(), ['receipt', 'saved'])
  const record = await connection.collection('rsvps').findOne({ requestId: body.requestId })
  assert.equal(record?.email, body.email)
  assert.equal(record?.guests, 2)
  assert.deepEqual(record?.eventIds, ['wedding'])
  const repeated = await post(body)
  assert.equal(repeated.status, 200)
  assert.equal(repeated.body.receipt, first.body.receipt)
  assert.equal(await connection.collection('rsvps').countDocuments(), 1)
  assert.equal((await post({ ...body, guests: 3 })).status, 409)
})

test('concurrent retries create exactly one response', async () => {
  const body = valid()
  const responses = await Promise.all(Array.from({ length: 6 }, () => post(body)))
  assert.ok(responses.every(response => [200, 201].includes(response.status)))
  assert.equal(new Set(responses.map(response => response.body.receipt)).size, 1)
  assert.equal(await connection.collection('rsvps').countDocuments(), 1)
})

test('strict DTO rejects bad fields, unknown event IDs, missing consent and bots', async () => {
  for (const change of [{ email: 'bad-email' }, { guests: '2' }, { guests: 7 }, { consent: false }, { name: 'x' }, { website: 'bot' }, { eventIds: ['invented'] }, { eventIds: ['wedding', 'wedding'] }, { eventIds: null }, { note: null }, { website: null }, { extraProperty: 'no' }, { requestId: 'guessable' }, { note: 'a'.repeat(501) }]) {
    const result = await post({ ...valid(), ...change })
    assert.equal(result.status, 400, JSON.stringify(change))
    assert.ok(!JSON.stringify(result.body).includes('guest@example.invalid'))
  }
  assert.equal(await connection.collection('rsvps').countDocuments(), 0)
})

test('origin, CORS, JSON and body-size boundaries are enforced', async () => {
  assert.equal((await request(app.getHttpServer()).post('/api/v1/rsvp').send(valid())).status, 403)
  assert.equal((await request(app.getHttpServer()).post('/api/v1/rsvp').set('Origin', 'https://untrusted.invalid').send(valid())).status, 403)
  assert.equal((await request(app.getHttpServer()).post('/api/v1/rsvp').set('Origin', origin).set('Content-Type', 'text/plain').send('body')).status, 415)
  assert.equal((await request(app.getHttpServer()).post('/api/v1/rsvp').set('Origin', origin).set('Content-Type', 'application/json').send('{invalid')).status, 400)
  assert.equal((await post({ ...valid(), note: 'x'.repeat(10000) })).status, 413)
  const preflight = await request(app.getHttpServer()).options('/api/v1/rsvp').set('Origin', origin).set('Access-Control-Request-Method', 'POST')
  assert.equal(preflight.headers['access-control-allow-origin'], origin)
  assert.equal((await request(app.getHttpServer()).get('/api/v1/rsvp')).status, 404)
})

test('atomic Mongo rate limit prevents concurrent abuse', async () => {
  const responses = await Promise.all(Array.from({ length: 14 }, () => post(valid())))
  assert.equal(responses.filter(response => response.status === 201).length, 10)
  assert.equal(responses.filter(response => response.status === 429).length, 4)
  assert.equal(responses.find(response => response.status === 429)?.headers['retry-after'], '600')
  assert.equal(await connection.collection('rsvps').countDocuments(), 10)
  const bucket = await connection.collection('rate_limits').findOne({})
  assert.match(bucket?.key ?? '', /^[a-f0-9]{64}$/)
  assert.ok(bucket?.expiresAt instanceof Date)
})

test('declines store no guests or function selection; text remains inert', async () => {
  const body = { ...valid(), attendance: 'no', name: '<script>alert(1)</script>' }
  assert.equal((await post(body)).status, 201)
  const row = await connection.collection('rsvps').findOne({ requestId: body.requestId })
  assert.equal(row?.guests, 0)
  assert.deepEqual(row?.eventIds, [])
  assert.equal(row?.name, body.name)
})

test('private admin export is authenticated, paginated and omits request IDs/hashes', async () => {
  const submission = await post(valid())
  assert.equal((await request(app.getHttpServer()).get('/api/v1/admin/rsvps')).status, 401)
  assert.equal((await request(app.getHttpServer()).get('/api/v1/admin/rsvps').set('Authorization', 'Bearer wrong-token')).status, 401)
  const response = await request(app.getHttpServer()).get('/api/v1/admin/rsvps').set('Authorization', `Bearer ${adminToken}`)
  assert.equal(response.status, 200)
  assert.equal(response.body.replies.length, 1)
  assert.equal(response.body.replies[0].receipt, submission.body.receipt)
  assert.equal(response.body.replies[0].payloadHash, undefined)
  assert.equal(response.body.replies[0].requestId, undefined)
  assert.equal(response.body.replies[0]._id, undefined)
  assert.equal(response.body.nextCursor, null)
  const removed = await request(app.getHttpServer()).delete(`/api/v1/admin/rsvps/${submission.body.receipt}`).set('Authorization', `Bearer ${adminToken}`)
  assert.equal(removed.status, 200)
  assert.equal(await connection.collection('rsvps').countDocuments(), 0)
})

test('configuration errors fail closed without showing secret values', () => {
  const config = { MONGODB_URI: 'mongodb://localhost/test', RATE_LIMIT_SECRET: 's'.repeat(32) }
  assert.throws(() => validateEnvironment({ ...config, ADMIN_TOKEN: 'short-private-value' }), /ADMIN_TOKEN/)
  assert.throws(() => validateEnvironment({ ...config, ALLOWED_ORIGINS: 'https://host.invalid/path' }), /ALLOWED_ORIGINS/)
  assert.throws(() => validateEnvironment({ ...config, NODE_ENV: 'production', ALLOWED_ORIGINS: 'http://host.invalid' }), /HTTPS/)
  assert.throws(() => validateEnvironment({ ...config, TRUST_PROXY: 'true' }), /TRUST_PROXY/)
})
