import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
await mkdir('artifacts', { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', error => errors.push(error.message))
await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' })
await page.screenshot({ path: 'artifacts/welcome-desktop.png' })
await page.getByRole('button', { name: 'Open invitation', exact: true }).click()
await page.waitForTimeout(2000)
await page.screenshot({ path: 'artifacts/desktop-hero.png' })
for (const selector of ['#our-invitation', '#our-families', '#celebrations', '#traditions', '#moments', '#the-details', '#rsvp', '#with-love']) {
  await page.locator(selector).scrollIntoViewIfNeeded()
  await page.waitForTimeout(1150)
  await page.locator(selector).screenshot({ path: `artifacts/${selector.slice(1)}.png` })
}
await page.getByRole('button', { name: 'Switch to Telugu' }).click()
await page.locator('#home').scrollIntoViewIfNeeded()
await page.waitForTimeout(1500)
await page.screenshot({ path: 'artifacts/desktop-telugu.png' })
await page.setViewportSize({ width: 390, height: 844 })
await page.screenshot({ path: 'artifacts/mobile-telugu.png' })
await page.getByRole('button', { name: 'Switch to English' }).click()
await page.waitForTimeout(1500)
await page.screenshot({ path: 'artifacts/mobile-hero.png' })
for (const selector of ['#celebrations', '#traditions', '#rsvp']) {
  await page.locator(selector).scrollIntoViewIfNeeded()
  await page.waitForTimeout(1150)
  await page.locator(selector).screenshot({ path: `artifacts/mobile-${selector.slice(1)}.png` })
}
console.log(JSON.stringify({ errors, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), screenshots: 'artifacts/' }))
await browser.close()
