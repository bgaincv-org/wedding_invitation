import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

await mkdir('public/art/gallery', { recursive: true })
for (const name of ['ceremonial-parasol', 'jasmine-lamp']) {
  const source = `asset-sources/gallery/${name}.png`
  const image = sharp(source)
  const metadata = await image.metadata()
  if (!metadata.hasAlpha) throw new Error(`${source} must have a transparent background`)
  const result = await image.resize({ width: 640, withoutEnlargement: true })
    .webp({ quality: 88, alphaQuality: 100 })
    .toFile(`public/art/gallery/${name}.webp`)
  console.log(`${name}: ${result.width} × ${result.height}, ${Math.round(result.size / 1024)} KB`)
}
