import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

await mkdir('public/art/blessings', { recursive: true })
const source = 'asset-sources/blessings/srinivasa-kalyanam-unframed.png'
for (const [name, width] of [['srinivasa-kalyanam', 1448], ['srinivasa-kalyanam-mobile', 768]]) {
  const result = await sharp(source).resize({ width, withoutEnlargement: true })
    .webp({ quality: 92 }).toFile(`public/art/blessings/${name}.webp`)
  console.log(`${name}: ${result.width} × ${result.height}, ${Math.round(result.size / 1024)} KB`)
}
