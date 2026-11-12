import { firefox, webkit } from 'playwright'
import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'
const results = []
for (const [name, engine] of Object.entries({ firefox, webkit })) {
  const browser = await engine.launch({ headless: true })
  try {
    for (const width of [390, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: width === 390 ? 'reduce' : 'no-preference' })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.goto('http://127.0.0.1:3003')
      await page.getByRole('button', { name: 'Open invitation', exact: true }).click()
      await page.getByRole('button', { name: 'Open the invitation', exact: true }).click()
      await page.keyboard.press('Escape')
      await page.getByRole('button', { name: 'Open: An evening wrapped in jasmine' }).click()
      await page.keyboard.press('ArrowRight')
      assert.equal(await page.locator('.memory-dialog h3').textContent(), 'A little letter. So much love.')
      await page.keyboard.press('Escape')
      await page.getByRole('button', { name: 'A note from our hearts' }).click()
      await page.getByRole('button', { name: 'Switch to Telugu' }).click()
      assert.equal(await page.locator('html').getAttribute('lang'), 'te')
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
      assert.deepEqual(errors, [])
      results.push({ browser: name, width, result: 'pass', errors })
      await page.close()
    }
  } finally { await browser.close() }
}
await writeFile('artifacts/cross-browser.json', JSON.stringify(results, null, 2))
console.log(JSON.stringify(results))
