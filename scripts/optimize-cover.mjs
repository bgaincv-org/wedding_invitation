import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
await mkdir('public/art/cover', { recursive: true })
const sizes = { paper: 1400, toran: 1800, vinayaka: 300, 'hanging-deepam': 220, 'temple-landscape': 1800, procession: 1500, 'left-botanical': 420, 'right-botanical': 420, 'courtyard-floor': 1500 }
for (const [name, width] of Object.entries(sizes)) {
  const input = `asset-sources/cover/${name}.png`
  await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: name === 'paper' ? 72 : 82, alphaQuality: 100 }).toFile(`public/art/cover/${name}.webp`)
  if (['toran', 'temple-landscape', 'procession'].includes(name)) await sharp(input).resize(950).webp({ quality: 79, alphaQuality: 100 }).toFile(`public/art/cover/${name}-mobile.webp`)
  const metadata = await sharp(input).metadata()
  if (!['paper', 'courtyard-floor'].includes(name) && !metadata.hasAlpha) throw new Error(`${name} must have an alpha channel`)
  console.log(`${name}: ${metadata.width} × ${metadata.height}, alpha: ${!!metadata.hasAlpha}`)
}

// The reference cover uses a coordinated scene in landscape and portrait,
// with a separate transparent blessing emblem and live HTML typography.
for (const [name, width] of [['reference-scene', 1586], ['reference-scene-mobile', 848], ['vinayaka-reference', 300], ['wedding-knot', 1672]]) {
  const input = `asset-sources/cover/${name}.png`
  const metadata = await sharp(input).metadata()
  if (['vinayaka-reference', 'wedding-knot'].includes(name) && !metadata.hasAlpha) throw new Error(`${name} must retain transparency`)
  await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: name === 'wedding-knot' ? 94 : 88, alphaQuality: 100 }).toFile(`public/art/cover/${name}.webp`)
  console.log(`${name}: ${metadata.width} × ${metadata.height}`)
}
