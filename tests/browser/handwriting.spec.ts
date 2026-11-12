import { test, expect } from '@playwright/test'
import { WELCOME_SESSION_KEY } from '../../src/lib/content'

type WritingEvent = { scene: string; name: string; state: string; frame: number }
type AuditedWindow = Window & { writingAudit: WritingEvent[] }

for (const width of [390, 1440]) {
  test(`both names write in the same display frames on cover and main page at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.addInitScript(key => {
      sessionStorage.setItem(key, 'yes')
      const audit: WritingEvent[] = []
      ;(window as AuditedWindow).writingAudit = audit
      let frame = 0
      const countFrame = () => { frame++; requestAnimationFrame(countFrame) }
      requestAnimationFrame(countFrame)
      new MutationObserver(records => {
        for (const record of records) {
          const name = record.target as HTMLElement
          const state = name.dataset.writingState
          if (state !== 'writing' && state !== 'complete') continue
          audit.push({ scene: name.closest('#welcome-title') ? 'cover' : 'couple', name: name.textContent ?? '', state, frame })
        }
      }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-writing-state'] })
    }, WELCOME_SESSION_KEY)
    await page.goto('/')
    await expect(page.locator('#welcome-title [data-writing-state="writing"]')).toHaveCount(2)
    const before = await page.locator('#welcome-title').boundingBox()
    await expect(page.locator('#welcome-title [data-writing-state="complete"]')).toHaveCount(2)
    expect(await page.locator('#welcome-title').boundingBox()).toEqual(before)
    await page.getByRole('button', { name: 'Open invitation', exact: true }).click()
    await expect(page.locator('.couple-person [data-writing-state="writing"]')).toHaveCount(2, { timeout: 8000 })
    await expect(page.locator('.couple-person [data-writing-state="complete"]')).toHaveCount(2)
    const events = await page.evaluate(() => (window as AuditedWindow).writingAudit)
    for (const scene of ['cover', 'couple']) {
      for (const state of ['writing', 'complete']) {
        const pair = events.filter(event => event.scene === scene && event.state === state)
        expect(pair.map(event => event.name)).toEqual(['Sathvik', 'Harika'])
        expect(pair[0].frame).toBe(pair[1].frame)
      }
    }
  })
}

test('switching to reduced motion halfway through writing immediately leaves both names readable', async ({ page }) => {
  await page.addInitScript(key => sessionStorage.setItem(key, 'yes'), WELCOME_SESSION_KEY)
  await page.goto('/')
  await expect(page.locator('#welcome-title [data-writing-state="writing"]')).toHaveCount(2)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('#welcome-title [data-writing-state="writing"]')).toHaveCount(0)
  for (const name of await page.locator('#welcome-title .writing-ink').all()) await expect(name).toHaveCSS('opacity', '1')
  await expect(page.getByRole('button', { name: 'Open invitation', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: 'Open invitation', exact: true }).click()
  await expect(page.locator('#hero-title')).toBeFocused()
  await expect(page.locator('.couple-lamp-left img')).toHaveCSS('transform', 'none')
})
