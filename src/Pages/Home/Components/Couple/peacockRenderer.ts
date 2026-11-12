import { createImageMesh } from '@/lib/animation/imageMesh'
import type { PeacockPose } from '@/lib/animation/peacockMotion'

const vertex = `
attribute vec2 a_uv;
uniform float u_look, u_nod, u_wing;
varying vec2 v_uv;
void main() {
  v_uv = a_uv;
  vec2 point = a_uv;

  // Continuous neck bending: full motion at the head, zero at the shoulder.
  float neck = (1.0 - smoothstep(0.11, 0.29, a_uv.y)) * smoothstep(0.66, 0.76, a_uv.x);
  vec2 pivot = vec2(0.855, 0.255);
  vec2 p = vec2((a_uv.x - pivot.x) / 1.5, a_uv.y - pivot.y);
  float angle = u_look * 0.12 + u_nod * 0.035;
  vec2 turned = vec2(p.x * cos(angle) - p.y * sin(angle), p.x * sin(angle) + p.y * cos(angle));
  turned.x *= 1.0 - abs(u_look) * 0.055;
  vec2 head = vec2(turned.x * 1.5 + pivot.x + u_look * 0.018, turned.y + pivot.y);
  point += (head - a_uv) * neck;

  // Only the folded feather area moves. The lower body, legs and tail are pinned.
  vec2 wingArea = (a_uv - vec2(0.60, 0.325)) / vec2(0.27, 0.145);
  float wing = (1.0 - smoothstep(0.35, 1.0, length(wingArea)))
    * (1.0 - smoothstep(0.375, 0.435, a_uv.y));
  vec2 shoulder = vec2(0.76, 0.285);
  vec2 feather = vec2((a_uv.x - shoulder.x) / 1.5, a_uv.y - shoulder.y);
  float settle = u_wing * 0.028;
  vec2 settled = vec2(feather.x * cos(settle) - feather.y * sin(settle), feather.x * sin(settle) + feather.y * cos(settle));
  vec2 closedWing = vec2(settled.x * 1.5 + shoulder.x, settled.y + shoulder.y - u_wing * 0.003);
  point += (closedWing - a_uv) * wing;

  // Six percent transparent breathing room keeps the crest and beak unclipped.
  vec2 surface = (point + 0.06) / 1.12;
  gl_Position = vec4(surface.x * 2.0 - 1.0, 1.0 - surface.y * 2.0, 0.0, 1.0);
}`
const fragment = `
precision mediump float;
uniform sampler2D u_texture;
uniform vec2 u_image_uv_scale;
varying vec2 v_uv;
void main() { gl_FragColor = texture2D(u_texture, v_uv * u_image_uv_scale); }
`

export function createPeacockRenderer(canvas: HTMLCanvasElement, image: HTMLImageElement) {
  const mesh = createImageMesh(canvas, image, vertex, fragment, 40, 60, 180_000, true)
  if (!mesh) return null
  return {
    draw(pose: PeacockPose) {
      mesh.float('u_look', pose.look)
      mesh.float('u_nod', pose.nod)
      mesh.float('u_wing', pose.wing)
      mesh.draw()
    },
    destroy: mesh.destroy,
  }
}
