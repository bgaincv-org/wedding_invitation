import { createKnotRenderer } from './knotRenderer'
import { createKnotPhysics } from './knotPhysics'

/** Decode and compile while the invitation cover is being read, before the click. */
export function prepareKnot() {
  const canvas=document.createElement('canvas')
  const fallback=new Image(),ivory=new Image(),red=new Image()
  fallback.src='/art/cover/wedding-knot.webp'
  ivory.src='/art/pancha-silk.webp'
  red.src='/art/dharmavaram-silk.webp'
  let renderer:ReturnType<typeof createKnotRenderer>=null,disposed=false,claimed=false
  const lost=(event:Event)=>{event.preventDefault();renderer?.destroy();renderer=null}
  canvas.addEventListener('webglcontextlost',lost)
  const ready=Promise.allSettled([fallback.decode(),ivory.decode(),red.decode()]).then(assets=>{
    if(disposed||claimed)return
    if(assets[1].status==='fulfilled'&&assets[2].status==='fulfilled'){
      renderer=createKnotRenderer(canvas,ivory,red)
      // Warm both the shadow pass and silk pass, not just the image cache.
      renderer?.draw(createKnotPhysics().advance(1.85).pose)
    }
  })
  return {
    canvas,ready,
    claim(){claimed=true;return renderer},
    destroy(){if(disposed)return;disposed=true;canvas.removeEventListener('webglcontextlost',lost);renderer?.destroy();renderer=null},
  }
}

export type KnotPreparation=ReturnType<typeof prepareKnot>
