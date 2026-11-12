import { test, expect } from '@playwright/test'

for (const width of [390, 1440]) {
  test(`production invitation opens without a backend at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    const errors: string[] = []
    const apiRequests: string[] = []
    const failedAssets: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('request', request => {
      if (new URL(request.url()).pathname.startsWith('/api/')) apiRequests.push(request.url())
    })
    page.on('response', response => {
      if (response.url().startsWith('http://127.0.0.1:5173/') && response.status() >= 400) failedAssets.push(response.url())
    })

    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
    await page.getByRole('button', { name: 'Open invitation', exact: true }).click()
    await expect(page.locator('.experience')).toHaveClass(/is-entered/, { timeout: 20000 })
    await expect(page.locator('#main section')).toHaveCount(7)
    await expect(page.locator('#couple-name-first')).toContainText('Sai Sathvik')
    await expect(page.locator('#couple-name-second')).toContainText('Harika')

    for (const section of await page.locator('#main section').all()) {
      await section.scrollIntoViewIfNeeded()
      await expect(section).toBeVisible()
      await section.locator('img').evaluateAll(async images => {
        await Promise.all(images.map(async image => {
          image.loading = 'eager'
          await image.decode()
        }))
      })
    }
    await expect(page.locator('.memory-brand-placeholder')).toHaveCount(4)
    await expect(page.locator('.wedding-song-player, audio, #rsvp')).toHaveCount(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    expect(errors).toEqual([])
    expect(apiRequests).toEqual([])
    expect(failedAssets).toEqual([])

    await page.reload()
    await expect(page.getByRole('button', { name: 'Open invitation', exact: true })).toBeVisible()
  })
}

test('static hosting serves section links, nested page refreshes and real assets', async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#moments')
  await expect(page.getByRole('heading', { name: 'Before the Vows' })).toBeInViewport()

  const response = await page.goto('/invitation')
  expect(response?.status()).toBe(200)
  await expect(page.getByRole('button', { name: 'Open invitation', exact: true })).toBeVisible()
  await page.reload()
  await page.getByRole('button', { name: 'Open invitation', exact: true }).click()
  await expect(page.locator('#main section')).toHaveCount(7)

  for (const path of ['/art/branding/saha-monogram.svg', '/art/branding/saha-wax-seal.webp', '/favicon.svg']) {
    const asset = await request.get(path)
    expect(asset.status()).toBe(200)
    expect(asset.headers()['content-type']).toMatch(/^image\//)
  }
})
