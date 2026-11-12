export const butterflySpecies = ['blue-morpho', 'monarch', 'sulphur', 'red-glider'] as const
export const maxFlyingButterflies = 4
export type ButterflySpecies = typeof butterflySpecies[number]
type Point = { x: number; y: number }
export type ButterflyFlight = {
  id: number
  species: ButterflySpecies
  age: number
  duration: number
  size: number
  flutter: number
  phase: number
  sway: number
  points: [Point, Point, Point, Point]
}

/** A shared clock gives overlapping visits, staggered arrivals and occasional quiet gaps. */
export function createButterflyFlights(random: () => number = Math.random) {
  const range = (min: number, max: number) => min + random() * (max - min)
  const flights: (ButterflyFlight | null)[] = Array.from({ length: maxFlyingButterflies }, () => null)
  let nextArrival = range(.5, 1.2), id = 0, visits = 0, restAfter = Math.floor(range(5, 9))
  let bag: ButterflySpecies[] = [], previous: ButterflySpecies | undefined
  function nextSpecies() {
    if (!bag.length) {
      bag = [...butterflySpecies]
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1))
        ;[bag[i], bag[j]] = [bag[j], bag[i]]
      }
      if (bag.at(-1) === previous) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]]
    }
    previous = bag.pop()!
    return previous
  }
  function edgePoint(edge: number): Point {
    if (edge < 2) return { x: edge ? .96 : .04, y: range(.17, .83) }
    return { x: range(.14, .86), y: edge === 2 ? .08 : .92 }
  }
  return {
    advance(delta: number, capacity = maxFlyingButterflies) {
      const dt = Number.isFinite(delta) ? Math.max(0, Math.min(delta, .05)) : 0
      const limit = Math.max(1, Math.min(maxFlyingButterflies, capacity))
      for (let i = 0; i < flights.length; i++) {
        const flight = flights[i]
        if (!flight) continue
        flight.age += dt
        if (flight.age >= flight.duration || i >= limit) flights[i] = null
      }
      nextArrival -= dt
      if (dt && nextArrival <= 0) {
        const slot = flights.findIndex((flight, i) => !flight && i < limit)
        if (slot !== -1) {
          const start = Math.floor(range(0, 4)), end = (start + Math.floor(range(1, 4))) % 4
          flights[slot] = {
            id: ++id, species: nextSpecies(), age: 0,
            duration: range(12, 18), size: range(16, 22), flutter: range(.45, .95),
            phase: range(0, Math.PI * 2), sway: range(2, 4),
            points: [edgePoint(start), { x: range(.12, .88), y: range(.1, .9) },
              { x: range(.12, .88), y: range(.1, .9) }, edgePoint(end)],
          }
          visits++
        }
        nextArrival = range(2.8, 5.2)
        if (visits >= restAfter) {
          nextArrival = Math.max(...flights.map(flight => flight ? flight.duration - flight.age : 0)) + range(2.5, 5)
          visits = 0
          restAfter = Math.floor(range(5, 9))
        }
      }
      return flights
    },
  }
}

export function sampleButterflyFlight(flight: ButterflyFlight, width: number, height: number) {
  const progress = Math.min(1, Math.max(0, flight.age / flight.duration))
  const position = (t: number) => {
    // Smooth changes in speed and small meanders make each pass feel less mechanical.
    const u = t + .045 * Math.sin(t * Math.PI * 2), v = 1 - u
    const [a,b,c,d] = flight.points
    const x = v*v*v*a.x + 3*v*v*u*b.x + 3*v*u*u*c.x + u*u*u*d.x
    const y = v*v*v*a.y + 3*v*v*u*b.y + 3*v*u*u*c.y + u*u*u*d.y
    const wave = t * Math.PI * 2 * flight.sway + flight.phase
    // Insets keep even the rotated wings inside narrow screens.
    return { x: 22 + x * Math.max(0, width - 44) + Math.sin(wave) * 3,
      y: 22 + y * Math.max(0, height - 44) + Math.cos(wave * .8) * 4 }
  }
  const point = position(progress)
  const before = position(Math.max(0, progress - .001)), after = position(Math.min(1, progress + .001))
  const fade = Math.min(1, flight.age / .9, (flight.duration - flight.age) / 1.2)
  return { ...point, angle: Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI + 90,
    opacity: Math.max(0, fade * fade * (3 - 2 * fade)) * .85 }
}
