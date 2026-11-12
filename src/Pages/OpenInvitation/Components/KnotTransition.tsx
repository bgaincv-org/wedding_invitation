import { useLayoutEffect, useRef } from 'react'
import { createKnotPhysics, knotPresentation } from '@/Pages/OpenInvitation/animation/knotPhysics'
import { prepareKnot } from '@/Pages/OpenInvitation/animation/knotPreparation'
import type { KnotPreparation } from '@/Pages/OpenInvitation/animation/knotPreparation'
import { createFrameBudget } from '@/lib/animation/breezePhysics'

/** A continuous tying gesture, already decoded and compiled before entry. */
export function KnotTransition({ prepared, onCovered, onComplete }: { prepared: KnotPreparation | null; onCovered: () => void; onComplete: () => void }) {
  const host=useRef<HTMLDivElement>(null)
  useLayoutEffect(()=>{
    const element=host.current
    if(!element)return
    const art=element.querySelector<HTMLElement>('.knot-art')!
    const veil=element.querySelector<HTMLElement>('.knot-veil')!
    const preparation=prepared??prepareKnot(),surface=preparation.canvas
    art.appendChild(surface)
    const physics=createKnotPhysics()
    let renderer=preparation.claim()
    let state=physics.advance(0),disposed=false,covered=false,complete=false,frame=0,last:number|null=null
    let artOpacity=-1,veilOpacity=-1
    const budget=createFrameBudget(value=>renderer?.quality(value))
    // Choose once: slow or missing assets must never stall entry or pop in mid-knot.
    element.classList.toggle('has-webgl',!!renderer)
    const size=()=>{const box=art.getBoundingClientRect();renderer?.resize(box.width,box.height)}
    size()
    const paint=()=>{
      const p=knotPresentation(state.time)
      if(p.artOpacity!==artOpacity){art.style.opacity=String(p.artOpacity);artOpacity=p.artOpacity}
      if(p.veilOpacity!==veilOpacity){veil.style.opacity=String(p.veilOpacity);veilOpacity=p.veilOpacity}
      if(element.dataset.stage!==p.stage)element.dataset.stage=p.stage
      renderer?.draw(state.pose)
      if(p.covered&&!covered){covered=true;onCovered()}
      if(p.complete&&!complete){complete=true;onComplete()}
    }
    const tick=(now:number)=>{
      if(disposed||complete||document.hidden)return
      const delta=last===null?0:(now-last)/1000
      last=now
      state=physics.advance(delta)
      paint();budget(delta)
      if(!complete)frame=requestAnimationFrame(tick)
    }
    const visibility=()=>{
      cancelAnimationFrame(frame);last=null
      if(!document.hidden&&!complete)frame=requestAnimationFrame(tick)
    }
    const lost=(event:Event)=>{
      event.preventDefault();renderer=null
      element.classList.remove('has-webgl')
    }
    const resize=new ResizeObserver(size)
    resize.observe(art)
    surface.addEventListener('webglcontextlost',lost)
    document.addEventListener('visibilitychange',visibility)
    paint();visibility()
    return ()=>{
      disposed=true;cancelAnimationFrame(frame);resize.disconnect()
      surface.removeEventListener('webglcontextlost',lost)
      document.removeEventListener('visibilitychange',visibility)
      surface.remove()
      if(!prepared)preparation.destroy()
    }
  },[prepared,onCovered,onComplete])
  return <div ref={host} className="silk-curtain knot-curtain" data-stage="arriving" data-cloths="2" aria-hidden="true">
    <div className="knot-veil" />
    <div className="knot-art"><img src="/art/cover/wedding-knot.webp" alt="" width="1672" height="941" fetchPriority="high" onError={event=>{event.currentTarget.hidden=true}} /></div>
  </div>
}
