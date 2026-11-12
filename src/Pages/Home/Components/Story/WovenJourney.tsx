import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown } from 'lucide-react'
import type { Locale } from '@shared/wedding'
import { Muggu, Lotus } from '@/Components/Decorations/Ornaments'
import { translator } from '@/lib/content'
gsap.registerPlugin(useGSAP, ScrollTrigger)

export function WovenJourney({ locale }: { locale: Locale }) {
  const scope = useRef<HTMLElement>(null)
  const t = translator(locale)
  useGSAP(() => {
    const media = gsap.matchMedia()
    media.add('(min-width: 761px) and (prefers-reduced-motion: no-preference)', () => {
      const paths = scope.current?.querySelectorAll<SVGPathElement>('.woven-thread path') ?? []
      paths.forEach(path => { const length = path.getTotalLength(); gsap.set(path, { strokeDasharray: length, strokeDashoffset: length }) })
      const timeline = gsap.timeline({ scrollTrigger: { trigger: scope.current, start: 'top top', end: 'bottom bottom', scrub: .8 } })
      timeline.to(paths, { strokeDashoffset: 0, duration: 1.8, ease: 'none' }, 0)
        .fromTo('.woven-frame-left', { xPercent: -16, rotate: -13 }, { xPercent: 10, rotate: -4, duration: 2, ease: 'none' }, 0)
        .fromTo('.woven-frame-right', { xPercent: 16, rotate: 13 }, { xPercent: -10, rotate: 4, duration: 2, ease: 'none' }, 0)
        .to('.woven-chapter-first', { opacity: 0, y: -22, duration: .5 }, .65)
        .fromTo('.woven-chapter-second', { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: .5 }, 1.1)
        .fromTo('.woven-joined', { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: .6, ease: 'power2.out' }, 1.3)
      return () => timeline.kill()
    })
    return () => media.revert()
  }, { scope, dependencies: [locale], revertOnUpdate: true })
  return <section ref={scope} className="woven-journey" aria-labelledby="woven-title"><div className="woven-sticky"><div className="woven-wash"/><Muggu className="woven-muggu"/><span className="woven-label">{t('EVERY THREAD FINDS ITS WAY', 'ప్రతి దారానికీ ఒక గమ్యం')}</span><svg className="woven-thread" viewBox="0 0 1400 720" preserveAspectRatio="none" aria-hidden="true"><path d="M-20 480C190 480 140 70 360 90S430 620 700 360 990 65 1120 310 1300 570 1420 480"/><path d="M1420 480C1210 480 1260 70 1040 90S970 620 700 360 410 65 280 310 100 570-20 480"/></svg><figure className="woven-frame woven-frame-left"><img src="/art/silk-and-letters.webp" alt="" width="300" height="420" loading="lazy"/><figcaption>{t('THE LOVE WE COME FROM', 'మనకు లభించిన ప్రేమ')}</figcaption></figure><div className="woven-words"><div className="woven-chapter-first"><Lotus/><h2 id="woven-title">{t('Two beginnings.', 'రెండు ఆరంభాలు.')}<br/><em>{t('One beautiful thread.', 'ఒక అందమైన బంధం.')}</em></h2><p>{t('Different stories, gently woven together.', 'వేర్వేరు కథలు, మృదువుగా అల్లుకున్న బంధం.')}</p></div><div className="woven-chapter-second" aria-hidden="true"><Lotus/><p className="woven-final-line">{t('From this moment,', 'ఈ క్షణం నుండి,')}<br/><em>{t('every tomorrow.', 'ప్రతి రేపూ కలిసి.')}</em></p><p>{t('A bond held by love. A life shared with you.', 'ప్రేమతో ముడిపడిన బంధం. మీతో పంచుకునే జీవితం.')}</p></div><span className="woven-joined" aria-hidden="true">S <i>&</i> H</span></div><figure className="woven-frame woven-frame-right"><img src="/art/jasmine-evening.webp" alt="" width="300" height="420" loading="lazy"/><figcaption>{t('THE LIFE WE STEP INTO', 'అడుగుపెట్టే కొత్త జీవితం')}</figcaption></figure><a className="woven-scroll" href="#celebrations"><ArrowDown size={16}/><span>{t('ON TO THE CELEBRATIONS', 'వేడుకల వైపు')}</span></a></div></section>
}
