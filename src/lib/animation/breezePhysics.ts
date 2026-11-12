/** Shared breeze for gravity-driven lamps and damped, flexible foliage. */
export function windAt(time: number, position = 0) {
  const passing = time - position * 1.1
  const gust = .68 * Math.sin(passing * .62) + .22 * Math.sin(passing * 1.13 + .7) + .1 * Math.sin(passing * 1.91 + 1.9)
  // A broad breeze carries smaller eddies past individual stems. The short spatial
  // wavelengths keep adjacent leaves from tracking one identical global sine wave.
  const eddies = .34 * Math.sin(time * 1.65 - position * 48)
    + .18 * Math.sin(time * 2.8 + position * 91 + .7)
    + .12 * Math.sin(time * 4.6 - position * 137)
  return .48 * gust + eddies
}

type BreezeOptions = { wind?: (time: number, position: number) => number }

export function createBreezePhysics({ wind = windAt }: BreezeOptions = {}) {
  const lamps = [{ angle: .01, velocity: 0, length: .64 }, { angle: -.0075, velocity: 0, length: .71 }]
  // Length, stem stiffness and air damping give every leaf its own response.
  const leaves = Array.from({ length: 32 }, (_, index) => ({ angle: 0, velocity: 0, length: .15 + .025 * Math.sin(index * 1.7), stiffness: 10 + 3 * Math.cos(index * 2.1), position: index / 31 }))
  const flowers = Array.from({ length: 8 }, (_, index) => ({ angle: 0, velocity: 0, length: .34 + .045 * (index % 3), stiffness: .6, position: index / 7 }))
  // Larger banana leaves respond more slowly than the light hanging foliage.
  const foliage = [
    { displacement: 0, velocity: 0, frequency: 3.8, damping: .78 },
    { displacement: 0, velocity: 0, frequency: 2.4, damping: .86 },
  ]
  let time = 0, remainder = 0
  const step = 1 / 240
  const air = (position: number) => {
    const value = wind(time, position)
    return Number.isFinite(value) ? Math.max(-1.25, Math.min(1.25, value)) : 0
  }
  const sway = (body: typeof leaves[number], damping: number, load: number) => {
    const gravity = 9.81 / body.length
    const stiffness = gravity + body.stiffness
    const flow = air(body.position)
    const force = stiffness * load * (.7 * flow + .3 * flow * Math.abs(flow))
    const acceleration = force - gravity * Math.sin(body.angle) - body.stiffness * body.angle - 2 * damping * Math.sqrt(stiffness) * body.velocity
    body.velocity += acceleration * step
    body.angle += body.velocity * step
  }
  return {
    advance(delta: number) {
      remainder += Number.isFinite(delta) ? Math.min(Math.max(delta, 0), .05) : 0
      while (remainder >= step) {
        time += step
        lamps.forEach((lamp, index) => {
          const gravity = 9.81 / lamp.length
          const flow = air(index ? .93 : .07)
          const acceleration = -gravity * Math.sin(lamp.angle) - 1.25 * lamp.velocity + gravity * .012 * flow
          lamp.velocity += acceleration * step
          lamp.angle += lamp.velocity * step
        })
        leaves.forEach(leaf => sway(leaf, .43, .15))
        flowers.forEach(flower => sway(flower, .62, .027))
        foliage.forEach((leaf, index) => {
          const force = air(index ? .85 : .15)
          const acceleration = leaf.frequency ** 2 * (force - leaf.displacement)
            - 2 * leaf.damping * leaf.frequency * leaf.velocity
          leaf.velocity += acceleration * step
          leaf.displacement += leaf.velocity * step
        })
        remainder -= step
      }
      return { time, wind: air(.5), left: lamps[0].angle, right: lamps[1].angle, canopy: foliage[0].displacement, banana: foliage[1].displacement, leaves: leaves.map(leaf => leaf.angle), flowers: flowers.map(flower => flower.angle) }
    },
  }
}

export type BreezeState = ReturnType<ReturnType<typeof createBreezePhysics>['advance']>

/** Interpolate a continuous air field; no step changes at texture-strip edges. */
export function sampleSway(angles: readonly number[], position: number) {
  const index = Math.max(0, Math.min(1, position)) * (angles.length - 1)
  const left = Math.floor(index), fraction = index - left
  return angles[left] + (angles[Math.min(left + 1, angles.length - 1)] - angles[left]) * fraction
}

/** Lower only raster resolution after sustained slow frames; live text stays sharp. */
export function createFrameBudget(onQuality: (quality: number) => void) {
  let elapsed = 0, frames = 0, slow = 0, quality = 1
  return (delta: number) => {
    if (delta <= 0 || delta > .1) return
    elapsed += delta
    frames++
    if (delta > .023) slow++
    if (elapsed < 1 || frames < 24) return
    if (slow / frames > .22 && quality > .65) {
      quality = Math.max(.65, quality - .15)
      onQuality(quality)
    }
    elapsed = 0; frames = 0; slow = 0
  }
}
