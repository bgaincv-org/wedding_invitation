import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createCoverRenderer } from '@/Pages/OpenInvitation/animation/coverRenderer'
import { createBreezePhysics, createFrameBudget } from '@/lib/animation/breezePhysics'

/** Displaces only foliage and hanging lamps; the illustration stays coordinated. */
export function LivingCover({ enabled, paused, prepare, deferPreparation, onPrepared }: { enabled: boolean; paused: boolean; prepare: boolean; deferPreparation: boolean; onPrepared: () => void }) {
  const picture = useRef<HTMLImageElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const runtime = useRef<{ setMotion: (active: boolean, paused: boolean, deferred: boolean) => void } | null>(null)
  const settings = useRef({ enabled, paused, deferPreparation })
  const [live, setLive] = useState(false)
  useLayoutEffect(() => {
    settings.current = { enabled, paused, deferPreparation }
    runtime.current?.setMotion(enabled, paused, deferPreparation)
  }, [enabled, paused, deferPreparation])
  useEffect(() => {
    const image = picture.current, surface = canvas.current
    if (!prepare || !image || !surface) return
    let active = settings.current.enabled, paused = settings.current.paused, deferred = settings.current.deferPreparation
    let pending = false
    let disposed = false, frame = 0, last = 0, generation = 0
    // Keep the wind/pendulum state when responsive artwork or a GPU context reloads.
    const physics = createBreezePhysics()
    let renderer: ReturnType<typeof createCoverRenderer> = null
    let quality = 1
    const budget = createFrameBudget(value => { quality = value; renderer?.quality(value) })
    const tick = (now: number) => {
      if (disposed || !active || paused || document.hidden || !renderer) return
      const delta = last ? (now - last) / 1000 : 0
      if (delta) budget(delta)
      last = now
      renderer.draw(physics.advance(delta))
      frame = requestAnimationFrame(tick)
    }
    const resume = () => {
      cancelAnimationFrame(frame)
      last = 0
      if (active && !document.hidden && !disposed && renderer) {
        // Refresh a prepared canvas before React exposes it, including a paused
        // cover. Its non-preserved WebGL drawing buffer may have been discarded.
        renderer.draw(physics.advance(0))
        if (!paused) frame = requestAnimationFrame(tick)
      }
    }
    const load = async () => {
      const request = ++generation
      try { await image.decode() } catch { if (!disposed && request === generation) onPrepared(); return }
      if (disposed || request !== generation) return
      // A late cover texture must not compile/upload while the curtains move.
      if (deferred) { pending = true; return }
      pending = false
      renderer?.destroy()
      renderer = createCoverRenderer(surface, image)
      if (renderer) { renderer.quality(quality); renderer.draw(physics.advance(0)); setLive(true); resume() }
      else setLive(false)
      onPrepared()
    }
    runtime.current = { setMotion: (value, frozen, defer) => {
      active = value; paused = frozen; deferred = defer
      if (!deferred && pending) void load()
      resume()
    } }
    const lost = (event: Event) => {
      event.preventDefault()
      cancelAnimationFrame(frame)
      renderer?.destroy()
      renderer = null
      setLive(false)
      onPrepared()
    }
    image.addEventListener('load', load)
    surface.addEventListener('webglcontextlost', lost)
    surface.addEventListener('webglcontextrestored', load)
    document.addEventListener('visibilitychange', resume)
    void load()
    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      image.removeEventListener('load', load)
      surface.removeEventListener('webglcontextlost', lost)
      surface.removeEventListener('webglcontextrestored', load)
      document.removeEventListener('visibilitychange', resume)
      renderer?.destroy()
      runtime.current = null
    }
  }, [prepare, onPrepared])

  return <div className={`cover-art ${live && enabled ? 'is-animated' : ''}`} aria-hidden="true">
    <picture><source media="(max-aspect-ratio: 4/5)" srcSet="/art/cover/reference-scene-mobile.webp"/>
      <img ref={picture} src="/art/cover/reference-scene.webp" alt="" width="1586" height="992" fetchPriority="high"/>
    </picture>
    <canvas ref={canvas} className="cover-live-art"/>
  </div>
}
