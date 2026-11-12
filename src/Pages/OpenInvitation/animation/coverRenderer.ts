import { createImageMesh } from '@/lib/animation/imageMesh'
import type { BreezeState } from '@/lib/animation/breezePhysics'

const vertex = `
attribute vec2 a_uv;
uniform float u_leaves[32];
uniform float u_flowers[4];
uniform float u_banana_wind;
uniform float u_lamp_left;
uniform float u_lamp_right;
uniform mediump float u_portrait;
uniform vec2 u_resolution;
varying vec2 v_uv;
varying vec2 v_foliage;
float band(float value, float inner, float outer) { return 1.0 - smoothstep(inner, outer, value); }
vec2 lamp(vec2 uv, float center, float angle, float aspect, float portrait) {
  float bottom = mix(0.242, 0.153, portrait);
  float bowl = smoothstep(mix(0.10, 0.065, portrait), mix(0.145, 0.095, portrait), uv.y);
  float width = mix(0.005, mix(0.027, 0.063, portrait), bowl);
  float mask = band(abs(uv.x - center), width, width + 0.006) * band(uv.y, bottom, bottom + 0.012);
  vec2 pivot = vec2(center, 0.0);
  vec2 p = (uv - pivot) * vec2(1.0, aspect);
  float c = cos(angle), s = sin(angle);
  // One rigid rotation for chain and brass bowl around the fixed suspension point.
  vec2 rotated = vec2(c * p.x - s * p.y, s * p.x + c * p.y);
  return (rotated / vec2(1.0, aspect) + pivot - uv) * mask;
}
void main() {
  vec2 uv = a_uv;
  float aspect = u_resolution.y / u_resolution.x;
  float left = mix(0.074, 0.125, u_portrait);
  float right = 1.0 - left;
  vec2 lampOffset = lamp(uv, left, u_lamp_left, aspect, u_portrait) + lamp(uv, right, u_lamp_right, aspect, u_portrait);

  float root = 0.009;
  float edge = pow(abs(uv.x - 0.5) * 2.0, 0.7);
  float end = mix(0.10 + edge * 0.08, 0.095, u_portrait);
  float reach = clamp((uv.y - root) / (end - root), 0.0, 1.0);
  float mask = band(uv.y, end, end + 0.055);
  float bowl = smoothstep(mix(0.10, 0.065, u_portrait), mix(0.145, 0.095, u_portrait), uv.y);
  float lampWidth = mix(0.008, mix(0.029, 0.065, u_portrait), bowl);
  float support = 1.0 - max(band(abs(uv.x - left), lampWidth, lampWidth + .012), band(abs(uv.x - right), lampWidth, lampWidth + .012));
  float angle = 0.0, weight = 0.0;
  for (int i = 0; i < 32; i++) {
    float blend = max(0.0, 1.0 - abs(uv.x * 31.0 - float(i)));
    angle += u_leaves[i] * blend; weight += blend;
  }
  angle /= max(weight, 0.001);
  float chainAngle = 0.0; weight = 0.0;
  for (int i = 0; i < 4; i++) {
    float distance = (uv.x - float(i) / 3.0) / 0.34;
    float blend = exp(-distance * distance * 2.0);
    chainAngle += u_flowers[i] * blend; weight += blend;
  }
  chainAngle /= max(weight, 0.001);
  float side = min(uv.x, 1.0 - uv.x);
  float strings = max(band(abs(side - 0.022), 0.009, 0.023), max(band(abs(side - 0.15), 0.009, 0.025), band(abs(side - 0.217), 0.009, 0.025)));
  float length = max(0.0, uv.y - root);
  float bend = length * angle * (0.45 + 0.275 * reach);
  float lift = -0.5 * length * angle * angle * (0.2025 + 0.2475 * reach + 0.100833 * reach * reach);
  vec2 leaves = mix(vec2(bend, lift), vec2(length * sin(chainAngle), length * (cos(chainAngle) - 1.0)), strings);
  // Inverse sampling follows the same wind direction as the separate toran mesh.
  v_uv = uv + lampOffset - leaves * vec2(aspect, 1.0) * mask * support;

  // Banana stems stay planted. Their large leaves respond slowly to the same air.
  float corner = band(min(uv.x, 1.0 - uv.x), .09, .18);
  float top = mix(.49, .73, u_portrait);
  float height = clamp((.94 - uv.y) / (.94 - top), 0.0, 1.0);
  float leafMask = smoothstep(top - .04, top + .03, uv.y) * corner;
  float bendBanana = height * height * leafMask;
  float slowWind = u_banana_wind * .00275;
  float leafLift = slowWind * slowWind / (2.0 * (.94 - top));
  v_foliage = vec2(-slowWind, leafLift) * bendBanana;
  gl_Position = vec4(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0, 0.0, 1.0);
}`
const fragment = `
precision highp float;
uniform sampler2D u_texture;
uniform mediump float u_portrait;
uniform float u_flicker;
varying vec2 v_uv;
varying vec2 v_foliage;
void main() {
  vec2 uv = v_uv;
  vec3 color = texture2D(u_texture, clamp(uv, .001, .999)).rgb;
  if (abs(v_foliage.x) > .00001) {
    // Protect the standing brass deepam, flowers, people and floor from leaf sway.
    float green = smoothstep(.0, .06, color.g - color.r) * smoothstep(.015, .09, color.g - color.b);
    color = mix(color, texture2D(u_texture, clamp(uv + v_foliage, .001, .999)).rgb, green);
  }
  float left = mix(.074, .125, u_portrait);
  float flameY = mix(.169, .105, u_portrait);
  float dx = min(abs(uv.x - left), abs(uv.x - (1.0 - left)));
  float flame = (1.0 - smoothstep(mix(.022, .045, u_portrait), mix(.026, .052, u_portrait), dx))
    * (1.0 - smoothstep(.004, .012, abs(uv.y - flameY)));
  // Heat flickers at the wick independently of the much heavier brass lamp.
  float warm = smoothstep(.25, .65, color.r) * (1.0 - smoothstep(.55, .85, color.b));
  color += vec3(.05, .028, .003) * flame * warm * u_flicker;
  gl_FragColor = vec4(color, 1.0);
}`

export function createCoverRenderer(canvas: HTMLCanvasElement, image: HTMLImageElement) {
  // Deformation is evaluated on ~15k vertices, not on every screen pixel.
  const mesh = createImageMesh(canvas, image, vertex, fragment, 160, 96, 1_500_000)
  if (!mesh) return null
  mesh.float('u_portrait', image.naturalHeight > image.naturalWidth ? 1 : 0)
  return {
    draw(state: BreezeState) {
      for (let i = 0; i < 32; i++) mesh.float(`u_leaves[${i}]`, state.leaves[i])
      for (let i = 0; i < 4; i++) mesh.float(`u_flowers[${i}]`, state.flowers[Math.round(i * 7 / 3)])
      mesh.float('u_banana_wind', state.banana)
      mesh.float('u_lamp_left', state.left)
      mesh.float('u_lamp_right', state.right)
      mesh.float('u_flicker', .65 + .2 * Math.sin(state.time * 8.3) + .1 * Math.sin(state.time * 12.7 + 1.2))
      mesh.draw()
    },
    quality: mesh.quality,
    destroy: mesh.destroy,
  }
}
