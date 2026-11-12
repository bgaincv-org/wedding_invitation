import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { Locale } from '@shared/wedding'
import { Lotus } from '@/Components/Decorations/Ornaments'
const ConnectedRsvp = lazy(() => import('./RsvpForm'))

export function DeferredRsvp({ locale }: { locale: Locale }) {
  const host = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(() => location.hash === '#rsvp')
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setReady(true); observer.disconnect() }
    }, { rootMargin: '900px' })
    if (host.current) observer.observe(host.current)
    return () => observer.disconnect()
  }, [])
  const placeholder = <div className="rsvp-loading" role="status"><Lotus/><span>{locale === 'en' ? 'Preparing your reply card…' : 'మీ సమాధాన పత్రం సిద్ధమవుతోంది…'}</span></div>
  return <div ref={host}>{ready ? <Suspense fallback={placeholder}><ConnectedRsvp locale={locale}/></Suspense> : placeholder}</div>
}
