import test from 'node:test'
import assert from 'node:assert/strict'
import { buildJourneyLayout } from '../src/Pages/Home/Components/Journey/journeyGeometry'
import { createJourneyWalk, journeyStridePose, STEP_DURATION, STEP_INTERVAL } from '../src/Pages/Home/Components/Journey/journeyWalk'

test('the path alternates anatomical feet at a consistent stride around the bends',()=>{
 for(const width of [280,350,714,1000,1200]){
  const layout=buildJourneyLayout(width,7)
  assert(layout.steps.length>25)
  for(const [i,step] of layout.steps.entries()){
   assert(Number.isFinite(step.angle)&&step.x>10&&step.x<width-10)
   assert(Math.cos(step.angle*Math.PI/180)>0,'the toes must always point down the page')
   if(i){assert.notEqual(step.foot,layout.steps[i-1].foot);const stride=step.distance-layout.steps[i-1].distance;assert(Math.abs(stride/layout.stride-Math.round(stride/layout.stride))<.00001)}
   assert(layout.nodes.every(node=>Math.hypot(step.x-node.x,step.y-node.y)>(layout.mobile?35:55)))
  }
  assert.equal(layout.steps[0].distance,0);assert.equal(layout.steps[1].distance,layout.stride)
 }
})
test('event captions fit the available route width and have room between ceremonies',()=>{
 for(const width of [250,280,350,420,500,596,620,660,699,700,786,1200]){
  const layout=buildJourneyLayout(width,7)
  for(const [i,node] of layout.nodes.entries()){
   assert(node.cardX>=0&&node.cardX+node.cardWidth<=width)
   assert.equal(node.side,i%2===0?'left':'right')
   assert(i%2===0?node.cardX+node.cardWidth/2<width/2:node.cardX+node.cardWidth/2>width/2)
   if(i)assert(node.y-layout.nodes[i-1].y>=500)
  }
  assert(layout.height>layout.nodes[6].y+100)
  if(layout.mobile)assert(Math.abs(layout.nodes[0].x-layout.nodes[1].x)>width*.5,'mobile trail must visibly wind between opposite sides')
 }
})

test('every queued print completes a full stride after a fast jump',()=>{
 for(const hz of [30,60,120,144]){
  const walk=createJourneyWalk(68),started=new Map<number,number>(),landed=new Set<number>()
  walk.seek(68,6000)
  let state=walk.advance(0)
  assert.equal(state.planted,0)
  for(let frame=0;frame<hz*7;frame++){
   for(const stride of state.strides){
    if(!started.has(stride.index))started.set(stride.index,stride.age)
    if(stride.age>.3&&stride.age<STEP_DURATION)landed.add(stride.index)
   }
   state=walk.advance(1/hz)
  }
  assert.deepEqual([...started.keys()],Array.from({length:68},(_,i)=>i))
  assert.equal(landed.size,68,'every step must have intermediate contact frames')
  assert([...started.values()].every(age=>age<.05),'a queued foot starts at lift-off, never at its final pose')
  assert.equal(state.planted,68);assert.equal(state.moving,false)
 }
})

test('slow scrolling keeps alternating strides while a fling overlaps full landings',()=>{
 const walk=createJourneyWalk(50)
 walk.seek(3)
 const starts=new Map<number,number>()
 let state=walk.advance(0)
 for(let frame=0;frame<180;frame++){
  state.strides.forEach(step=>{if(!starts.has(step.index))starts.set(step.index,frame/120)})
  assert(state.strides.length<=2)
  state=walk.advance(1/120)
 }
 for(let i=1;i<3;i++)assert(Math.abs(starts.get(i)!-starts.get(i-1)!-STEP_INTERVAL)<.02)
 assert.equal(state.planted,3)
 walk.seek(50,5000)
 let concurrent=0
 for(let frame=0;frame<600;frame++){
  state=walk.advance(1/120)
  concurrent=Math.max(concurrent,state.strides.length)
 }
 assert(concurrent>2&&concurrent<=15)
 assert.equal(state.planted,50)
})

test('scroll reversal cancels only future steps, and scrolling forward replays them',()=>{
 const walk=createJourneyWalk(40)
 walk.seek(30,3000)
 for(let i=0;i<240;i++)walk.advance(1/60)
 walk.seek(4)
 let state=walk.advance(0)
 assert.equal(state.planted,4);assert.equal(state.strides.length,0)
 walk.seek(12)
 const replayed=new Set<number>()
 for(let i=0;i<360;i++){
  state=walk.advance(1/120)
  state.strides.forEach(step=>replayed.add(step.index))
 }
 assert.deepEqual([...replayed],Array.from({length:8},(_,i)=>i+4))
 assert.equal(state.planted,12)
})

test('each stride lifts, travels and leaves a smooth heel-to-toe impression',()=>{
 const {steps,stride}=buildJourneyLayout(1200,4)
 const index=4,from=steps[index-2],to=steps[index]
 const start=journeyStridePose(steps,index,0,stride)
 const airborne=journeyStridePose(steps,index,.15,stride)
 const landing=journeyStridePose(steps,index,.38,stride)
 const end=journeyStridePose(steps,index,STEP_DURATION,stride)
 assert.equal(start.x,from.x);assert.equal(start.y,from.y)
 assert(airborne.y>from.y&&airborne.y<to.y)
 assert(airborne.scale>1&&airborne.contact===0)
 assert(landing.contact>0&&landing.contact<1)
 assert.equal(end.x,to.x);assert.equal(end.y,to.y)
 assert.equal(end.contact,1);assert.equal(end.opacity,0)
})

test('display rates retain the same ordered progression and long frames cannot skip a landing',()=>{
 const outcomes=[30,60,120,144].map(hz=>{
  const walk=createJourneyWalk(80)
  walk.seek(70,2500);walk.advance(0)
  let state=walk.advance(0)
  for(let i=0;i<hz*2;i++)state=walk.advance(1/hz)
  return state
 })
 for(const state of outcomes.slice(1)){
  assert.equal(state.planted,outcomes[0].planted)
  assert.equal(state.strides[0].index,outcomes[0].strides[0].index)
  assert(Math.abs(state.strides[0].age-outcomes[0].strides[0].age)<.01)
 }
 const walk=createJourneyWalk(20)
 walk.seek(20,5000)
 walk.advance(0)
 const state=walk.advance(3)
 assert.equal(state.planted,0)
 assert(state.strides.every(stride=>stride.age<=.05))
 assert.equal(walk.advance(NaN).planted,0)
})
