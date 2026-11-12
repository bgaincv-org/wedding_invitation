import { chromium } from 'playwright'
import { writeFile } from 'node:fs/promises'
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const results = []
try {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: 'reduce' })
    const failed = []
    page.on('response', response => { if (response.status() >= 400) failed.push({ url: new URL(response.url()).pathname, status: response.status() }) })
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    await cdp.send('Network.enable')
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1_600_000 / 8, uploadThroughput: 750_000 / 8 })
    await page.addInitScript(() => {
      window.__metrics = { lcpMs: 0, cls: 0, blockingMs: 0 }
      new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__metrics.lcpMs = entry.startTime }).observe({ type: 'largest-contentful-paint', buffered: true })
      new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__metrics.cls += entry.value }).observe({ type: 'layout-shift', buffered: true })
      new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__metrics.blockingMs += Math.max(0, entry.duration - 50) }).observe({ type: 'longtask', buffered: true })
    })
    await page.goto('http://127.0.0.1:3003', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
    const metrics = await page.evaluate(() => ({ ...window.__metrics, transferBytes: performance.getEntriesByType('resource').reduce((sum, entry) => sum + entry.transferSize, 0) }))
    results.push({ width, ...metrics, failedRequests: failed })
    await page.close()
  }
} finally { await browser.close() }
const result = { environment: 'Local production build with gzip, Edge, 4x CPU slowdown, 1.6 Mbps / 150ms network. Lab measurements, not field CWV or a Lighthouse score.', results }
await writeFile('artifacts/performance.json', JSON.stringify(result, null, 2))
console.log(JSON.stringify(result))
