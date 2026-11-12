import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
await mkdir('public/art/couple', { recursive: true })
for (const [name, width] of Object.entries({ peacock: 480, 'lotus-crest': 720, 'temple-sketch': 700, 'pavilion-sketch': 700, 'lotus-corner': 500, 'mango-toran': 1100, 'hanging-lamp': 320, 'floor-rangoli': 800 })) {
  const input = `asset-sources/couple/${name}.png`
  const meta = await sharp(input).metadata()
  if (!meta.hasAlpha) throw new Error(`${name} requires transparency`)
  const info = await sharp(input).resize({width, withoutEnlargement:true}).webp({quality:84,alphaQuality:100}).toFile(`public/art/couple/${name}.webp`)
  console.log(`${name}: ${(info.size/1024).toFixed(1)} KB`)
}
