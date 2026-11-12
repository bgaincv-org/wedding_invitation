export type JourneyPoint = {x:number;y:number}
type Sample = JourneyPoint & {distance:number;dx:number;dy:number}
export type JourneyStep = JourneyPoint & {angle:number;foot:'left'|'right';distance:number}

function cubic(a:JourneyPoint,b:JourneyPoint,c:JourneyPoint,d:JourneyPoint,t:number) {
  const s=1-t
  return {x:s*s*s*a.x+3*s*s*t*b.x+3*s*t*t*c.x+t*t*t*d.x,y:s*s*s*a.y+3*s*s*t*b.y+3*s*t*t*c.y+t*t*t*d.y,
    dx:3*s*s*(b.x-a.x)+6*s*t*(c.x-b.x)+3*t*t*(d.x-c.x),dy:3*s*s*(b.y-a.y)+6*s*t*(c.y-b.y)+3*t*t*(d.y-c.y)}
}

/** Place footprints by distance, rather than by uneven Bezier parameter intervals. */
export function buildJourneyLayout(width:number,count:number) {
  const w=Math.max(250,Number.isFinite(width)?width:1000)
  const mobile=w<700
  const first=mobile?240:290,interval=mobile?560:620
  const cardWidth=mobile?Math.min(260,w-118):Math.min(320,w*.29)
  const nodes=Array.from({length:count},(_,i)=>{
    const side=i%2===0?'left':'right'
    const gap=mobile?57:Math.min(108,w*.09)
    const edge=Math.max(8,w*.025)
    // Keep a broad winding trail even on wider phones/tablets where the capped
    // caption width previously brought both ceremony markers back to the center.
    const anchor=mobile?Math.max(w*.78,edge+cardWidth+gap):cardWidth+gap+Math.max(16,w*.025)
    const x=side==='left'?anchor:w-anchor,y=first+i*interval
    const cardX=mobile?(side==='left'?edge:w-edge-cardWidth):(side==='right'?x+gap:x-gap-cardWidth)
    return {x,y,side,cardX,cardWidth}
  })
  const height=(nodes.at(-1)?.y??first)+440
  // Stay beside each caption until its last line, then turn toward the next event.
  const stops=nodes.flatMap(node=>[{x:node.x,y:node.y-130},node,{x:node.x,y:node.y+310}])
  const waypoints=[{x:w*.5,y:34},...stops,{x:w*.5,y:height-60}]
  const samples:Sample[]=[]
  let distance=0
  for(let segment=0;segment<waypoints.length-1;segment++){
    const a=waypoints[segment],d=waypoints[segment+1],dy=d.y-a.y
    // Vertical tangents make the join between every two bends continuous.
    const b={x:a.x,y:a.y+dy*.43},c={x:d.x,y:d.y-dy*.43}
    for(let j=segment?1:0;j<=120;j++){
      const p=cubic(a,b,c,d,j/120),last=samples.at(-1)
      if(last)distance+=Math.hypot(p.x-last.x,p.y-last.y)
      samples.push({...p,distance})
    }
  }
  const atDistance=(target:number)=>{
    let low=0,high=samples.length-1
    while(low<high){const middle=(low+high)>>1;if(samples[middle].distance<target)low=middle+1;else high=middle}
    const b=samples[low],a=samples[Math.max(0,low-1)]
    const mix=(target-a.distance)/Math.max(.001,b.distance-a.distance)
    return {x:a.x+(b.x-a.x)*mix,y:a.y+(b.y-a.y)*mix,dx:a.dx+(b.dx-a.dx)*mix,dy:a.dy+(b.dy-a.dy)*mix}
  }
  const steps:JourneyStep[]=[]
  const stride=mobile?42:49,spread=mobile?8:11
  for(let i=0;i<Math.ceil(distance/stride)+1;i++){
    const target=i*stride
    if(target>distance)break
    const p=atDistance(target)
    if(nodes.some(node=>Math.hypot(p.x-node.x,p.y-node.y)<(mobile?70:108)))continue
    const side=steps.length%2===0?1:-1,length=Math.hypot(p.dx,p.dy)||1
    steps.push({x:p.x-p.dy/length*spread*side,y:p.y+p.dx/length*spread*side,
      // The symbol points down. Only turn it along the forward path tangent;
      // handedness is mirrored inside the SVG, independently of animation.
      angle:Math.atan2(-p.dx,p.dy)*180/Math.PI,foot:side===1?'right':'left',distance:target})
  }
  return {width:w,height,mobile,nodes,steps,stride,spread}
}
