import { test, expect } from '@playwright/test'

type IntroLog = {
  changes: { time: number; stage: string; gpuPanels: number }[]
  compiles: { time: number; duringReveal: boolean }[]
  frames: { delta: number; stage: string }[]
  end: number
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const log: IntroLog = { changes: [], compiles: [], frames: [], end: 0 }
    Object.assign(window, { introLog: log })
    const compile = WebGLRenderingContext.prototype.compileShader
    WebGLRenderingContext.prototype.compileShader = function (shader) {
      log.compiles.push({ time: performance.now(), duringReveal: !!document.querySelector('.split-curtain[data-stage="revealing"]') })
      compile.call(this, shader)
    }
    let previous = 0, signature = '', seen = false
    const tick = (now: number) => {
      const curtain = document.querySelector<HTMLElement>('.split-curtain')
      if (curtain) {
        seen = true
        const stage = curtain.dataset.stage!, gpuPanels = curtain.querySelectorAll('.cloth-half.has-webgl').length
        const next = `${stage}:${gpuPanels}`
        if (signature !== next) { log.changes.push({ time: performance.now(), stage, gpuPanels }); signature = next }
        if (previous) log.frames.push({ delta: now - previous, stage })
        previous = now
      } else if (seen) { log.end = performance.now(); return }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
})

for (const width of [320, 1440]) test(`cold opening commits both cloths together and reveals a prepared cover at ${width}px`, async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.setViewportSize({ width, height: 900 })
  await page.goto('/')
  await expect(page.locator('.split-curtain')).toHaveAttribute('data-stage', 'revealing')
  await expect(page.locator('.cloth-half.has-webgl')).toHaveCount(2)
  await expect(page.locator('.cover-art img')).toHaveCSS('opacity', '1')
  const image = await page.locator('.cover-art img').evaluate(element => ({ complete: (element as HTMLImageElement).complete, width: (element as HTMLImageElement).naturalWidth }))
  expect(image.complete && image.width > 0).toBeTruthy()
  await expect(page.locator('.ceremonial-cover')).toHaveClass(/is-cover/, { timeout: 6000 })
  await expect(page.locator('.cover-art')).toHaveClass(/is-animated/)
  await page.waitForFunction(() => (window as unknown as { introLog: IntroLog }).introLog.end > 0)
  const log = await page.evaluate(() => (window as unknown as { introLog: IntroLog }).introLog)
  expect(log.changes.every(change => change.gpuPanels !== 1)).toBeTruthy()
  expect(log.changes.filter(change => change.stage === 'revealing')).toHaveLength(1)
  expect(log.compiles.filter(compile => compile.duringReveal)).toEqual([])
  const start = log.changes.find(change => change.stage === 'revealing')!.time
  expect(log.end - start).toBeGreaterThan(2500)
  expect(log.end - start).toBeLessThan(3000)
  await expect(page.locator('.cover-open-button')).toBeEnabled()
  expect(errors).toEqual([])
})

test('a late fabric stays on the same fallback without shader work during opening', async ({ page }) => {
  let release!: () => void
  const pending = new Promise<void>(resolve => { release = resolve })
  await page.route('**/art/dharmavaram-silk.webp', async route => { await pending; await route.continue() })
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.split-curtain')).toHaveAttribute('data-stage', 'revealing')
    await expect(page.locator('.cloth-half.has-webgl')).toHaveCount(0)
    await expect(page.locator('.cloth-saree .cloth-fallback-panel')).toHaveCSS('background-image', 'none')
    release()
    await page.evaluate(async () => { const image = new Image(); image.src = '/art/dharmavaram-silk.webp'; await image.decode() })
    await expect(page.locator('.cloth-half.has-webgl')).toHaveCount(0)
    await expect(page.locator('.cloth-saree .cloth-fallback-panel')).toHaveCSS('background-image', 'none')
    await expect(page.locator('.ceremonial-cover')).toHaveClass(/is-cover/)
    const log = await page.evaluate(() => (window as unknown as { introLog: IntroLog }).introLog)
    expect(log.compiles.filter(compile => compile.duringReveal)).toEqual([])
    expect(log.changes.filter(change => change.stage === 'revealing')).toHaveLength(1)
  } finally { release() }
})

test('a late cover waits until the cloths clear before preparing its animation', async ({ page }) => {
  let release!: () => void
  const pending = new Promise<void>(resolve => { release = resolve })
  await page.route('**/art/cover/reference-scene*.webp', async route => { await pending; await route.continue() })
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.split-curtain')).toHaveAttribute('data-stage', 'revealing')
    release()
    await page.locator('.cover-art img').evaluate(image => (image as HTMLImageElement).decode())
    await expect(page.locator('.cover-art')).not.toHaveClass(/is-animated/)
    await expect(page.locator('.ceremonial-cover')).toHaveClass(/is-cover/)
    await expect(page.locator('.cover-art')).toHaveClass(/is-animated/)
    const log = await page.evaluate(() => (window as unknown as { introLog: IntroLog }).introLog)
    expect(log.compiles.filter(compile => compile.duringReveal)).toEqual([])
    await expect(page.locator('.cover-art img')).toHaveCSS('opacity', '1')
  } finally { release() }
})

const readOpen = (canvas: HTMLCanvasElement) => {
  const gl = canvas.getContext('webgl')!, program = gl.getParameter(gl.CURRENT_PROGRAM) as WebGLProgram
  return gl.getUniform(program, gl.getUniformLocation(program, 'u_open')!) as number
}

test('the two curtains resume from the same pose after a hidden tab', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.split-curtain')).toHaveAttribute('data-stage', 'revealing')
  await expect.poll(() => page.locator('.cloth-pancha canvas').evaluate(readOpen)).toBeGreaterThan(.05)
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')) })
  const before = await page.locator('.cloth-pancha canvas').evaluate(readOpen)
  await page.waitForTimeout(350)
  expect(await page.locator('.cloth-pancha canvas').evaluate(readOpen)).toBe(before)
  expect(await page.locator('.cloth-saree canvas').evaluate(readOpen)).toBe(before)
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')) })
  await expect.poll(() => page.locator('.cloth-pancha canvas').evaluate(readOpen)).toBeGreaterThan(before)
  await expect(page.locator('.ceremonial-cover')).toHaveClass(/is-cover/)
})

test('resizing during the pull preserves progress and the final invitation', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await expect(page.locator('.split-curtain')).toHaveAttribute('data-stage', 'revealing')
  await expect.poll(() => page.locator('.cloth-pancha canvas').evaluate(readOpen)).toBeGreaterThan(.05)
  const before = await page.locator('.cloth-pancha canvas').evaluate(readOpen)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect.poll(() => page.locator('.cloth-pancha canvas').evaluate(readOpen)).toBeGreaterThan(before)
  await expect(page.locator('.ceremonial-cover')).toHaveClass(/is-cover/)
  await expect(page.locator('.cover-art img')).toHaveJSProperty('currentSrc', 'http://127.0.0.1:5173/art/cover/reference-scene-mobile.webp')
  await page.getByRole('button', { name: 'Open invitation', exact: true }).click()
  await expect(page.locator('#hero-title')).toBeFocused({ timeout: 6500 })
  expect(errors).toEqual([])
})
