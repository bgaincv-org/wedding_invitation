import sharp from 'sharp'

// Real photographs, conventionally masked; provenance is in butterfly-credits.txt.
const specimens = [
  { name: 'monarch', crop: [65,55,815,575], body: [[370,180],[585,180],[499,300],[505,390],[500,480],[501,565],[450,568],[452,480],[444,400],[437,340],[454,300]] },
  { name: 'sulphur', crop: [75,128,800,575], body: [[395,160],[595,160],[495,305],[504,375],[490,450],[488,540],[480,610],[455,610],[449,530],[446,445],[433,390],[441,315]] },
  { name: 'red-glider', crop: [70,100,840,635], body: [[320,100],[640,100],[520,300],[525,440],[515,520],[505,610],[484,615],[474,540],[454,445],[450,340],[465,300]] },
]
function inPolygon(x, y, polygon) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i], [xj, yj] = polygon[j]
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
for (const specimen of specimens) {
  const { data, info: { width, height } } = await sharp(`asset-sources/couple/${specimen.name}-original.jpg`)
    .removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const background = new Uint8Array(width * height), queue = new Int32Array(width * height)
  let head = 0, tail = 0
  function visit(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return
    const p = y * width + x
    if (background[p]) return
    const [r,g,b] = data.subarray(p * 3, p * 3 + 3)
    if (Math.min(r,g,b) < 190 || Math.max(r,g,b) - Math.min(r,g,b) > 35) return
    background[p] = 1
    queue[tail++] = p
  }
  for (let x = 0; x < width; x++) { visit(x,0); visit(x,height-1) }
  for (let y = 0; y < height; y++) { visit(0,y); visit(width-1,y) }
  while (head < tail) {
    const p = queue[head++], x = p % width, y = Math.floor(p / width)
    visit(x-1,y); visit(x+1,y); visit(x,y-1); visit(x,y+1)
  }
  const layers = Object.fromEntries(['left','right','body'].map(name => [name,Buffer.alloc(width * height * 4)]))
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const p = y * width + x
    if (background[p] || (specimen.name === 'red-glider' && x > 740 && y > 700)) continue
    const part = inPolygon(x,y,specimen.body) ? 'body' : x < width / 2 ? 'left' : 'right'
    const layer = layers[part]
    const edge = [p-1,p+1,p-width,p+width].some(n => background[n])
    const minimum = Math.min(...data.subarray(p*3,p*3+3))
    const alpha = edge ? Math.min(1,(255-minimum)/195) : 1
    for (let channel = 0; channel < 3; channel++) layer[p*4+channel] = Math.max(0,Math.min(255,(data[p*3+channel]-255*(1-alpha))/Math.max(alpha,.001)))
    layer[p*4+3] = Math.round(alpha*255)
  }
  const [left,top,cropWidth,cropHeight] = specimen.crop
  for (const [part, pixels] of Object.entries(layers)) await sharp(pixels,{raw:{width,height,channels:4}})
    .extract({left,top,width:cropWidth,height:cropHeight}).resize(240)
    .webp({quality:88,alphaQuality:100}).toFile(`public/art/couple/${specimen.name}-${part}.webp`)
  console.log(`Prepared ${specimen.name} photographic layers.`)
}
