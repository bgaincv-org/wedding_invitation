import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Ref } from 'react'
import type { CSSProperties } from 'react'
import { createBreezePhysics } from '@/lib/animation/breezePhysics'
import type { BreezeState } from '@/lib/animation/breezePhysics'
import { createToranRenderer } from './toranRenderer'

export type LivingToranHandle = { draw: (state: BreezeState) => void }

export function LivingToran({ ready, enabled, ref }: { ready: boolean; enabled: boolean; ref: Ref<LivingToranHandle> }) {
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const renderer = useRef<ReturnType<typeof createToranRenderer>>(null)
  const pose = useRef<BreezeState>(createBreezePhysics().advance(0))
  const [live, setLive] = useState(false)
  const flowers = useRef<HTMLImageElement[]>([])
  const fallbackLeaves = useRef<{image:HTMLImageElement;index:number}[]>([])
  useImperativeHandle(ref, () => ({ draw(state) {
    pose.current = state; renderer.current?.draw(state)
    if (!renderer.current) fallbackLeaves.current.forEach(({image,index}) => {
      const direction = index % 2 ? -1 : 1
      image.style.transform = `rotate(${-state.leaves[index]*.78*direction}rad) skewX(${state.leaves[index]*.38*direction}rad)`
    })
    flowers.current.forEach((flower, i) => { flower.style.transform = `rotate(${-state.flowers[i]}rad)` })
  } }), [])

  useEffect(() => {
    const element = root.current, surface = canvas.current
    if (!ready || !element || !surface) return
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const image = element.querySelector<HTMLImageElement>('img')!
    const pieces = [...element.querySelectorAll<HTMLElement>('.toran-leaf')]
    fallbackLeaves.current = pieces.map(leaf => ({image:leaf.querySelector<HTMLImageElement>('img')!,index:Number(leaf.dataset.leaf)}))
    flowers.current = [...element.querySelectorAll<HTMLImageElement>('.toran-flower img')]
    let disposed = false, generation = 0
    const load = async () => {
      const request = ++generation
      if (media.matches) { renderer.current?.destroy(); renderer.current = null; flowers.current.forEach(flower => flower.style.removeProperty('transform')); fallbackLeaves.current.forEach(({image}) => image.style.removeProperty('transform')); setLive(false); return }
      try { await image.decode() } catch { return }
      if (disposed || request !== generation) return
      renderer.current?.destroy()
      renderer.current = createToranRenderer(surface, image, pieces)
      renderer.current?.draw(pose.current)
      setLive(!!renderer.current)
    }
    const resize = new ResizeObserver(() => { renderer.current?.measure(); renderer.current?.draw(pose.current) })
    resize.observe(element)
    pieces.forEach(piece => resize.observe(piece))
    const lost = (event: Event) => {
      event.preventDefault()
      generation++
      renderer.current?.destroy(); renderer.current = null
      setLive(false)
    }
    surface.addEventListener('webglcontextlost', lost)
    surface.addEventListener('webglcontextrestored', load)
    media.addEventListener('change', load)
    void load()
    return () => {
      disposed = true
      resize.disconnect()
      surface.removeEventListener('webglcontextlost', lost)
      surface.removeEventListener('webglcontextrestored', load)
      media.removeEventListener('change', load)
      renderer.current?.destroy(); renderer.current = null
    }
  }, [ready])

  return <div className="couple-garland" ref={root} data-breeze-live={live && enabled} aria-hidden="true">
    {['left', 'right'].map(side => <div key={side} className={`couple-garland-wing couple-garland-${side}`}>
      {[0, 1].map(piece => <span className="toran-piece" key={piece}>
        <svg className="toran-cord" viewBox="0 0 1000 30" preserveAspectRatio="none"><path d="M0 15H1000" stroke="#a47b32" strokeWidth="5"/><path d="M0 12H1000" stroke="#e2bc68" strokeWidth="2"/></svg>
        {Array.from({length:8},(_,i) => {
          const index = (side === 'left' ? 0 : 16) + piece * 8 + i
          const rest = .17 * Math.sin(index * 2.4) + .06 * Math.cos(index * 1.3)
          return <span className="toran-leaf" key={i} data-leaf={index} data-rest={rest} data-flip={i%2} style={{left:`${5+i*12.7}%`,height:`${78+12*Math.sin(index*1.7)}%`,'--leaf-rest':`${-rest}rad`,'--leaf-flip':i%2 ? -1 : 1} as CSSProperties}><img src={ready ? '/art/couple/mango-leaf.webp' : undefined} alt="" width="156" height="560"/></span>
        })}
        {[25,96].map((left,i)=><span className="toran-flower" key={left} style={{left:`${left}%`,height:`${i ? 101 : 92}%`}}><img src={ready ? '/art/countdown/jasmine-strand.webp' : undefined} alt="" width="160" height="1209"/></span>)}
      </span>)}
    </div>)}
    <canvas className="toran-canvas" ref={canvas}/>
  </div>
}
