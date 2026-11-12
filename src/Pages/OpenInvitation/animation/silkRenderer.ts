import { createImageMesh } from '@/lib/animation/imageMesh'

export type SilkRenderer = { draw: (time: number, open: number) => void; destroy: () => void; quality: (value: number) => void }

const vertex = `
attribute vec2 a_uv;
uniform float u_time;
uniform float u_open;
uniform mediump float u_side;
varying vec2 v_uv;
varying float v_light;
varying float v_sheen;
void main() {
  vec2 uv = a_uv;
  // At rest the mesh exactly matches the first-paint CSS image. Folds grow with
  // the pull, so handing both stills to WebGL cannot change their crop or light.
  float fold = smoothstep(0.0, 0.16, u_open);
  float fall = 0.20 + 0.80 * uv.y;
  float gathering = 1.0 + u_open * 0.55;
  float phase = uv.x * 34.0 * gathering + sin(uv.y * 3.8 - u_time * 0.9 + u_side * 0.4) * 1.5;
  float broad = uv.x * 10.0 + uv.y * 2.5 - u_time * 0.7 + u_side * 0.3;
  float ripple = (sin(phase) * 0.019 * fall + sin(broad) * 0.028 * fall) * fold;
  float slope = cos(phase) * 0.65 * fall + cos(broad) * 0.28;
  float pull = u_open * (1.0 - u_open);
  float trailingEdge = sin(uv.y * 3.5 - u_time * 0.75) * 0.24 * pull;
  // The inner edges pull away from the center together, gathering outward.
  float width = 2.0 * (1.0 - 0.28 * u_open);
  float x = u_side < 0.0
    ? 1.0 - u_open * 2.24 - (1.0 - uv.x) * width
    : -1.0 + u_open * 2.24 + uv.x * width;
  float innerEdge = u_side < 0.0 ? uv.x : 1.0 - uv.x;
  x += u_side * (ripple + trailingEdge * pow(innerEdge, 2.0));
  float y = 1.0 - uv.y * 2.0 + sin(3.141593 * uv.y) * sin(broad) * 0.018 * fall * fold;
  gl_Position = vec4(x, y, 0.0, 1.0);
  v_uv = vec2(uv.x + ripple * 0.12, uv.y + sin(broad) * 0.003 * fold);
  vec3 normal = normalize(vec3(-slope * u_side, sin(broad) * 0.12, 1.0));
  vec3 light = normalize(vec3(-0.45, 0.35, 1.0));
  v_light = mix(1.0, 0.63 + 0.40 * max(0.0, dot(normal, light)), fold);
  v_sheen = pow(max(0.0, dot(normal, normalize(vec3(-0.2, 0.1, 1.0)))), 18.0) * fold;
}`

const fragment = `
precision mediump float;
uniform sampler2D u_texture;
uniform vec2 u_texture_scale;
uniform mediump float u_side;
varying vec2 v_uv;
varying float v_light;
varying float v_sheen;
void main() {
  // Crop toward the inner zari border; preserve the weave and motif proportions
  // instead of stretching an entire textile into a narrow phone panel.
  vec2 offset = vec2(u_side < 0.0 ? 1.0 - u_texture_scale.x : 0.0, (1.0 - u_texture_scale.y) * 0.5);
  vec2 uv = v_uv * u_texture_scale + offset;
  vec3 fabric = texture2D(u_texture, clamp(uv, 0.001, 0.999)).rgb;
  vec3 sheen = vec3(0.075, 0.039, 0.018) * v_sheen;
  gl_FragColor = vec4(fabric * v_light + sheen, 1.0);
}`

export function createSilkRenderer(canvas: HTMLCanvasElement, image: HTMLImageElement, side: -1 | 1): SilkRenderer | null {
  const mesh = createImageMesh(canvas, image, vertex, fragment, 72, 56, 1_000_000)
  if (!mesh) return null
  mesh.float('u_side', side)
  return {
    draw(time, open) { mesh.float('u_time', time); mesh.float('u_open', open); mesh.draw() },
    destroy: mesh.destroy,
    quality: mesh.quality,
  }
}
