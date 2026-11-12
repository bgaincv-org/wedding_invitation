/** A small, bounded WebGL image mesh shared by the silk and the living artwork. */
export function createImageMesh(canvas: HTMLCanvasElement, image: HTMLImageElement, vertex: string, fragment: string, columns = 1, rows = 1, pixelBudget = 2_000_000, composite = false) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: composite, powerPreference: 'low-power' })
  if (!gl) return null
  const shaders: WebGLShader[] = []
  const buffers: WebGLBuffer[] = []
  let program: WebGLProgram | null = null
  let texture: WebGLTexture | null = null
  let observer: ResizeObserver | undefined
  let quality = 1
  const destroy = () => {
    observer?.disconnect()
    buffers.forEach(buffer => gl.deleteBuffer(buffer))
    shaders.forEach(shader => gl.deleteShader(shader))
    if (program) gl.deleteProgram(program)
    if (texture) gl.deleteTexture(texture)
  }
  try {
    const compile = (type: number, code: string) => {
      const shader = gl.createShader(type)
      if (!shader) throw new Error('Shader unavailable')
      shaders.push(shader)
      gl.shaderSource(shader, code)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Shader compilation failed')
      return shader
    }
    program = gl.createProgram()
    if (!program) throw new Error('Program unavailable')
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Program link failed')
    gl.useProgram(program)
    if (composite) { gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA) }
    const vertices: number[] = [], indices: number[] = []
    for (let y = 0; y <= rows; y++) for (let x = 0; x <= columns; x++) vertices.push(x / columns, y / rows)
    for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++) {
      const i = y * (columns + 1) + x
      indices.push(i, i + 1, i + columns + 1, i + 1, i + columns + 2, i + columns + 1)
    }
    const buffer = gl.createBuffer(), index = gl.createBuffer()
    if (!buffer || !index) throw new Error('Mesh unavailable')
    buffers.push(buffer, index)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    const attribute = gl.getAttribLocation(program, 'a_uv')
    gl.enableVertexAttribArray(attribute)
    gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
    texture = gl.createTexture()
    if (!texture) throw new Error('Texture unavailable')
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    if (composite) {
      // Premultiplied mipmaps keep fine jasmine/leaf edges quiet under minification.
      // Padding to a power of two enables mipmaps on WebGL 1 without stretching art.
      const atlas = document.createElement('canvas')
      atlas.width = 2 ** Math.ceil(Math.log2(image.naturalWidth))
      atlas.height = 2 ** Math.ceil(Math.log2(image.naturalHeight))
      const context = atlas.getContext('2d')
      if (!context) throw new Error('Texture canvas unavailable')
      context.drawImage(image, 0, 0)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas)
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.uniform2f(gl.getUniformLocation(program, 'u_image_uv_scale'), image.naturalWidth / atlas.width, image.naturalHeight / atlas.height)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0)
    const uniforms = new Map<string, WebGLUniformLocation | null>()
    const uniform = (name: string) => {
      if (!uniforms.has(name)) uniforms.set(name, gl.getUniformLocation(program!, name))
      return uniforms.get(name) ?? null
    }
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const ratio = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(pixelBudget / Math.max(1, width * height))) * quality
      canvas.width = Math.max(1, Math.round(width * ratio))
      canvas.height = Math.max(1, Math.round(height * ratio))
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uniform('u_resolution'), canvas.width, canvas.height)
      const aspect = width / Math.max(1, height), imageAspect = image.naturalWidth / image.naturalHeight
      gl.uniform2f(uniform('u_texture_scale'), Math.min(1, aspect / imageAspect), Math.min(1, imageAspect / aspect))
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
    }
    resize()
    observer = new ResizeObserver(resize)
    observer.observe(canvas)
    return {
      quality: (value: number) => { const next = Math.min(1, Math.max(.65, value)); if (next !== quality) { quality = next; resize() } },
      float: (name: string, value: number) => gl.uniform1f(uniform(name), value),
      vector: (name: string, x: number, y: number) => gl.uniform2f(uniform(name), x, y),
      draw: (clear = true) => {
        if (gl.isContextLost()) return
        if (clear) {
          gl.clearColor(0, 0, 0, 0)
          gl.clear(gl.COLOR_BUFFER_BIT)
        }
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
      },
      destroy,
    }
  } catch { destroy(); return null }
}
