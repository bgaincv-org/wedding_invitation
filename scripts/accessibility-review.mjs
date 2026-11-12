import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import { writeFile } from 'node:fs/promises'
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
const page = await context.newPage()
await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' })
const intro = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
console.log(JSON.stringify({ scene: 'intro', violations: intro.violations }))
await page.getByRole('button', { name: 'Open invitation', exact: true }).click()
for (const locale of ['en', 'te']) {
  if (locale === 'te') await page.getByRole('button', { name: 'Switch to Telugu' }).click()
  await page.locator('#rsvp').scrollIntoViewIfNeeded()
  await page.locator('.rsvp-form').waitFor()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  await writeFile(`artifacts/accessibility-${locale}.json`, JSON.stringify(results, null, 2))
  console.log(JSON.stringify({ locale, violations: results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })) }))
}
await browser.close()
