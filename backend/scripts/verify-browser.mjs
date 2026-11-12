import 'reflect-metadata'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { getConnectionToken } from '@nestjs/mongoose'
import { chromium } from 'playwright'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'

const mongo = await MongoMemoryServer.create({ binary: { version: '8.0.16' } })
let app, vite, browser
try {
  process.env.NODE_ENV = 'test'
  process.env.MONGODB_URI = mongo.getUri()
  process.env.RATE_LIMIT_SECRET = 'isolated-browser-test-rate-key-never-use-in-production'
  process.env.ALLOWED_ORIGINS = 'http://127.0.0.1:5174'
  process.env.LOG_LEVEL = 'silent'
  const { createApplication } = await import('../dist/bootstrap.js')
  app = (await createApplication()).app
  await app.listen(0, '127.0.0.1')
  vite = await createServer({ configFile: false, root: fileURLToPath(new URL('../../', import.meta.url)), plugins: [react()], server: { host: '127.0.0.1', port: 5174, strictPort: true, proxy: { '/api': { target: await app.getUrl(), changeOrigin: false } } } })
  await vite.listen()
  browser = await chromium.launch({ channel: 'msedge', headless: true })
  const page = await browser.newPage({ reducedMotion: 'reduce' })
  await page.goto('http://127.0.0.1:5174/#rsvp')
  await page.getByLabel('Your name', { exact: true }).fill('Mongo Browser QA Guest')
  await page.getByLabel('Email address', { exact: true }).fill('mongo-browser@example.invalid')
  await page.getByLabel('Guests, including you').selectOption('4')
  await page.getByLabel(/I agree to share/).check()
  const response = page.waitForResponse(response => response.url().endsWith('/api/v1/rsvp') && response.request().method() === 'POST')
  await page.getByRole('button', { name: 'Send with love' }).click()
  assert.equal((await response).status(), 201)
  await page.getByText('Your reply is safely with us.').waitFor()
  const record = await app.get(getConnectionToken()).collection('rsvps').findOne({ email: 'mongo-browser@example.invalid' })
  assert.equal(record.guests, 4)
  assert.match(record.receipt, /^[A-F0-9]{16}$/)
  console.log(JSON.stringify({ result: 'pass', flow: 'React Hook Form → TanStack mutation → Vite proxy → NestJS → real isolated MongoDB → visible receipt' }))
} finally {
  await browser?.close()
  await vite?.close()
  await app?.close()
  await mongo.stop()
}
