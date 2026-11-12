/** Art-directed silk centerlines with continuous velocity and delayed free hems. */
export const KNOT_DURATION = 4.35
export const CLOTH_POINTS = 15
export const CLOTH_SAMPLES = 145
export const MATERIAL = new Float32Array([0, .12, .25, .36, .44, .48, .52, .56, .60, .64, .68, .72, .80, .90, 1])
export type KnotPose = { time: number; ivory: Float32Array; red: Float32Array }

export function silkEase(value: number) {
  const t = Math.max(0, Math.min(1, value))
  return t * t * t * (t * (t * 6 - 15) + 10)
}

export function knotPresentation(time: number) {
  return {
    artOpacity: silkEase(time / .22) * (1 - silkEase((time - 3.45) / .78)),
    veilOpacity: silkEase(time / .20) * (1 - silkEase((time - 3.60) / .75)),
    stage: time < .65 ? 'arriving' : time < 1.15 ? 'crossing' : time < 1.85 ? 'looping' : time < 2.55 ? 'threading' : time < 3.10 ? 'tightening' : time < 3.45 ? 'settling' : 'revealing',
    covered: time >= .20,
    complete: time >= KNOT_DURATION,
  }
}

const ivory = [
  [-2.35,.94,-.06],[-1.62,.49,-.02],[-1.05,.23,0],[-.53,.09,.02],[-.29,.07,.08],
  [-.17,.25,.26],[.08,.19,.17],[.18,-.04,-.12],[-.13,-.12,-.27],[-.29,.08,-.11],
  [-.15,.20,.25],[-.14,-.18,.25],[-.24,-.43,.15],[-.38,-.71,.08],[-.51,-.98,.02],
]
const red = [
  [2.35,.94,-.06],[1.62,.49,-.02],[1.05,.23,0],[.53,.09,-.02],[.29,.06,-.08],
  [.17,-.12,-.26],[-.08,-.05,-.17],[-.18,.19,.12],[.13,.26,.27],[.29,.06,.11],
  [.15,-.12,-.25],[.14,-.23,-.19],[.25,-.46,-.10],[.41,-.73,-.03],[.55,-1.0,.02],
]
// Shared times and tangents prevent a stop at each change of choreography.
export const KNOT_KEYS = [0, .58, 1.12, 1.85, 2.55, 3.20, 4.35] as const
const frames = (side: -1 | 1) => {
  const final = side === -1 ? ivory : red
  const separate = Array.from(MATERIAL, s => [side * (3.20 - 2.82 * s), .66 * (1-s)**2 - .12*s, -.08 * Math.sin(s * Math.PI)])
  const crossed = Array.from(MATERIAL, s => [side * (2.65 - 3.16*s), .72*(1-s)**2 - .09*s, -side * .22 * silkEase((s-.30)/.55)])
  const loop = final.map((p, i) => {
    if (i < 4) return [p[0]*1.06, p[1]+.04, p[2]]
    if (i < 12) return [p[0]*1.75, p[1]*1.75+.04, p[2]*1.55]
    const t = (i-11)/3
    return side === -1 ? [.13+.37*t, .12+.39*t, -.31+.07*t] : [-.13-.35*t,-.17-.47*t,-.39+.09*t]
  })
  const threaded = final.map((p,i) => [p[0]*(i<4?1.03:1.25), p[1]*(i<4?1:1.12), p[2]*1.17])
  const gathered = final.map((p,i) => i>=5&&i<=10 ? [p[0]*.65+side*.06,p[1]*.65,p[2]*.85] : p)
  const start = separate.map((p,i) => [p[0]+side*.85, p[1]-.13*Math.sin(MATERIAL[i]*Math.PI), p[2]])
  return [start,separate,crossed,loop,threaded,gathered,gathered].map(points => new Float32Array(points.flat()))
}
const tracks = [frames(-1), frames(1)]
const tangents = tracks.map(track => track.map((point, k) => {
  const result = new Float32Array(point.length)
  if (k===0 || k>=track.length-2) return result
  const duration = KNOT_KEYS[k+1]-KNOT_KEYS[k-1]
  for (let n=0;n<point.length;n++) result[n]=(track[k+1][n]-track[k-1][n])/duration*.78
  return result
}))

/** Optional destination keeps the entire animation allocation-free after setup. */
export function clothTargets(time: number, side: -1 | 1, output: Float32Array = new Float32Array(CLOTH_POINTS*3)) {
  const cloth = side===-1?0:1
  for (let i=0;i<CLOTH_POINTS;i++) {
    const s=MATERIAL[i], tail=silkEase((s-.72)/.28)
    const t=Math.max(0,Math.min(KNOT_DURATION,time-tail*.065))
    let k=0
    while(k<KNOT_KEYS.length-2 && t>KNOT_KEYS[k+1]) k++
    const duration=KNOT_KEYS[k+1]-KNOT_KEYS[k], u=(t-KNOT_KEYS[k])/duration, u2=u*u, u3=u2*u
    for(let axis=0;axis<3;axis++) {
      const n=i*3+axis
      output[n]=(2*u3-3*u2+1)*tracks[cloth][k][n]+(u3-2*u2+u)*tangents[cloth][k][n]*duration
        +(-2*u3+3*u2)*tracks[cloth][k+1][n]+(u3-u2)*tangents[cloth][k+1][n]*duration
    }
    // A small inertial follow-through continues during the dissolve, never a hold.
    const release=Math.max(0,time-2.75)
    const sway=Math.sin(release*9.0)*Math.exp(-release*3.8)*silkEase(release/.16)
    output[i*3]+=side*tail*.065*sway
    output[i*3+2]+=tail*.045*sway
  }
  return output
}

export function clothWidth(s:number,time:number) {
  const gather=silkEase((time-.70)/2.45)
  const neck=silkEase((s-.34)/.12)*(1-silkEase((s-.72)/.09))
  return .46-neck*gather*.13+.32*silkEase((s-.74)/.26)
}

/** Timestamp sampling follows 60/120/144 Hz equally, without a fixed-step backlog. */
export function createKnotPhysics() {
  const pose:KnotPose={time:0,ivory:clothTargets(0,-1),red:clothTargets(0,1)}
  const state={time:0,pose}
  return {
    advance(delta:number) {
      if (Number.isFinite(delta) && delta>0) state.time=Math.min(KNOT_DURATION,state.time+delta)
      pose.time=state.time
      clothTargets(state.time,-1,pose.ivory)
      clothTargets(state.time,1,pose.red)
      return state
    },
  }
}
