import test from 'node:test'
import assert from 'node:assert/strict'
import { createButterflyFlights, sampleButterflyFlight } from '../src/lib/animation/butterflyFlights'
import type { ButterflyFlight } from '../src/lib/animation/butterflyFlights'

function randomFor(seed: number) {
  return () => { seed = seed * 16807 % 2147483647; return seed / 2147483647 }
}

test('visits are staggered, diverse and bounded, with quiet gaps throughout a long session', () => {
  for (const capacity of [3, 4]) {
    const garden = createButterflyFlights(randomFor(79))
    const arrivals = new Map<number, { time: number; flight: ButterflyFlight }>()
    let emptySince = 0, longestGap = 0, previousCount = 0, sharedFrames = 0
    for (let frame = 0; frame < 60 * 180; frame++) {
      const time = frame / 60
      const flights = garden.advance(1 / 60, capacity).filter(flight => flight !== null)
      assert.ok(flights.length <= capacity)
      if (flights.length >= 2) sharedFrames++
      for (const flight of flights) if (!arrivals.has(flight.id)) arrivals.set(flight.id, { time, flight: structuredClone(flight) })
      if (!flights.length) {
        if (previousCount) emptySince = time
        if (time > 20) longestGap = Math.max(longestGap, time - emptySince)
      }
      previousCount = flights.length
    }
    const visits = [...arrivals.values()]
    assert.ok(visits.length > 10)
    assert.ok(sharedFrames > 60 * 180 * .5, 'multiple butterflies should share the scene for most of the session')
    assert.equal(new Set(visits.map(visit => visit.flight.species)).size, 4)
    assert.equal(new Set(visits.slice(0, 4).map(visit => visit.flight.species)).size, 4)
    assert.ok(longestGap >= 2.4, 'quiet gaps should remain after the initial arrival')
    for (let i = 1; i < visits.length; i++) {
      assert.ok(visits[i].time - visits[i-1].time >= 2.7)
      assert.notEqual(visits[i].flight.species, visits[i-1].flight.species)
      assert.notDeepEqual(visits[i].flight.points, visits[i-1].flight.points)
    }
  }
})

test('random routes stay smooth, finite and on screen at phone and desktop sizes', () => {
  for (const width of [284, 354, 1404]) {
    const garden = createButterflyFlights(randomFor(width))
    const previous = new Map<number, ReturnType<typeof sampleButterflyFlight>>()
    for (let i = 0; i < 60 * 120; i++) for (const flight of garden.advance(1 / 60)) {
      if (!flight) continue
      const pose = sampleButterflyFlight(flight, width, 900)
      assert.ok(pose.x >= 14 && pose.x <= width - 14)
      assert.ok(pose.y >= 14 && pose.y <= 886)
      assert.ok(Number.isFinite(pose.angle) && pose.opacity >= 0 && pose.opacity <= .85)
      const before = previous.get(flight.id)
      if (before) assert.ok(Math.hypot(pose.x - before.x, pose.y - before.y) < 14)
      previous.set(flight.id, pose)
    }
  }
})

test('paused or invalid time does not spawn or move butterflies, and resume avoids catch-up bursts', () => {
  const garden = createButterflyFlights(randomFor(91))
  for (let i = 0; i < 240; i++) garden.advance(1 / 60)
  const before = structuredClone(garden.advance(0))
  for (const delta of [0, -1, NaN, Infinity]) assert.deepEqual(garden.advance(delta), before)
  const after = garden.advance(90)
  assert.equal(after.filter(Boolean).length, before.filter(Boolean).length)
  after.forEach((flight, i) => { if (flight) assert.ok(flight.age - before[i]!.age <= .051) })
})

test('fresh sessions generate different visits instead of restarting a fixed route sequence', () => {
  const a = createButterflyFlights(randomFor(5)), b = createButterflyFlights(randomFor(19))
  for (let i = 0; i < 180; i++) { a.advance(1 / 60); b.advance(1 / 60) }
  assert.notDeepEqual(a.advance(0), b.advance(0))
})
