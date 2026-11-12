import sharp from 'sharp'
import { mkdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const assets = JSON.parse(await readFile(new URL('../asset-sources/journey-ceremonies/prompts.json', import.meta.url), 'utf8'))
const destination = new URL('../public/art/journey/ceremonies/', import.meta.url)
await mkdir(destination, { recursive: true })
for (const { id } of assets) {
  const source = new URL(`../asset-sources/journey-ceremonies/${id}.png`, import.meta.url)
  for (const width of [256, 512]) {
    const output = new URL(`${id}${width === 256 ? '-small' : ''}.webp`, destination)
    await sharp(fileURLToPath(source)).resize(width, width, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 86, alphaQuality: 100, effort: 5 }).toFile(fileURLToPath(output))
  }
  console.log(`Prepared ${id}: transparent 256px and 512px WebP`)
}
