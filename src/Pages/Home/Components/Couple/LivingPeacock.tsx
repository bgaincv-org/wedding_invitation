import { useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Ref } from 'react'
import { createPeacockMotion, restingPeacock } from '@/lib/animation/peacockMotion'
import { createPeacockRenderer } from './peacockRenderer'

export type LivingPeacockHandle = { advance: (delta: number) => void }

export function LivingPeacock({ ready, ref }: { ready: boolean; ref: Ref<LivingPeacockHandle> }) {
  const image = useRef<HTMLImageElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const renderer = useRef<ReturnType<typeof createPeacockRenderer>>(null)
  const motion = useRef<ReturnType<typeof createPeacockMotion> | null>(null)
  const pose = useRef(restingPeacock)
  const [live, setLive] = useState(false)

  useImperativeHandle(ref, () => ({ advance(delta) {
    if (!renderer.current) return
    motion.current ??= createPeacockMotion()
    pose.current = motion.current.advance(delta)
    renderer.current.draw(pose.current)
  } }), [])

  useEffect(() => {
    const surface = canvas.current, artwork = image.current
    if (!ready || !surface || !artwork) return
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    let disposed = false, generation = 0
    const load = async () => {
      const request = ++generation
      if (media.matches) {
        renderer.current?.destroy(); renderer.current = null; setLive(false)
        return
      }
      try { await artwork.decode() } catch { return }
      if (disposed || request !== generation) return
      renderer.current?.destroy()
      renderer.current = createPeacockRenderer(surface, artwork)
      renderer.current?.draw(pose.current)
      setLive(!!renderer.current)
    }
    const lost = (event: Event) => {
      event.preventDefault()
      generation++
      renderer.current?.destroy(); renderer.current = null; setLive(false)
    }
    // Resizing while paused redraws the current pose without advancing its clock.
    const resize = new ResizeObserver(() => renderer.current?.draw(pose.current))
    resize.observe(surface)
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

  return <span className="couple-crest couple-peacock" data-peacock-live={live} aria-hidden="true">
    <span className="peacock-art">
      <img ref={image} src={ready ? '/art/couple/peacock.webp' : undefined} alt="" width="480" height="720"/>
      <canvas className="peacock-canvas" ref={canvas}/>
    </span>
  </span>
}
