import { test, expect } from '@playwright/test'

const track = '**/audio/pidikita-talambrala-vani-jairam.mp3'

for (const width of [390, 1440]) {
  test(`real MP3 plays, fades, pauses, resumes and loops at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/')
    const audio = page.locator('audio.wedding-audio')
    await expect(audio).toHaveJSProperty('paused', true)
    await expect(audio).toHaveJSProperty('currentTime', 0)
    await page.locator('.cover-open-button').click()
    await expect(page.locator('.sound-control')).toHaveAttribute('data-song-state', 'playing')
    await expect.poll(() => audio.evaluate((el: HTMLAudioElement) => el.currentTime)).toBeGreaterThan(1.5)
    await expect(audio).toHaveJSProperty('muted', false)
    await expect(audio).toHaveJSProperty('volume', .35)
    await expect.poll(() => audio.evaluate((el: HTMLAudioElement) => el.duration)).toBeGreaterThan(200)
    await expect(page.locator('iframe')).toHaveCount(0)
    await page.getByRole('button', { name: 'Pause wedding song', exact: true }).click()
    await expect(audio).toHaveJSProperty('paused', true)
    const pausedAt = await audio.evaluate((el: HTMLAudioElement) => el.currentTime)
    await page.getByRole('button', { name: 'Play wedding song', exact: true }).click()
    await expect.poll(() => audio.evaluate((el: HTMLAudioElement) => el.currentTime)).toBeGreaterThan(pausedAt + .3)
    await audio.evaluate((el: HTMLAudioElement) => { el.currentTime = el.duration - .4 })
    await expect.poll(() => audio.evaluate((el: HTMLAudioElement) => el.currentTime)).toBeLessThan(3)
    await expect(audio).toHaveJSProperty('paused', false)
    await page.reload()
    await expect(page.locator('.welcome-dialog')).toBeVisible()
    await expect(audio).toHaveJSProperty('paused', true)
    await expect(audio).toHaveJSProperty('currentTime', 0)
    expect(errors).toEqual([])
  })
}

test('browser playback rejection offers a direct play action which plays the real MP3', async ({ page }) => {
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play
    let rejected = false
    HTMLMediaElement.prototype.play = function () {
      if (!rejected && this.tagName === 'AUDIO') { rejected = true; return Promise.reject(new DOMException('User activation required', 'NotAllowedError')) }
      return play.call(this)
    }
  })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.locator('.cover-open-button').click()
  await expect(page.locator('.sound-control')).toHaveAttribute('data-song-state', 'blocked')
  await expect(page.locator('.sound-control')).toHaveAttribute('aria-pressed', 'false')
  await expect(page.locator('.song-notice')).toContainText('Tap Play song')
  await page.getByRole('button', { name: 'Play wedding song', exact: true }).click()
  await expect.poll(() => page.locator('audio.wedding-audio').evaluate((el: HTMLAudioElement) => el.currentTime)).toBeGreaterThan(.3)
  await expect(page.locator('.sound-control')).toHaveAttribute('aria-pressed', 'true')
})

test('a failed audio download can be retried without reloading the invitation', async ({ page }) => {
  await page.route(track, route => route.fulfill({ status: 503, body: 'Unavailable' }))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.locator('.cover-open-button').click()
  await expect(page.locator('.sound-control')).toHaveAttribute('data-song-state', 'error')
  await expect(page.locator('.sound-control')).toHaveAttribute('aria-pressed', 'false')
  await page.unroute(track)
  await page.getByRole('button', { name: 'Play wedding song', exact: true }).click()
  await expect.poll(() => page.locator('audio.wedding-audio').evaluate((el: HTMLAudioElement) => el.currentTime)).toBeGreaterThan(.3)
})

test('cancelling a slow song load prevents a late playback start', async ({ page }) => {
  let release!: () => void
  const ready = new Promise<void>(resolve => { release = resolve })
  await page.route(track, async route => { await ready; await route.continue() })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.locator('.cover-open-button').click()
  await page.getByRole('button', { name: 'Cancel loading song' }).click()
  release()
  await expect(page.locator('audio.wedding-audio')).toHaveJSProperty('paused', true)
  await expect(page.locator('.sound-control')).toHaveAttribute('data-song-state', 'paused')
  await page.getByRole('button', { name: 'Play wedding song', exact: true }).click()
  await expect.poll(() => page.locator('audio.wedding-audio').evaluate((el: HTMLAudioElement) => el.currentTime)).toBeGreaterThan(.3)
})
