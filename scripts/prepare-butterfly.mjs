import sharp from 'sharp'

// Conventional pixel masking only: preserve the photographed insect and its colors.
// Source and derivative license: public/art/couple/blue-morpho-license.txt.
const { data, info } = await sharp('asset-sources/couple/blue-morpho-original.jpg')
  .removeAlpha().raw().toBuffer({ resolveWithObject: true })
const { width, height } = info
const background = new Uint8Array(width * height)
const queue = new Int32Array(width * height)
let head = 0, tail = 0
function visit(x, y) {
  if (x < 0 || x >= width || y < 0 || y >= height) return
  const p = y * width + x
  if (background[p]) return
  const [r, g, b] = data.subarray(p * 3, p * 3 + 3)
  if (Math.min(r, g, b) < 190 || Math.max(r, g, b) - Math.min(r, g, b) > 35) return
  background[p] = 1
  queue[tail++] = p
}
for (let x = 0; x < width; x++) { visit(x, 0); visit(x, height - 1) }
for (let y = 0; y < height; y++) { visit(0, y); visit(width - 1, y) }
while (head < tail) {
  const p = queue[head++], x = p % width, y = Math.floor(p / width)
  visit(x - 1, y); visit(x + 1, y); visit(x, y - 1); visit(x, y + 1)
}

const bodyOutline = [[420,140],[550,140],[500,305],[497,330],[494,370],[481,405],[475,430],[465,405],[453,375],[456,340],[463,307]]
function inBody(x, y) {
  let inside = false
  for (let i = 0, j = bodyOutline.length - 1; i < bodyOutline.length; j = i++) {
    const [xi, yi] = bodyOutline[i], [xj, yj] = bodyOutline[j]
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
const layers = Object.fromEntries(['left', 'right', 'body', 'whole'].map(name => [name, Buffer.alloc(width * height * 4)]))
for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
  const p = y * width + x
  // Remove the museum measurement scale outside the insect, keeping all antennae.
  if (background[p] || (x > 820 && y > 690)) continue
  const part = inBody(x, y) ? 'body' : x < 477 ? 'left' : 'right'
  const edge = [p - 1, p + 1, p - width, p + width].some(n => background[n])
  const minimum = Math.min(...data.subarray(p * 3, p * 3 + 3))
  const alpha = edge ? Math.min(1, (255 - minimum) / 195) : 1
  for (const layer of [layers[part], layers.whole]) {
    for (let channel = 0; channel < 3; channel++) {
      layer[p * 4 + channel] = Math.max(0, Math.min(255, (data[p * 3 + channel] - 255 * (1 - alpha)) / Math.max(alpha, .001)))
    }
    layer[p * 4 + 3] = Math.round(alpha * 255)
  }
}
for (const [name, layer] of Object.entries(layers)) {
  await sharp(layer, { raw: { width, height, channels: 4 } })
    .extract({ left: 40, top: 44, width: 890, height: 690 })
    .resize(712, 552)
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(`public/art/couple/blue-morpho-${name}.webp`)
}
console.log('Prepared transparent photographic butterfly and three animation layers.')
