import test from 'node:test'
import assert from 'node:assert/strict'
import { countdownParts } from '../src/Pages/Home/Components/Countdown/countdownClock'
import { wedding } from '../shared/wedding'

test('the confirmed Muhurtham is 20 December 2026 at 3:40 AM IST', () => {
  const target = Date.parse(wedding.countdownTo!)
  assert.equal(new Date(target).toISOString(), '2026-12-19T22:10:00.000Z')
  assert.deepEqual(countdownParts(target, target - 93784000)?.values, [1, 2, 3, 4])
})
test('the clock rolls over without going negative or arriving early', () => {
  const target = Date.parse(wedding.countdownTo!)
  assert.deepEqual(countdownParts(target, target - 86400001)?.values, [1, 0, 0, 1])
  assert.deepEqual(countdownParts(target, target - 1), {arrived:false, values:[0,0,0,1]})
  assert.deepEqual(countdownParts(target, target), {arrived:true, values:[0,0,0,0]})
  assert.deepEqual(countdownParts(target, target + 86400000), {arrived:true, values:[0,0,0,0]})
})
test('missing or invalid times do not display a broken countdown', () => {
  assert.equal(countdownParts(NaN, Date.now()), null)
  assert.equal(countdownParts(Date.now(), Infinity), null)
})
