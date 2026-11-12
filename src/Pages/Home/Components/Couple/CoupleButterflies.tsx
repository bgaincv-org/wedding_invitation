import { useEffect, useImperativeHandle, useRef } from 'react'
import type { Ref } from 'react'
import { butterflySpecies, createButterflyFlights, maxFlyingButterflies, sampleButterflyFlight } from '@/lib/animation/butterflyFlights'
import type { ButterflySpecies } from '@/lib/animation/butterflyFlights'
import './CoupleButterflies.css'

/** Real blue morpho photograph, split into wings and a stationary body. */
export function Butterfly({ perched = false }: { perched?: boolean }) {
  return <span className={`couple-butterfly${perched ? ' couple-butterfly-perched' : ''}`} aria-hidden="true">
    {(['left', 'right', 'body'] as const).map(part => <img key={part}
      className={`butterfly-photo butterfly-${part}${part === 'body' ? '' : ' butterfly-wing'}`}
      src={`/art/couple/blue-morpho-${part}.webp`} width="712" height="552"
      alt="" draggable={false} decoding="async"/>) }
  </span>
}

const proportions: Record<ButterflySpecies, [string, string]> = {
  'blue-morpho': ['89 / 69', '49.1% 45.1%'],
  monarch: ['815 / 575', '50.3% 52.2%'],
  sulphur: ['800 / 575', '49.4% 42.1%'],
  'red-glider': ['840 / 635', '50% 46.5%'],
}
export type CoupleButterfliesHandle = { advance: (delta: number) => void }

export function CoupleButterflies({ ref, ready }: { ref: Ref<CoupleButterfliesHandle>; ready: boolean }) {
  const garden = useRef<HTMLDivElement>(null)
  const clock = useRef<ReturnType<typeof createButterflyFlights> | null>(null)
  const size = useRef({ width: 0, height: 0 })
  const imagesReady = useRef(false)
  const slots = useRef<{ element: HTMLSpanElement; images: HTMLImageElement[]; id: number }[]>([])
  useEffect(() => {
    const element = garden.current
    if (!element) return
    slots.current = Array.from(element.querySelectorAll<HTMLSpanElement>('.couple-butterfly-flight'))
      .map(slot => ({ element: slot, images: Array.from(slot.querySelectorAll<HTMLImageElement>('img')), id: 0 }))
    const resize = new ResizeObserver(([entry]) => { size.current = { width: entry.contentRect.width, height: entry.contentRect.height } })
    resize.observe(element)
    return () => resize.disconnect()
  }, [])
  useEffect(() => {
    if (!ready) return
    let disposed = false
    // Decode once before visits begin so a new species never flashes a partial image.
    const images = butterflySpecies.flatMap(species => ['left', 'right', 'body'].map(part => {
      const img = new Image()
      img.src = `/art/couple/${species}-${part}.webp`
      return img.decode()
    }))
    void Promise.all(images).then(() => { if (!disposed) imagesReady.current = true }).catch(() => { /* Keep the decorative layer hidden if an asset cannot load. */ })
    return () => { disposed = true; imagesReady.current = false }
  }, [ready])
  useImperativeHandle(ref, () => ({
    advance(delta) {
      const { width, height } = size.current
      if (!imagesReady.current || !width || !height) return
      clock.current ??= createButterflyFlights()
      const mobile = width < 600
      const flights = clock.current.advance(delta, mobile ? 3 : maxFlyingButterflies)
      slots.current.forEach((slot, index) => {
        const flight = flights[index]
        const element = slot.element
        if (!flight) { element.style.opacity = '0'; element.dataset.flying = 'false'; return }
        if (slot.id !== flight.id) {
          slot.id = flight.id
          element.dataset.flightId = String(flight.id)
          element.dataset.species = flight.species
          element.style.setProperty('--flutter-duration', `${flight.flutter}s`)
          element.style.setProperty('--flight-delay', `${-flight.phase}s`)
          element.style.setProperty('--butterfly-ratio', proportions[flight.species][0])
          element.style.setProperty('--wing-pivot', proportions[flight.species][1])
          slot.images.forEach((image, part) => { image.src = `/art/couple/${flight.species}-${['left', 'right', 'body'][part]}.webp` })
        }
        const pose = sampleButterflyFlight(flight, width, height)
        element.dataset.flying = 'true'
        element.style.width = `${flight.size * (mobile ? .72 : 1)}px`
        element.style.opacity = String(pose.opacity)
        element.style.transform = `translate3d(${pose.x}px, ${pose.y}px, 0) translate(-50%, -50%) rotate(${pose.angle}deg)`
      })
    },
  }), [])
  return <div className="couple-butterfly-garden" ref={garden} aria-hidden="true">
    {Array.from({ length: maxFlyingButterflies }, (_, index) => <span className="couple-butterfly-flight" data-flying="false" key={index}><Butterfly/></span>)}
  </div>
}
