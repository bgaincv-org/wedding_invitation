import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { wedding } from '@shared/wedding'
import type { Locale } from '@shared/wedding'
import { Sun } from '@/Components/Decorations/Ornaments'
import { SahaSignature } from '@/Components/Decorations/SahaSignature'
import { WritingName } from '@/Components/Decorations/WritingName'
import { Butterfly, CoupleButterflies } from './CoupleButterflies'
import type { CoupleButterfliesHandle } from './CoupleButterflies'
import { LivingToran } from './LivingToran'
import type { LivingToranHandle } from './LivingToran'
import { LivingPeacock } from './LivingPeacock'
import type { LivingPeacockHandle } from './LivingPeacock'
import { createBreezePhysics } from '@/lib/animation/breezePhysics'
import { safeMediaUrl, translator } from '@/lib/content'
import './CoupleHero.css'

const arch = 'M180 6C166 6 156 17 153 29C131 15 107 26 101 48C78 37 54 53 51 76C27 75 12 96 20 117C9 129 4 147 4 167V342Q4 364 26 364H334Q356 364 356 342V167C356 147 351 129 340 117C348 96 333 75 309 76C306 53 282 37 259 48C253 26 229 15 207 29C204 17 194 6 180 6Z'

function Portrait({ person, locale, ready }: { person: 'first' | 'second'; locale: Locale; ready: boolean }) {
  const id = useId().replace(/:/g, '')
  const [failed, setFailed] = useState(false)
  const portrait = wedding.families[person].portrait
  const url = safeMediaUrl(portrait?.src)
  const photo = ready && url && !failed
  const t = translator(locale)
  return <svg className="couple-portrait" viewBox="0 0 360 370" role="img" aria-label={photo ? portrait!.alt[locale] : t(`Portrait placeholder for ${wedding.couple[person].en}`, `${wedding.couple[person].te} చిత్రం కోసం స్థలం`)}>
    <defs>
      <clipPath id={`portrait-${id}`}><path d={arch}/></clipPath>
      <radialGradient id={`portrait-paper-${id}`}><stop stopColor="#fff9ed"/><stop offset="1" stopColor={person === 'first' ? '#e9dfc8' : '#efddcc'}/></radialGradient>
      <linearGradient id={`portrait-gold-${id}`} x2=".9" y2="1"><stop stopColor="#99651b"/><stop offset=".45" stopColor="#e4bd61"/><stop offset="1" stopColor="#a97621"/></linearGradient>
    </defs>
    <g clipPath={`url(#portrait-${id})`}>
      <rect width="360" height="370" fill={`url(#portrait-paper-${id})`}/>
      {photo ? <image href={url} width="360" height="370" preserveAspectRatio="xMidYMid slice" onError={() => setFailed(true)}/> : <>
        <image href={ready ? '/art/cover/paper.webp' : undefined} width="360" height="370" preserveAspectRatio="xMidYMid slice" opacity=".42"/>
        <g fill="none" stroke="#b28b46" opacity=".19"><circle cx="180" cy="185" r="94"/><circle cx="180" cy="185" r="101"/>{Array.from({length:12},(_,i)=><path key={i} d="M180 68Q154 93 180 116Q206 93 180 68Z" transform={`rotate(${i*30} 180 185)`}/>)}</g>
        <text x="180" y="215" className="portrait-initial" textAnchor="middle">{person === 'first' ? 'S' : 'H'}</text>
        <path d="M139 258h30m22 0h30m-41-4 4 4-4 4-4-4Z" stroke="#b28b46" fill="none"/>
        <text x="180" y="292" className="portrait-pending" textAnchor="middle">{t('Portrait to come', 'చిత్రం త్వరలో')}</text>
      </>}
    </g>
    <path d={arch} fill="none" stroke={`url(#portrait-gold-${id})`} strokeWidth="2.6"/>
  </svg>
}

function CenterOrnament() {
  return <svg className="couple-center-ornament" viewBox="0 0 70 320" fill="none" aria-hidden="true"><path d="M35 12v121m0 54v121M35 2l4 6-4 6-4-6Zm0 304 4 6-4 6-4-6Z" stroke="#b67d22" strokeWidth="1.2"/><g transform="translate(35 160)" stroke="#b67d22">{[0,90,180,270].map(angle=><g key={angle} transform={`rotate(${angle})`}><path d="M0-29C-17-17-13-4 0 0C13-4 17-17 0-29Z"/><path d="M0-19C-7-12-6-5 0-2C6-5 7-12 0-19Z" fill="#831730" stroke="none"/></g>)}<circle r="4" fill="#b67d22"/></g></svg>
}

export function CoupleHero({ locale, artReady, active, paused }: { locale: Locale; artReady: boolean; active: boolean; paused: boolean }) {
  const t = translator(locale)
  const root = useRef<HTMLElement>(null)
  const toran = useRef<LivingToranHandle>(null)
  const butterflies = useRef<CoupleButterfliesHandle>(null)
  const peacock = useRef<LivingPeacockHandle>(null)
  const [physics] = useState(createBreezePhysics)
  useEffect(() => {
    const element = root.current
    if (!element || !active) return
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const leftLamp = element.querySelector<HTMLImageElement>('.couple-lamp-left img')
    const rightLamp = element.querySelector<HTMLImageElement>('.couple-lamp-right img')
    let frame = 0, last = 0, inView = true
    const draw = (now: number) => {
      if (paused || media.matches || document.hidden || !inView) return
      const delta = last ? (now-last)/1000 : 0
      const state = physics.advance(delta)
      last = now
      // Update only moving cutouts, avoiding inherited-variable restyles of every
      // portrait and calligraphy path on every display frame.
      if (leftLamp) leftLamp.style.transform = `rotate(${-state.left}rad)`
      if (rightLamp) rightLamp.style.transform = `rotate(${-state.right}rad)`
      toran.current?.draw(state)
      butterflies.current?.advance(delta)
      peacock.current?.advance(delta)
      frame = requestAnimationFrame(draw)
    }
    const resume = () => {
      cancelAnimationFrame(frame)
      last = 0
      const running = !paused && !media.matches && !document.hidden && inView
      element.dataset.butterfliesRunning = String(running)
      if (running) frame = requestAnimationFrame(draw)
    }
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; resume() })
    observer.observe(element)
    document.addEventListener('visibilitychange', resume)
    media.addEventListener('change', resume)
    resume()
    return () => { element.dataset.butterfliesRunning = 'false'; cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener('visibilitychange', resume); media.removeEventListener('change', resume) }
  }, [active, paused, physics])
  const src = (name: string) => artReady ? `/art/couple/${name}.webp` : undefined
  return <section className="hero couple-hero" id="home" ref={root} aria-labelledby="hero-title" data-couple-active={active} data-motion-paused={paused}>
    <div className="couple-border" aria-hidden="true"><i/><i/><i/><i/></div>
    <CoupleButterflies ref={butterflies} ready={artReady}/>
    <LivingToran ref={toran} ready={artReady} enabled={active}/>
    <div className="couple-lamp couple-lamp-left" aria-hidden="true"><img src={src('hanging-lamp')} alt="" width="724" height="2172"/></div>
    <div className="couple-lamp couple-lamp-right" aria-hidden="true"><img src={src('hanging-lamp')} alt="" width="724" height="2172"/></div>
    <img className="couple-sketch couple-sketch-left" src={src('temple-sketch')} alt="" aria-hidden="true" width="700" height="1050"/>
    <img className="couple-sketch couple-sketch-right" src={src('pavilion-sketch')} alt="" aria-hidden="true" width="700" height="1050"/>
    <div className="hero-copy couple-composition">
      <div className="couple-heading"><h1 id="hero-title" tabIndex={-1}>{t('The Couple', 'వధూవరులు')}</h1><p>{t('Two hearts, one celebration, blessed by family and tradition.', 'రెండు మనసులు, ఒక వేడుక. కుటుంబ ఆశీస్సులు, సంప్రదాయాల సమక్షంలో.')}</p><div className="couple-heading-rule" aria-hidden="true"><span/><SahaSignature className="couple-saha"/><span/></div></div>
      <div className="couple-pair">
        {(['first','second'] as const).map((person,index)=><article key={person} className={`couple-person couple-person-${person}`} aria-labelledby={`couple-name-${person}`}>
          <div className="couple-frame-wrap"><Portrait person={person} locale={locale} ready={artReady}/>{person === 'first' ? <LivingPeacock ref={peacock} ready={artReady}/> : <><img className="couple-crest couple-lotus-crest" src={src('lotus-crest')} alt="" aria-hidden="true" width="900" height="300"/><Butterfly perched/></>}</div>
          <h2 id={`couple-name-${person}`}><WritingName>{wedding.couple[person][locale]}</WritingName></h2>
          <p className="couple-role"><i/>{index===0?t('THE GROOM', 'వరుడు'):t('THE BRIDE', 'వధువు')}<i/></p>
          <p className="couple-description">{index===0?t('Warm, grounded, and ready for forever.', 'ప్రేమతో, ఆత్మీయతతో కొత్త ప్రయాణానికి సిద్ధంగా.'):t('Graceful, joyful, and full of light.', 'ఆనందంతో, చిరునవ్వులతో కొత్త ఆరంభం.')}</p>
        </article>)}
        <CenterOrnament/>
      </div>
      <div className="couple-footer"><img className="couple-rangoli" src={src('floor-rangoli')} width="2172" height="724" alt="" aria-hidden="true"/><a href="#muhurtham" className="couple-scroll"><span>{t('Scroll to continue', 'మరింత చూడండి')}</span><ChevronDown size={24}/></a></div>
    </div>
    <img className="couple-florals couple-florals-left" src={src('lotus-corner')} alt="" aria-hidden="true" width="600" height="400"/>
    <img className="couple-florals couple-florals-right" src={src('lotus-corner')} alt="" aria-hidden="true" width="600" height="400"/>
    <div className="couple-petals" aria-hidden="true">{[14,17,22,29,32,38,62,68,71,78,83,86].map((left,i)=><i key={left} style={{left:`${left}%`,bottom:`${6+(i%3)*1.8}%`,rotate:`${i*29-40}deg`}}/>)}</div>
    <div className="couple-corner-seal couple-seal-tl" aria-hidden="true"><Sun/></div><div className="couple-corner-seal couple-seal-tr" aria-hidden="true"><Sun/></div><div className="couple-corner-seal couple-seal-bl" aria-hidden="true"><Sun/></div><div className="couple-corner-seal couple-seal-br" aria-hidden="true"><Sun/></div>
  </section>
}
