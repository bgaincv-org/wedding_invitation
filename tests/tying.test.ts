import test from 'node:test'
import assert from 'node:assert/strict'
import { createKnotPhysics, knotPresentation, clothTargets, clothWidth, KNOT_DURATION, KNOT_KEYS, CLOTH_POINTS } from '../src/Pages/OpenInvitation/animation/knotPhysics'

const tip=(CLOTH_POINTS-1)*3

test('independent silk ends cross in depth, open a loop, then pull into hanging tails',()=>{
 const a=clothTargets(.58,-1),b=clothTargets(.58,1)
 assert(a[tip]<-.3&&b[tip]>.3)
 const crossA=clothTargets(1.16,-1),crossB=clothTargets(1.16,1)
 assert(crossA[tip]>.2&&crossB[tip]<-.2)
 assert(crossA[tip+2]>crossB[tip+2]+.3)
 for(const side of [-1,1] as const){
  const loop=clothTargets(1.85,side)
  const depth=Array.from(loop).filter((_,i)=>i%3===2)
  assert(Math.max(...depth)-Math.min(...depth)>.6)
  const tied=clothTargets(3.4,side)
  assert(tied[tip]*side>.45)
  assert(tied[tip+1]<-.9)
  assert(Math.abs(tied[0])>2.3)
 }
 assert(clothWidth(1,3.4)>clothWidth(.55,3.4)*2,'the free cloth opens out below the gathered knot')
})

test('choreography is continuous with nonzero velocity through every tying stage',()=>{
 for(const side of [-1,1] as const){
  for(const boundary of KNOT_KEYS.slice(1,5)){
   const step=.0001,a=clothTargets(boundary-step,side),b=clothTargets(boundary,side),c=clothTargets(boundary+step,side)
   let speed=0
   for(let i=0;i<a.length;i++){
    const left=(b[i]-a[i])/step,right=(c[i]-b[i])/step
    assert(Math.abs(left-right)<.03,'velocity must not jump at a key pose')
    speed=Math.max(speed,Math.abs(left))
   }
   assert(speed>.1,'the gesture must not stop between poses')
  }
  let last=clothTargets(0,side)
  for(let frame=1;frame<=Math.ceil(KNOT_DURATION*120);frame++){
   const next=clothTargets(frame/120,side)
   next.forEach((value,i)=>{assert(Number.isFinite(value));assert(Math.abs(value-last[i])<.12)})
   last=next
  }
 }
})

test('120 and 144 Hz frames receive new poses, and slow frames never create a simulation backlog',()=>{
 const samples=[30,60,120,144].map(hz=>{
  const physics=createKnotPhysics()
  for(let i=0;i<hz*3;i++)physics.advance(1/hz)
  return structuredClone(physics.advance(0))
 })
 for(const sample of samples.slice(1)){
  assert(Math.abs(sample.time-samples[0].time)<1e-9)
  for(const cloth of ['ivory','red'] as const)sample.pose[cloth].forEach((v,i)=>assert(Math.abs(v-samples[0].pose[cloth][i])<1e-6))
 }
 const physics=createKnotPhysics(),state=physics.advance(0),ivory=state.pose.ivory
 physics.advance(1/144);const first=ivory[0]
 physics.advance(1/144);assert.notEqual(ivory[0],first)
 assert.equal(physics.advance(.75).pose.ivory,ivory,'typed buffers are reused')
 assert(physics.advance(0).time>.76,'a dropped frame must not slow the animation clock')
 const before=structuredClone(physics.advance(0))
 for(const delta of [-1,NaN,Infinity,0])assert.deepEqual(physics.advance(delta),before)
 assert.equal(physics.advance(30).time,KNOT_DURATION)
})

test('the knot is fully visible while tying, with one continuous final dissolve',()=>{
 assert(KNOT_DURATION<4.5)
 assert.equal(knotPresentation(0).artOpacity,0)
 assert.equal(knotPresentation(0).veilOpacity,0)
 assert.deepEqual([.3,.9,1.5,2.1,2.8,3.3,3.8].map(t=>knotPresentation(t).stage),['arriving','crossing','looping','threading','tightening','settling','revealing'])
 for(const time of [.3,.9,1.5,2.1,2.8,3.3])assert.equal(knotPresentation(time).artOpacity,1)
 let previous=knotPresentation(3.45)
 for(let t=3.46;t<KNOT_DURATION;t+=.01){const next=knotPresentation(t);assert(next.artOpacity<=previous.artOpacity+1e-10);assert(next.veilOpacity<=previous.veilOpacity+1e-10);previous=next}
 assert.equal(knotPresentation(KNOT_DURATION).artOpacity,0)
 assert(knotPresentation(KNOT_DURATION).veilOpacity<1e-10)
 assert(knotPresentation(KNOT_DURATION).complete)
})
