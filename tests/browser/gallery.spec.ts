import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdir } from 'node:fs/promises'

for (const width of [320, 390, 768, 1440]) {
  test(`gallery follows events and fits ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/#moments')
    const gallery = page.locator('#the-details + #moments')
    await expect(gallery).toBeVisible()
    await expect(gallery.getByRole('heading', { name: 'Before the Vows' })).toBeInViewport()
    await expect(gallery.locator('.memory-figure')).toHaveCount(4)
    await expect(gallery.locator('.memory-ornament img')).toHaveCount(2)
    await gallery.locator('img').evaluateAll(async elements => {
      await Promise.all(elements.map(async node => {
        const image = node as HTMLImageElement
        image.loading = 'eager'
        await image.decode()
      }))
    })
    const layout = await gallery.locator('.memory-image-button').evaluateAll(nodes => nodes.map(node => {
      const box = node.getBoundingClientRect()
      return { x: box.x, y: box.y, width: box.width, right: box.right, bottom: box.bottom }
    }))
    expect(layout[0].width).toBeGreaterThan(layout[1].width)
    if (width > 600) {
      expect(layout[1].y).toBeGreaterThan(layout[0].y + 60)
      expect(layout[1].x).toBeGreaterThan(layout[0].right)
    } else {
      expect(layout[1].y).toBeGreaterThan(layout[0].bottom)
      expect(layout[1].x).toBeGreaterThan(layout[0].x)
    }
    const overlaps = layout.some((a, index) => layout.slice(index + 1).some(b =>
      a.x < b.right && a.right > b.x && a.y < b.bottom && a.bottom > b.y))
    expect(overlaps).toBe(false)
    expect(layout.every(box => box.x >= 0 && box.right <= width)).toBe(true)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const scan = await new AxeBuilder({ page }).include('#moments').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(scan.violations).toEqual([])
    await mkdir('verification/gallery', { recursive: true })
    await gallery.screenshot({ path: `verification/gallery/gallery-${width}.png` })
    const trigger = gallery.getByRole('button', { name: 'Open: An evening wrapped in jasmine' })
    await trigger.click()
    const dialog = page.locator('.memory-dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('.memory-brand-placeholder img').first()).toBeVisible()
    await page.screenshot({ path: `verification/gallery/viewer-${width}.png` })
    await dialog.getByRole('button', { name: 'Close gallery', exact: true }).click()
    await expect(dialog).not.toBeVisible()
    await expect(trigger).toBeFocused()
    expect(errors).toEqual([])
  })
}

test('gallery appears after opening the invitation and reveals while scrolling', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open invitation', exact: true }).click()
  await expect(page.locator('.experience')).toHaveClass(/is-entered/, { timeout: 20000 })
  const gallery = page.locator('#the-details + #moments')
  await expect(gallery).toBeAttached()
  for (const image of await gallery.locator('.memory-figure').all()) {
    await image.scrollIntoViewIfNeeded()
    await expect(image).toHaveCSS('opacity', '1')
  }
})

test('gallery ornaments pause offscreen, in the viewer, on request and for reduced motion', async ({ page }) => {
  await page.goto('/#moments')
  const gallery = page.locator('#moments')
  const ornament = gallery.locator('.memory-ornament img').first()
  const toran = gallery.locator('.memory-toran')
  await expect(gallery).toHaveAttribute('data-motion-active', 'true')
  await expect(ornament).toHaveCSS('animation-play-state', 'running')
  const initial = await ornament.evaluate(node => getComputedStyle(node).transform)
  await expect.poll(() => ornament.evaluate(node => getComputedStyle(node).transform)).not.toBe(initial)
  await gallery.getByRole('button', { name: 'Open: An evening wrapped in jasmine' }).click()
  await expect(ornament).toHaveCSS('animation-play-state', 'paused')
  await expect(toran).toHaveCSS('animation-play-state', 'paused')
  await page.keyboard.press('Escape')
  await expect(ornament).toHaveCSS('animation-play-state', 'running')
  await gallery.getByRole('button', { name: 'Pause ornaments', exact: true }).click()
  await expect(ornament).toHaveCSS('animation-play-state', 'paused')
  await expect(toran).toHaveCSS('animation-play-state', 'paused')
  await expect(gallery.getByRole('button', { name: 'Resume ornaments' })).toHaveAttribute('aria-pressed', 'true')
  await gallery.getByRole('button', { name: 'Resume ornaments', exact: true }).click()
  await expect(ornament).toHaveCSS('animation-play-state', 'running')
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await expect(gallery).toHaveAttribute('data-motion-active', 'false')
  await expect(ornament).toHaveCSS('animation-play-state', 'paused')
  await expect(toran).toHaveCSS('animation-play-state', 'paused')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await gallery.scrollIntoViewIfNeeded()
  await expect(ornament).toHaveCSS('animation-name', 'none')
  await expect(toran).toHaveCSS('animation-name', 'none')
})

test('missing gallery image has a readable fallback in the grid and viewer', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.route('**/art/branding/saha-wax-seal.webp', route => route.abort())
  await page.goto('/#moments')
  const first = page.locator('.memory-image-button').first()
  await expect(first.locator('.memory-image-fallback')).toBeVisible()
  await first.click()
  await expect(page.locator('.memory-dialog .memory-image-fallback')).toBeVisible()
  await page.getByRole('button', { name: 'Next image', exact: true }).click()
  await expect(page.locator('.memory-dialog-stage img').first()).toBeVisible()
})
