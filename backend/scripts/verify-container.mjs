import { randomBytes, randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import assert from 'node:assert/strict'

// A unique disposable Compose project prevents test cleanup touching a real deployment.
const project = `wedding-api-qa-${randomBytes(4).toString('hex')}`
const reservation = createServer()
await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve))
const port = reservation.address().port
await new Promise(resolve => reservation.close(resolve))
const adminToken = randomBytes(32).toString('hex')
const env = { ...process.env, PORT: String(port), ALLOWED_ORIGINS: 'https://qa.invitation.invalid', ADMIN_TOKEN: adminToken, RATE_LIMIT_SECRET: randomBytes(32).toString('hex'), MONGO_ROOT_PASSWORD: randomBytes(32).toString('hex'), MONGO_APP_PASSWORD: randomBytes(32).toString('hex') }
const run = args => new Promise((resolve, reject) => {
  const child = spawn('docker', ['compose', '-p', project, '-f', 'compose.yaml', ...args], { env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true })
  let stderr = ''
  child.stderr.on('data', chunk => { stderr += chunk.toString() })
  child.on('error', reject)
  child.on('exit', code => code === 0 ? resolve() : reject(new Error(`Compose operation failed (${code}): ${stderr.replaceAll(adminToken, '[redacted]')}`)))
})
const base = `http://127.0.0.1:${port}/api/v1`
async function waitForHealth() {
  for (let attempt = 0; attempt < 40; attempt++) {
    try { const response = await fetch(`${base}/health`, { signal: AbortSignal.timeout(2000) }); if (response.ok) return } catch { /* Startup can take a moment. */ }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  throw new Error('Container API did not become healthy')
}
try {
  console.log('Building and starting an isolated authenticated MongoDB + API stack.')
  await run(['up', '--build', '-d', '--wait', '--wait-timeout', '120'])
  await waitForHealth()
  const response = await fetch(`${base}/rsvp`, { method: 'POST', headers: { Origin: env.ALLOWED_ORIGINS, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Container Test Guest', email: 'container@example.invalid', attendance: 'yes', guests: 2, note: 'Disposable container verification', consent: true, website: '', requestId: randomUUID(), eventIds: ['wedding'] }) })
  assert.equal(response.status, 201)
  const saved = await response.json()
  console.log('Container RSVP persisted. Restarting MongoDB to verify volume persistence.')
  await run(['restart', 'mongo'])
  await waitForHealth()
  const listed = await fetch(`${base}/admin/rsvps`, { headers: { Authorization: `Bearer ${adminToken}` } })
  assert.equal(listed.status, 200)
  assert.equal((await listed.json()).replies[0].receipt, saved.receipt)
  assert.equal((await fetch(`${base}/admin/rsvps`)).status, 401)
  console.log('PASS: authenticated MongoDB, health, saved RSVP, restart persistence, protected admin export.')
} finally {
  // This exact generated project owns only throwaway test data and volumes.
  await run(['down', '--volumes', '--remove-orphans'])
  console.log('Removed the isolated test containers and their disposable volume.')
}
