import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

for (const width of [320, 360, 375, 390, 430, 768, 1024, 1440]) {
  test(`reference invitation cover fits ${width}px in English and Telugu`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 320 ? 568 : 844 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const failed: string[] = []
    page.on('response', response => { if (response.status() >= 400) failed.push(response.url()) })
    for (const locale of ['en', 'te']) {
      await page.addInitScript(value => { localStorage.setItem('wedding-language', value); sessionStorage.clear() }, locale)
      await page.goto('/')
      const dialog = page.locator('.ceremonial-cover')
      await expect(dialog).toBeVisible()
      await expect(page.locator('#welcome-title')).toBeFocused()
      await page.locator('.cover-vinayaka').evaluate(image => (image as HTMLImageElement).decode())
      const title = await page.locator('#welcome-title').boundingBox()
      const button = await page.locator('.cover-open-button').boundingBox()
      expect(title!.x).toBeGreaterThanOrEqual(0)
      expect(title!.x + title!.width).toBeLessThanOrEqual(width + 1)
      expect(button!.y + button!.height).toBeLessThan(width === 320 ? 568 : 844)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      await page.locator('.cover-open-button').click()
      await expect(dialog).not.toBeVisible()
      await expect(page.locator('#hero-title')).toBeFocused()
    }
    expect(failed).toEqual([])
  })
}

test('first arrival opens two fabrics, then the invitation button plays the knot before five chapters', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await expect(page.locator('.split-curtain')).toHaveClass(/has-webgl/)
  await expect(page.locator('.cloth-pancha canvas')).toBeVisible()
  await expect(page.locator('.cloth-saree canvas')).toBeVisible()
  await expect(page.locator('.knot-curtain')).not.toBeAttached()
  await expect(page.locator('.ceremonial-cover')).toHaveClass(/is-intro/)
  await expect(page.locator('.cover-open-button')).toBeDisabled()
  await expect(page.locator('.ceremonial-cover')).toHaveClass(/is-cover/, { timeout: 12000 })
  await expect(page.locator('.silk-curtain')).not.toBeAttached()
  await expect(page.locator('.cover-open-button')).toBeDisabled()
  await expect(page.locator('.cover-open-button')).toBeEnabled({ timeout: 12000 })
  await expect(page.locator('.cover-vinayaka')).toHaveCSS('opacity', '1')
  await expect(page.locator('.cover-art')).toHaveClass(/is-animated/)
  await page.getByRole('button', { name: 'Open invitation', exact: true }).click()
  await expect(page.locator('.knot-curtain')).toBeVisible()
  await expect(page.locator('.knot-art canvas')).toBeVisible()
  await expect(page.locator('.sound-control')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.hero-copy')).toHaveCSS('visibility', 'hidden')
  await expect(page.locator('.welcome-dialog')).not.toBeVisible({ timeout: 12000 })
  await expect(page.locator('#main > .invitation-chapter')).toHaveCount(5)
  await expect(page.locator('.site-header')).toHaveCount(0)
  await expect(page.getByRole('navigation', { name: 'Guest shortcuts' }).getByRole('link')).toHaveCount(3)
  await expect(page.locator('#hero-title')).toBeFocused()
  await expect(page.locator('#our-families')).toBeAttached()
  await page.reload()
  await expect(page.locator('html')).not.toHaveClass(/is-welcome-loading/)
  await expect(page.locator('.silk-curtain')).not.toBeAttached()
  await expect(page.locator('.ceremonial-cover')).toHaveClass(/is-cover/)
  await expect(page.locator('#welcome-title')).toBeFocused()
  expect(errors).toEqual([])
})

for (const width of [390, 1440]) {
  test(`the invitation cover returns on every reload at ${width}px including section URLs`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    // Reload before opening, after opening, and after navigating to a section.
    for (const destination of ['cover', 'main', 'rsvp']) {
      if (destination !== 'cover') {
        await page.getByRole('button', { name: 'Open invitation', exact: true }).click()
        await expect(page.locator('.ceremonial-cover')).not.toBeAttached()
        if (destination === 'rsvp') await page.getByRole('navigation', { name: 'Guest shortcuts' }).getByRole('link', { name: 'RSVP' }).click()
      }
      await page.reload()
      await expect(page.locator('.ceremonial-cover')).toHaveClass(/is-cover/)
      await expect(page.locator('#welcome-title')).toBeFocused()
      await expect(page.locator('.cover-open-button')).toBeEnabled()
      await expect(page.locator('.silk-curtain')).not.toBeAttached()
    }
    await page.getByRole('button', { name: 'Open invitation', exact: true }).click()
    await expect(page.locator('#main > .invitation-chapter')).toHaveCount(5)
    await expect(page.locator('#hero-title')).toBeFocused()
  })
}

test('both fabrics and the knot complete successfully without WebGL', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', { value: () => null }))
  await page.goto('/')
  await expect(page.locator('.cloth-pancha .cloth-fallback-panel')).toBeVisible()
  await expect(page.locator('.cloth-saree .cloth-fallback-panel')).toBeVisible()
  await expect(page.locator('.ceremonial-cover')).toHaveClass(/is-cover/, { timeout: 12000 })
  await page.getByRole('button', { name: 'Open invitation', exact: true }).click()
  await expect(page.locator('.knot-art img')).toBeVisible()
  await expect.poll(() => page.locator('.knot-art').evaluate(art => Number(getComputedStyle(art).opacity))).toBeLessThan(.8)
  await expect(page.locator('.welcome-dialog')).not.toBeVisible({ timeout: 12000 })
  await expect(page.locator('#hero-title')).toBeFocused()
})

test('a failed knot texture and a changed motion preference cannot trap the guest', async ({ page }) => {
  await page.route('**/art/cover/wedding-knot.webp', route => route.abort())
  await page.goto('/')
  await page.getByRole('button', { name: 'Open invitation', exact: true }).click()
  await expect(page.locator('.knot-curtain')).toBeAttached()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.welcome-dialog')).not.toBeAttached()
  await expect(page.locator('#home, #muhurtham, #celebrations, #moments, #blessings')).toHaveCount(5)
  await expect(page.locator('#hero-title')).toBeFocused()
})

test('a missing knot image still reveals the invitation automatically', async ({ page }) => {
  await page.route('**/art/cover/wedding-knot.webp', route => route.abort())
  await page.goto('/')
  await expect(page.locator('.ceremonial-cover')).toHaveClass(/is-intro/)
  await expect(page.locator('.ceremonial-cover')).toHaveClass(/is-cover/, { timeout: 12000 })
  await page.getByRole('button', { name: 'Open invitation', exact: true }).click()
  await expect(page.locator('#hero-title')).toBeFocused({ timeout: 12000 })
})

test('decorative motion pauses and survives portrait resizing', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.ceremonial-cover')).toHaveClass(/is-cover/, { timeout: 12000 })
  await expect(page.locator('.cover-art')).toHaveClass(/is-animated/)
  await expect(page.locator('.cover-open-button')).toHaveCSS('opacity', '1')
  // A canvas screenshot also captures overlaid text; finish the separate writing first.
  await expect(page.locator('.cover-open-button')).toBeEnabled()
  await expect(page.locator('.cover-copy [data-writing-state="complete"]')).toHaveCount(2)
  await page.getByRole('button', { name: 'Pause decorative motion' }).click()
  await expect(page.getByRole('button', { name: 'Resume decorative motion' })).toHaveAttribute('aria-pressed', 'true')
  const renderedPose = () => page.locator('.cover-live-art').evaluate(element => {
    const gl = (element as HTMLCanvasElement).getContext('webgl')!
    const program = gl.getParameter(gl.CURRENT_PROGRAM) as WebGLProgram
    const uniforms = ['u_lamp_left', 'u_lamp_right', 'u_banana_wind', 'u_flicker', ...Array.from({length:8}, (_, i) => `u_leaves[${i}]`), ...Array.from({length:4}, (_, i) => `u_flowers[${i}]`)]
    return uniforms.map(name => gl.getUniform(program, gl.getUniformLocation(program, name)!))
  })
  const frozenPose = await renderedPose()
  const stillFrame = await page.locator('.cover-live-art').screenshot()
  await page.waitForTimeout(350)
  expect(Buffer.compare(stillFrame, await page.locator('.cover-live-art').screenshot())).toBe(0)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.locator('.cover-art img')).toHaveJSProperty('currentSrc', 'http://127.0.0.1:5173/art/cover/reference-scene-mobile.webp')
  await expect(page.locator('.cover-art')).toHaveClass(/is-animated/)
  await page.setViewportSize({ width: 1280, height: 720 })
  await expect(page.locator('.cover-art img')).toHaveJSProperty('currentSrc', 'http://127.0.0.1:5173/art/cover/reference-scene.webp')
  await expect(page.locator('.cover-art')).toHaveClass(/is-animated/)
  // Resizing rerasterizes text/texture edges; compare the actual rendered physics state.
  await expect.poll(renderedPose).toEqual(frozenPose)
  await page.getByRole('button', { name: 'Resume decorative motion' }).click()
  await expect(page.getByRole('button', { name: 'Pause decorative motion' })).toHaveAttribute('aria-pressed', 'false')
  await page.getByRole('button', { name: 'Open invitation', exact: true }).click()
  await expect(page.locator('.cover-live-art')).not.toBeAttached()
})

test('the first paint shows panche and saree side by side while the bundle loads', async ({ page }) => {
  let release!: () => void
  const pending = new Promise<void>(resolve => { release = resolve })
  await page.route('**/src/main.tsx', async route => { await pending; await route.continue() })
  try {
    await page.goto('/', { waitUntil: 'commit' })
    await expect(page.locator('html')).toHaveClass(/is-welcome-loading/)
    await expect(page.locator('#root')).toBeAttached()
    const paints = await page.locator('#root').evaluate(root => ['::before', '::after'].map(side => getComputedStyle(root, side).backgroundImage))
    expect(paints[0]).toContain('pancha-silk.webp')
    expect(paints[1]).toContain('dharmavaram-silk.webp')
  } finally { release() }
  await expect(page.locator('.silk-curtain')).toBeAttached()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.ceremonial-cover')).toHaveClass(/is-cover/)
})

test('lost fabric and knot contexts fall back and complete both reveals', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await expect(page.locator('.split-curtain')).toHaveClass(/has-webgl/)
  await page.locator('.cloth-pancha canvas').evaluate(canvas => (canvas as HTMLCanvasElement).getContext('webgl')?.getExtension('WEBGL_lose_context')?.loseContext())
  await expect(page.locator('.cloth-pancha .cloth-fallback-panel')).toBeVisible()
  await expect(page.locator('.ceremonial-cover')).toHaveClass(/is-cover/, { timeout: 12000 })
  await page.getByRole('button', { name: 'Open invitation', exact: true }).click()
  await expect(page.locator('.knot-curtain')).toHaveClass(/has-webgl/)
  await page.locator('.knot-art canvas').evaluate(canvas => (canvas as HTMLCanvasElement).getContext('webgl')?.getExtension('WEBGL_lose_context')?.loseContext())
  await expect(page.locator('.knot-art img')).toBeVisible()
  await expect(page.locator('.welcome-dialog')).not.toBeAttached({ timeout: 12000 })
  await expect(page.locator('#home, #muhurtham, #celebrations, #moments, #blessings')).toHaveCount(5)
  expect(errors).toEqual([])
})

test('missing fabric textures still reveal the cover and repeated clicks produce one knot', async ({ page }) => {
  await page.route('**/art/*-silk.webp', route => route.abort())
  await page.goto('/')
  await expect(page.locator('.cloth-half')).toHaveCount(2)
  await expect(page.locator('.ceremonial-cover')).toHaveClass(/is-cover/, { timeout: 12000 })
  await page.locator('.cover-open-button').click()
  await page.locator('.cover-open-button').dispatchEvent('click')
  await expect(page.locator('.knot-curtain')).toHaveCount(1)
  await expect(page.locator('.welcome-dialog')).not.toBeAttached({ timeout: 12000 })
  await expect(page.locator('#hero-title')).toBeFocused()
  await expect(page.locator('audio.wedding-audio')).toHaveCount(1)
})

test('reference artwork and decorated invitation dialog remain accessible', async ({ page }) => {
  await page.goto('/')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.locator('.cover-art img').evaluate(image => (image as HTMLImageElement).decode())
  await expect(page.locator('.cover-art')).toBeVisible()
  await page.getByRole('button', { name: 'Open invitation', exact: true }).click()
  await page.getByRole('button', { name: 'Open the invitation', exact: true }).click()
  const dialog = page.locator('.invitation-dialog')
  await expect(dialog.locator('.dialog-vinayaka')).toBeVisible()
  const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(scan.violations).toEqual([])
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Open the invitation', exact: true })).toBeFocused()
})

test('the wedding song plays inside the page and credits the official recording', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.locator('.cover-open-button').click()
  const song = page.locator('.wedding-song-player')
  await expect(song).toHaveCSS('position', 'fixed')
  await page.getByLabel('Song and artwork credits', { exact: true }).click()
  await expect(song).toContainText('Pidikita Talambrala')
  await expect(page.locator('.song-credit')).toHaveAttribute('href', 'https://www.tirumala.org/Annamacharya_Keertanas_Sravanam.aspx')
  await expect(page.locator('.sound-control')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.site-footer')).toBeHidden()
})
