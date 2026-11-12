export type PeacockPose = { look: number; nod: number; wing: number }
export const restingPeacock: PeacockPose = { look: 0, nod: 0, wing: 0 }

const ease = (value: number) => {
  const t = Math.min(1, Math.max(0, value))
  return t * t * t * (t * (t * 6 - 15) + 10)
}

/** Brief, alternating glances and independent closed-wing settling, with long rests. */
export function createPeacockMotion(random: () => number = Math.random) {
  const range = (min: number, max: number) => min + random() * (max - min)
  let headWait = range(1.4, 3.2), wingWait = range(2.4, 4.5)
  let direction = random() < .5 ? -1 : 1
  let glance: { age: number; turn: number; hold: number; back: number; amount: number } | null = null
  let settle: { age: number; duration: number; amount: number } | null = null
  let pose = { ...restingPeacock }
  return {
    advance(delta: number): PeacockPose {
      const dt = Number.isFinite(delta) ? Math.max(0, Math.min(delta, .05)) : 0
      if (!dt) return pose
      if (!glance) {
        headWait -= dt
        if (headWait <= 0) {
          glance = { age: 0, turn: range(1.15, 1.9), hold: range(.7, 1.8), back: range(1.4, 2.2), amount: direction * range(.65, 1) }
          direction *= -1
        }
      }
      let look = 0, nod = 0
      if (glance) {
        glance.age += dt
        const { age, turn, hold, back, amount } = glance
        const total = turn + hold + back
        const envelope = age < turn ? ease(age / turn) : age < turn + hold ? 1 : 1 - ease((age - turn - hold) / back)
        look = amount * envelope
        nod = .35 * Math.sin(Math.PI * Math.min(1, age / total)) ** 2
        if (age >= total) { glance = null; headWait = range(3.5, 8.5); look = 0; nod = 0 }
      }
      if (!settle) {
        wingWait -= dt
        if (wingWait <= 0) settle = { age: 0, duration: range(2.8, 4.5), amount: range(.5, .95) }
      }
      let wing = 0
      if (settle) {
        settle.age += dt
        const progress = Math.min(1, settle.age / settle.duration)
        wing = settle.amount * (progress < .5 ? ease(progress * 2) : 1 - ease(progress * 2 - 1))
        if (progress === 1) { settle = null; wingWait = range(4.5, 10) }
      }
      pose = { look, nod, wing }
      return pose
    },
  }
}
