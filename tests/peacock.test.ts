import test from 'node:test'
import assert from 'node:assert/strict'
import { createPeacockMotion } from '../src/lib/animation/peacockMotion'

function randomFor(seed: number) {
  return () => { seed = seed * 16807 % 2147483647; return seed / 2147483647 }
}

test('the peacock glances both ways at varied intervals and rests between gestures', () => {
  const motion = createPeacockMotion(randomFor(92))
  let left = false, right = false, restFrames = 0, wingOnlyFrames = 0
  const starts: number[] = []
  let previous = motion.advance(0)
  for (let frame = 0; frame < 60 * 120; frame++) {
    const pose = motion.advance(1 / 60)
    assert.ok(Math.abs(pose.look) <= 1 && pose.nod >= 0 && pose.nod <= .35)
    assert.ok(pose.wing >= 0 && pose.wing <= .95)
    assert.ok(Math.abs(pose.look - previous.look) < .03)
    assert.ok(Math.abs(pose.wing - previous.wing) < .03)
    if (Math.abs(pose.look) > .1 && Math.abs(previous.look) <= .1) starts.push(frame / 60)
    left ||= pose.look < -.5
    right ||= pose.look > .5
    if (pose.look === 0 && pose.wing === 0) restFrames++
    if (pose.look === 0 && pose.wing > .1) wingOnlyFrames++
    previous = pose
  }
  assert.ok(left && right)
  assert.ok(restFrames > 60 * 8, 'rests must be visibly long')
  assert.ok(wingOnlyFrames > 60, 'wing settling must have its own schedule')
  assert.ok(starts.length > 6)
  assert.ok(new Set(starts.slice(1).map((start, i) => Math.round((start - starts[i]) * 10))).size > 3)
})

test('pause, invalid time and resume never jump to a later gesture', () => {
  const motion = createPeacockMotion(randomFor(63))
  for (let i = 0; i < 240; i++) motion.advance(1 / 60)
  const before = { ...motion.advance(0) }
  for (const dt of [0, -1, NaN, Infinity]) assert.deepEqual(motion.advance(dt), before)
  const after = motion.advance(90)
  assert.ok(Math.abs(before.look - after.look) < .08)
  assert.ok(Math.abs(before.wing - after.wing) < .08)
})

test('motion remains consistent across refresh rates without a fixed session sequence', () => {
  const atRate = (hz: number, seed = 37) => {
    const motion = createPeacockMotion(randomFor(seed))
    for (let frame = 0; frame < hz * 4; frame++) motion.advance(1 / hz)
    return motion.advance(0)
  }
  const a = atRate(30), b = atRate(120)
  assert.ok(Math.abs(a.look - b.look) < .06)
  assert.ok(Math.abs(a.wing - b.wing) < .06)
  assert.notDeepEqual(atRate(60, 37), atRate(60, 89))
})
