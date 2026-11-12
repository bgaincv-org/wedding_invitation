import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFile } from 'node:fs/promises'
import { wedding } from '../../shared/wedding'

for (const width of [320, 390, 768, 1440]) for (const locale of ['en', 'te']) {
  test(`confirmed invitation remains readable at ${width}px in ${locale}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.addInitScript(locale => localStorage.setItem('wedding-language', locale), locale)
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/#home')
    await page.evaluate(() => document.fonts.ready)
    await expect(page.locator('#main section')).toHaveCount(7)
    await expect(page.locator('.journey-stop')).toHaveCount(7)
    await expect(page.locator('.journey-event-actions button')).toHaveCount(2)
    await expect(page.locator('#our-invitation .family-hosts')).toContainText('Nalini Sudha & Nagi Reddy Jonnala')
    await expect(page.locator('#our-invitation .family-bride-parents')).toContainText('Smt. Madhavi Latha & Sri. Ravi Shankar Reddy Pachipala')
    await expect(page.locator('#our-invitation .family-elders')).toContainText('Smt. & Sri. (Late) J. V. Subba Reddy')
    await expect(page.locator('.blessings-family')).toContainText('శ్రీ మన్నెం రంగారావు')
    await expect(page.locator('.blessings-family')).toContainText('శ్రీమతి ప్రమీలరాణి')
    await expect(page.locator('.blessings-family')).toContainText('మీ అందరి ఆగమనం మాకెంతో ఆనందం.')
    await expect(page.locator('.muhurtham-date time')).toHaveAttribute('datetime', '2026-12-20T03:40:00+05:30')
    await expect(page.locator('[data-event="reception"] time')).toHaveAttribute('datetime', '2026-12-19T19:00:00+05:30')
    await expect(page.locator('[data-event="wedding"] time')).toHaveAttribute('datetime', '2026-12-20T03:40:00+05:30')
    const maps = page.locator('#main a[href*="google.com/maps"]')
    await expect(maps).toHaveCount(3)
    for (const link of await maps.all()) await expect(link).toHaveAttribute('href', wedding.venue.mapsUrl)
    expect(await page.locator('#main').innerText()).not.toMatch(/13 December|7:20|Proposed|confirmation to follow|to be announced|working date/i)
    for (const selector of ['#home', '#muhurtham', '#our-invitation', '#celebrations', '#the-details', '#moments', '#blessings']) {
      await page.locator(selector).scrollIntoViewIfNeeded()
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false)
    }
    const collisions = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('.journey-caption')].map(el => el.getBoundingClientRect())
      const feet = [...document.querySelectorAll('.journey-step')].map(el => el.getBoundingClientRect())
      const end = document.querySelector('.journey-end')!.getBoundingClientRect()
      const dangling = [...document.querySelectorAll<HTMLAnchorElement>('#main a[href^="#"]')].map(link => link.hash.slice(1)).filter(id => !document.getElementById(id))
      return { feet: feet.some(a => cards.some(b => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top)), footer: cards.some(card => card.bottom > end.top), dangling }
    })
    expect(collisions).toEqual({ feet: false, footer: false, dangling: [] })
    if (width === 390 || width === 1440) {
      for (const selector of ['#our-invitation', '#the-details', '#muhurtham', '#blessings']) {
        await page.locator(selector).scrollIntoViewIfNeeded()
        await page.locator(selector).screenshot({ path: `verification/invitation-details/${selector.slice(1)}-${width}-${locale}.png` })
      }
      const scan = await new AxeBuilder({ page }).include('#our-invitation').include('#the-details').include('#celebrations').include('#blessings').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
      expect(scan.violations.map(issue => ({ id: issue.id, nodes: issue.nodes.map(node => node.target) }))).toEqual([])
    }
    expect(errors).toEqual([])
  })
}

test('guest actions preserve IST times, directions and confirmed sharing details', async ({ browser }) => {
  const context = await browser.newContext({ timezoneId: 'America/New_York', reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: async (data: ShareData) => { (window as unknown as { shared: ShareData }).shared = data } })
  })
  await page.goto('/#the-details')
  await expect(page.locator('[data-event="reception"] time')).toHaveText('Saturday, 19 December 20267:00 PM IST onwards')
  await expect(page.locator('[data-event="wedding"] time')).toHaveText('Sunday, 20 December 20263:40 AM IST')
  for (const [index, id] of ['reception', 'wedding'].entries()) {
    const downloadPromise = page.waitForEvent('download')
    await page.locator('.venue-schedule button').nth(index).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe(`${id}.ics`)
    const data = (await readFile((await download.path())!, 'utf8')).replace(/\r\n /g, '')
    expect(data).toContain(index === 0 ? 'DTSTART:20261219T133000Z' : 'DTSTART:20261219T221000Z')
    expect(data).toContain('The Environ Convention')
    expect(data).toContain('URL:' + wedding.venue.mapsUrl)
    expect(data).not.toContain('DTEND:')
  }
  await page.getByRole('button', { name: 'Share invitation', exact: true }).click()
  const shared = await page.evaluate(() => (window as unknown as { shared: ShareData }).shared)
  expect(shared.title).toBe('SaHa — Sai Sathvik & Harika')
  expect(shared.text).toContain('19 December 2026')
  expect(shared.text).toContain('20 December 2026')
  expect(shared.text).toContain('3:40 AM IST')
  expect(shared.text).toContain('The Environ Convention')
  expect(shared.url).toBe('http://127.0.0.1:5173/')
  await context.close()
})

for (const width of [320, 390, 1440]) test(`opening cover fits the display names at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: width === 320 ? 640 : 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Open invitation', exact: true })).toBeEnabled()
  await page.evaluate(() => document.fonts.ready)
  await expect(page.locator('#welcome-title')).toHaveAccessibleName('Sathvik & Harika')
  await expect(page.locator('#welcome-title')).not.toContainText('Sai')
  await expect(page.locator('.cover-month')).toHaveText('19–20 December 2026')
  await expect(page.locator('.cover-eyebrow')).toHaveText('Forever Begins')
  expect(await page.locator('#welcome-title').evaluate(el => { const b = el.getBoundingClientRect(); return b.left >= 0 && b.right <= innerWidth && el.scrollWidth <= el.clientWidth })).toBe(true)
  await page.screenshot({ path: `verification/invitation-details/cover-${width}.png` })
  await page.getByRole('button', { name: 'Open invitation', exact: true }).click()
  await expect(page.locator('.ceremonial-cover')).toHaveCount(0)
  await expect(page.locator('#main section')).toHaveCount(7)
  await expect(page.locator('#couple-name-first')).toContainText('Sai Sathvik')
})
