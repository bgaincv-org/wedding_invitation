import test from 'node:test'
import assert from 'node:assert/strict'
import { createBreezePhysics, createFrameBudget } from '../src/lib/animation/breezePhysics'

test('lamp and foliage trajectories agree at 30, 60 and 120 Hz', () => {
  const outcomes = [30, 60, 120].map(hz => {
    const physics = createBreezePhysics()
    let result = physics.advance(0)
    for (let frame = 0; frame < hz * 20; frame++) {
      result = physics.advance(1 / hz)
      assert.ok(Math.abs(result.left) < .04 && Math.abs(result.right) < .04)
      assert.ok(Math.abs(result.canopy) < 1.2 && Math.abs(result.banana) < 1.2)
    }
    return result
  })
  for (const result of outcomes.slice(1)) {
    assert.ok(Math.abs(result.left - outcomes[0].left) < .0001)
    assert.ok(Math.abs(result.right - outcomes[0].right) < .0001)
    assert.ok(Math.abs(result.canopy - outcomes[0].canopy) < .0001)
    assert.ok(Math.abs(result.banana - outcomes[0].banana) < .0001)
    result.leaves.forEach((angle, index) => assert.ok(Math.abs(angle - outcomes[0].leaves[index]) < .0001))
    result.flowers.forEach((angle, index) => assert.ok(Math.abs(angle - outcomes[0].flowers[index]) < .0001))
  }
})

test('light leaves deflect more than flower strands and brass, then settle without wind', () => {
  let wind = .8
  const physics = createBreezePhysics({ wind: () => wind })
  let state = physics.advance(0)
  for (let frame = 0; frame < 120 * 12; frame++) state = physics.advance(1 / 120)
  const leaf = Math.max(...state.leaves.map(Math.abs)), flower = Math.max(...state.flowers.map(Math.abs))
  assert.ok(leaf > flower && flower > Math.abs(state.left))
  assert.ok(leaf < .18 && flower < .05 && Math.abs(state.left) < .025)
  wind = 0
  for (let frame = 0; frame < 120 * 16; frame++) state = physics.advance(1 / 120)
  for (const angle of [...state.leaves, ...state.flowers, state.left, state.right]) assert.ok(Math.abs(angle) < .0001)
})

test('a passing gust gives neighboring leaves smooth, distinct motion and rejects invalid time', () => {
  const physics = createBreezePhysics()
  let previous = physics.advance(0)
  for (let frame = 0; frame < 120 * 30; frame++) {
    const state = physics.advance(1 / 120)
    state.leaves.forEach((angle, index) => {
      assert.ok(Number.isFinite(angle) && Math.abs(angle) < .24)
      assert.ok(Math.abs(angle - previous.leaves[index]) < .005)
    })
    previous = state
  }
  assert.ok(Math.max(...previous.leaves) - Math.min(...previous.leaves) > .05)
  assert.ok(previous.leaves.some(angle => angle < -.02) && previous.leaves.some(angle => angle > .02))
  for (const delta of [NaN, Infinity, -Infinity, -1]) assert.deepEqual(physics.advance(delta), previous)
  assert.ok(physics.advance(1 / 120).time > previous.time)
})

test('a pause preserves the pose and a late frame cannot create a simulation jump', () => {
  const physics = createBreezePhysics()
  for (let frame = 0; frame < 300; frame++) physics.advance(1 / 60)
  const before = physics.advance(0)
  assert.deepEqual(physics.advance(0), before)
  const resumed = physics.advance(10)
  assert.ok(resumed.time - before.time <= .051)
  assert.ok(Math.abs(resumed.left - before.left) < .003)
  assert.ok(Math.abs(resumed.canopy - before.canopy) < .06)
  assert.ok(Math.abs(resumed.banana - before.banana) < .06)
})

test('resolution adapts only after sustained slow frames and remains bounded', () => {
  const qualities: number[] = []
  const sample = createFrameBudget(quality => qualities.push(quality))
  for (let frame = 0; frame < 240; frame++) sample(1 / 120)
  sample(.04)
  assert.equal(qualities.length, 0)
  for (let frame = 0; frame < 300; frame++) sample(1 / 30)
  assert.ok(qualities.length > 0)
  assert.equal(qualities.at(-1), .65)
  assert.ok(qualities.every(value => value >= .65 && value <= 1))
})
