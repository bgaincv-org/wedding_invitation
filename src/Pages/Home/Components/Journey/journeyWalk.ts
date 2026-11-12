import type { JourneyStep } from './journeyGeometry'

export const STEP_INTERVAL = .30
export const STEP_DURATION = .48
const CONTACT_AT = .29
const MAX_PACE = 9
const TEMPO_RESPONSE = .14
const clamp = (value: number) => Math.max(0, Math.min(1, value))
const ease = (value: number) => { const t = clamp(value); return t * t * t * (t * (t * 6 - 15) + 10) }
type Stride = { index: number; age: number }

/** Scroll queues destinations. Every print gets its full swing/contact, even in a fling. */
export function createJourneyWalk(count: number) {
  let target = 0, cursor = 0, nextIn = 0, requestedPace = 1
  const state = { planted: 0, strides: [] as Stride[], moving: false, pace: 1 }
  return {
    seek(visible: number, scrollSpeed = 0) {
      target = Math.max(0, Math.min(count, Math.floor(Number.isFinite(visible) ? visible : 0)))
      if (target < cursor) {
        cursor = target
        state.planted = Math.min(state.planted, target)
        const cancelled = state.strides.findIndex(stride => stride.index >= target)
        if (cancelled !== -1) state.strides.splice(cancelled)
        nextIn = 0
      }
      const speed = Number.isFinite(scrollSpeed) ? Math.abs(scrollSpeed) : 0
      // Increase the cadence, never the speed of an individual landing. A fling
      // can overlap several complete strides instead of teleporting the walker.
      requestedPace = Math.min(MAX_PACE, Math.max(1 + speed * STEP_INTERVAL / 32, Math.max(0, target - cursor - 3) * STEP_INTERVAL / .55))
    },
    advance(delta: number) {
      // Suspend after a long task rather than consuming a foot's entire life in
      // one frame. Normal 30/60/120/144 Hz frames use their actual elapsed time.
      const dt = Number.isFinite(delta) ? Math.max(0, Math.min(delta, .05)) : 0
      const decay = Math.exp(-dt / TEMPO_RESPONSE)
      const gaitTime = requestedPace * dt + (state.pace - requestedPace) * TEMPO_RESPONSE * (1 - decay)
      state.pace = requestedPace + (state.pace - requestedPace) * decay
      for (const stride of state.strides) stride.age += dt
      while (state.strides.length && state.strides[0].age >= STEP_DURATION) {
        state.planted = state.strides[0].index + 1
        state.strides.shift()
      }
      nextIn -= gaitTime
      while (cursor < target && nextIn <= 0) {
        state.strides.push({ index: cursor++, age: Math.max(0, -nextIn / state.pace) })
        nextIn += STEP_INTERVAL
      }
      if (cursor >= target) nextIn = Math.max(0, nextIn)
      state.moving = state.strides.length > 0 || cursor < target
      if (!state.moving) { state.pace = 1; requestedPace = 1; nextIn = 0 }
      return state
    },
  }
}

/** Transfer the foot from its previous placement, then gently roll heel to toe. */
export function journeyStridePose(steps: JourneyStep[], index: number, age: number, stride: number) {
  const step = steps[index], previous = steps[index - 2]
  const heading = step.angle * Math.PI / 180
  const continuous = previous && step.distance - previous.distance < stride * 2.2
  const travel = index < 2 ? stride : 5
  const from = continuous ? previous : { x: step.x + Math.sin(heading) * travel, y: step.y - Math.cos(heading) * travel, angle: step.angle }
  const swing = ease(age / CONTACT_AT), lift = Math.sin(Math.PI * swing)
  const contact = ease((age - CONTACT_AT) / (STEP_DURATION - CONTACT_AT))
  const lateral = (step.foot === 'left' ? -1 : 1) * lift * 3
  return {
    x: from.x + (step.x - from.x) * swing + Math.cos(heading) * lateral,
    y: from.y + (step.y - from.y) * swing - lift * 10,
    angle: from.angle + (step.angle - from.angle) * swing,
    scale: 1 + lift * .1,
    roll: 1 - lift * .16,
    opacity: ease(age / .06) * (1 - contact),
    contact,
  }
}
