import { createImageMesh } from '@/lib/animation/imageMesh'
import type { BreezeState } from '@/lib/animation/breezePhysics'

const vertex = `
attribute vec2 a_uv;
uniform float u_left, u_top, u_width, u_height, u_aspect;
uniform float u_angle, u_rest, u_flip;
varying vec2 v_uv;
varying float v_light;
void main() {
  v_uv = vec2(mix(a_uv.x, 1.0 - a_uv.x, u_flip), a_uv.y);
  float length = max(0.0, a_uv.y - 0.015);
  // Each leaf is its own mesh: nothing between two stems can drag its neighbour.
  float bend = u_angle * length * length * 0.38;
  float lift = u_angle * u_angle * length * length * length * 0.1;
  float twist = 1.0 - abs(u_angle) * length * 0.9;
  vec2 p = vec2((a_uv.x - 0.5) / u_aspect * twist + bend, length - lift);
  float angle = u_rest + u_angle * 0.78;
  vec2 turned = vec2(p.x * cos(angle) + p.y * sin(angle), -p.x * sin(angle) + p.y * cos(angle));
  vec2 point = vec2(0.5 + turned.x * u_aspect, turned.y + 0.015);
  gl_Position = vec4((u_left + point.x * u_width) * 2.0 - 1.0, 1.0 - (u_top + point.y * u_height) * 2.0, 0.0, 1.0);
  v_light = 1.0 + u_angle * length * 0.1;
}`
const fragment = `
precision mediump float;
uniform sampler2D u_texture;
uniform vec2 u_image_uv_scale;
varying vec2 v_uv;
varying float v_light;
void main() { vec4 leaf = texture2D(u_texture, v_uv * u_image_uv_scale); gl_FragColor = vec4(leaf.rgb * v_light, leaf.a); }
`

/** One texture and canvas, but an independent root and curved blade for every leaf. */
export function createToranRenderer(canvas: HTMLCanvasElement, image: HTMLImageElement, leaves: HTMLElement[]) {
  const mesh = createImageMesh(canvas, image, vertex, fragment, 10, 24, 520_000, true)
  if (!mesh) return null
  let layout: {left:number;top:number;width:number;height:number;aspect:number;rest:number;index:number;flip:number}[] = []
  const measure = () => {
    const surface = canvas.getBoundingClientRect()
    layout = leaves.flatMap(leaf => {
      const box = leaf.getBoundingClientRect()
      if (!box.width || !box.height || !surface.width || !surface.height) return []
      return [{left:(box.left-surface.left)/surface.width,top:(box.top-surface.top)/surface.height,width:box.width/surface.width,height:box.height/surface.height,aspect:box.height/box.width,rest:Number(leaf.dataset.rest),index:Number(leaf.dataset.leaf),flip:Number(leaf.dataset.flip)}]
    })
  }
  measure()
  return {
    measure,
    draw(state: BreezeState) {
      layout.forEach((leaf, index) => {
        mesh.float('u_left',leaf.left); mesh.float('u_top',leaf.top)
        mesh.float('u_width',leaf.width); mesh.float('u_height',leaf.height)
        mesh.float('u_aspect',leaf.aspect); mesh.float('u_rest',leaf.rest)
        mesh.float('u_flip',leaf.flip); mesh.float('u_angle',state.leaves[leaf.index])
        mesh.draw(index === 0)
      })
    },
    destroy: mesh.destroy,
  }
}
