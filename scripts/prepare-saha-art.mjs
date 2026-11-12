import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import { readFile, writeFile } from 'node:fs/promises'

await sharp(fileURLToPath(new URL('../asset-sources/branding/saha-wax-seal-original.png', import.meta.url)))
  .webp({ lossless: true, effort: 6 })
  .toFile(fileURLToPath(new URL('../public/art/branding/saha-wax-seal.webp', import.meta.url)))

const asset = path => fileURLToPath(new URL(`../${path}`, import.meta.url))
const monogram = await readFile(asset('public/art/branding/saha-monogram.svg'), 'utf8')
const viewBox = monogram.match(/viewBox="([^"]+)"/)[1]
const paths = monogram.match(/<g[\s\S]*<\/g>/)[0].replace('#8e2945', '#f0cc7e')
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="#79132b"/><svg x="28" y="24" width="72" height="80" viewBox="${viewBox}">${paths}</svg></svg>\n`
await writeFile(asset('public/favicon.svg'), icon)
for (const [size, path] of [[32, 'favicon-32.png'], [180, 'apple-touch-icon.png'], [192, 'art/branding/saha-icon-192.png'], [512, 'art/branding/saha-icon-512.png']]) {
  await sharp(Buffer.from(icon)).resize(size, size).png().toFile(asset(`public/${path}`))
}
console.log('Exported the original seal, SaHa browser icon and home-screen icons.')
