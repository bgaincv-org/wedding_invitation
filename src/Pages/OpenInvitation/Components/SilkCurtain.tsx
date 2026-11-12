import { useEffect, useLayoutEffect, useRef } from 'react'
import { createSilkRenderer } from '@/Pages/OpenInvitation/animation/silkRenderer'
import type { SilkRenderer } from '@/Pages/OpenInvitation/animation/silkRenderer'
import { createFrameBudget } from '@/lib/animation/breezePhysics'

const fabrics = [
  { name: 'pancha', side: -1, src: '/art/pancha-silk.webp' },
  { name: 'saree', side: 1, src: '/art/dharmavaram-silk.webp' },
] as const
const PREPARATION_LIMIT = 1.8
const OPEN_DURATION = 2.65

/** Prepare behind matching stills, then commit both textiles to one reveal clock. */
export function SilkCurtain({ ready, onReveal, onComplete }: { ready: boolean; onReveal: () => void; onComplete: () => void }) {
  const host = useRef<HTMLDivElement>(null)
  const readyRef = useRef(ready)
  useLayoutEffect(() => { readyRef.current = ready }, [ready])

  useEffect(() => {
    const element = host.current
    if (!element) return
    let disposed = false, frame = 0, elapsed = 0, last = 0
    let started = false, startedAt = 0, open = 0, warmFrames = 0, settled = false
    const panels = fabrics.map(fabric => {
      const panel = element.querySelector<HTMLElement>(`.cloth-${fabric.name}`)!
      const surface = panel.querySelector('canvas')!
      const fallback = panel.querySelector<HTMLElement>('.cloth-fallback-panel')!
      const state = { renderer: null as SilkRenderer | null, decoded: false }
      const image = new Image()
      image.src = fabric.src
      const decoded = image.decode().then(() => { state.decoded = true }, () => {})
      const budget = createFrameBudget(quality => state.renderer?.quality(quality))
      const showFallback = () => {
        fallback.style.transform = `translate3d(${fabric.side * open * 112}%, 0, 0)`
      }
      const lost = (event: Event) => {
        event.preventDefault()
        state.renderer?.destroy()
        state.renderer = null
        showFallback()
        panel.classList.remove('has-webgl')
        element.classList.remove('has-webgl')
      }
      surface.addEventListener('webglcontextlost', lost)
      return {
        state, decoded,
        prepare() {
          state.renderer = createSilkRenderer(surface, image, fabric.side)
          state.renderer?.draw(0, 0)
        },
        commit(gpu: boolean) {
          // Freeze the texture choice too: a late image cannot pop onto moving cloth.
          fallback.style.backgroundImage = state.decoded ? `url("${fabric.src}")` : 'none'
          if (gpu) panel.classList.add('has-webgl')
          else { state.renderer?.destroy(); state.renderer = null }
        },
        draw(dt: number) {
          if (state.renderer) {
            state.renderer.draw(started ? elapsed - startedAt : 0, open)
            if (started) budget(dt)
          } else if (started) showFallback()
        },
        destroy() {
          surface.removeEventListener('webglcontextlost', lost)
          state.renderer?.destroy()
          panel.classList.remove('has-webgl')
        },
      }
    })
    void Promise.all(panels.map(panel => panel.decoded)).then(() => {
      // Never compile shaders, upload textures or upgrade a fallback during the pull.
      if (disposed || started || elapsed >= PREPARATION_LIMIT) return
      if (panels.every(panel => panel.state.decoded)) panels.forEach(panel => panel.prepare())
      settled = true
    })

    const draw = (now: number) => {
      if (disposed || document.hidden) return
      const dt = last ? Math.max(0, (now - last) / 1000) : 0
      elapsed += dt
      last = now
      if (settled) warmFrames++
      if (!started && ((readyRef.current && warmFrames >= 2) || elapsed >= PREPARATION_LIMIT)) {
        started = true
        startedAt = elapsed
        const gpu = panels.every(panel => panel.state.renderer)
        panels.forEach(panel => panel.commit(gpu))
        element.classList.toggle('has-webgl', gpu)
        element.dataset.stage = 'revealing'
        onReveal()
      }
      const progress = started ? Math.min(1, (elapsed - startedAt) / OPEN_DURATION) : 0
      open = progress * progress * (3 - 2 * progress)
      panels.forEach(panel => panel.draw(dt))
      if (progress === 1) { onComplete(); return }
      frame = requestAnimationFrame(draw)
    }
    const visibility = () => {
      cancelAnimationFrame(frame)
      last = 0
      if (!document.hidden) frame = requestAnimationFrame(draw)
    }
    document.addEventListener('visibilitychange', visibility)
    visibility()
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', visibility)
      panels.forEach(panel => panel.destroy())
      element.classList.remove('has-webgl')
    }
  }, [onReveal, onComplete])

  return <div ref={host} className="silk-curtain split-curtain is-active" data-stage="holding" aria-hidden="true">
    {fabrics.map(fabric => <div key={fabric.name} className={`cloth-half cloth-${fabric.name}`}>
      <div className="cloth-fallback-panel"/><canvas/>
    </div>)}
  </div>
}
