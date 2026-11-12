import { useEffect, useId, useRef, useState } from 'react'
import { wedding } from '@shared/wedding'
import type { Locale } from '@shared/wedding'
import { translator, eventDateLabel, eventTimeLabel } from '@/lib/content'
import { createBreezePhysics } from '@/lib/animation/breezePhysics'
import { countdownParts } from './countdownClock'
import { Lotus, Sun } from '@/Components/Decorations/Ornaments'
import './Countdown.css'

function CounterFrame() {
  const id = useId()
  const outline = 'M110 7C96 21 76 15 65 31H49C25 31 9 49 9 73V197C9 222 27 241 56 241H66C75 257 96 252 110 266C124 252 145 257 154 241H164C193 241 211 222 211 197V73C211 49 195 31 171 31H155C144 15 124 21 110 7Z'
  return <svg className="muhurtham-counter-frame" viewBox="0 0 220 274" fill="none" aria-hidden="true"><defs><linearGradient id={`${id}-gold`} x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#f3d38f"/><stop offset=".35" stopColor="#bc761c"/><stop offset=".6" stopColor="#f5d695"/><stop offset="1" stopColor="#aa6817"/></linearGradient><linearGradient id={`${id}-paper`} x2="0" y2="1"><stop stopColor="#fff4df" stopOpacity=".66"/><stop offset="1" stopColor="#fbe9c7" stopOpacity=".7"/></linearGradient></defs><path d={outline} fill={`url(#${id}-paper)`} stroke={`url(#${id}-gold)`} strokeWidth="3"/><path d={outline} transform="translate(5 6) scale(.955 .955)" stroke="#f5d18e" strokeWidth="1"/></svg>
}

function Arch() {
  const path = 'M24 465C39 344 126 251 274 266C314 180 434 130 548 175C571 55 719 94 920 71C1003 62 1062 44 1086 13C1110 44 1169 62 1252 71C1453 94 1601 55 1624 175C1738 130 1858 180 1898 266C2046 251 2133 344 2148 465'
  return <svg className="muhurtham-arch" viewBox="0 0 2172 724" preserveAspectRatio="none" fill="none" aria-hidden="true"><path d={path} stroke="#b77627" strokeWidth="8"/><path d={path} stroke="#ffe3a2" strokeWidth="4"/><path d={path} transform="translate(0 -9)" stroke="#ce923e" strokeWidth="1.6"/></svg>
}

function useCountdownBreeze(active: boolean, paused: boolean) {
  const root = useRef<HTMLElement>(null)
  const physics = useRef<ReturnType<typeof createBreezePhysics> | null>(null)
  useEffect(() => {
    const element = root.current
    if (!element || !active) return
    physics.current ??= createBreezePhysics()
    const model = physics.current
    const strands = [...element.querySelectorAll<HTMLElement>('.muhurtham-strand')]
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    let inView = false, frame = 0, last = 0
    const tick = (now: number) => {
      const state = model.advance(last ? (now - last) / 1000 : 0)
      last = now
      strands.forEach((strand, i) => { strand.style.transform = `rotate(${-state.flowers[i % 8]}rad)` })
      frame = requestAnimationFrame(tick)
    }
    const resume = () => {
      cancelAnimationFrame(frame); last = 0
      if (media.matches) strands.forEach(strand => strand.style.removeProperty('transform'))
      if (inView && !paused && !media.matches && !document.hidden) frame = requestAnimationFrame(tick)
    }
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; resume() })
    observer.observe(element)
    media.addEventListener('change', resume)
    document.addEventListener('visibilitychange', resume)
    return () => { cancelAnimationFrame(frame); observer.disconnect(); media.removeEventListener('change', resume); document.removeEventListener('visibilitychange', resume) }
  }, [active, paused])
  return root
}

export function Countdown({ locale, active, paused }: { locale: Locale; active: boolean; paused: boolean }) {
  const t = translator(locale)
  const target = wedding.countdownTo ? Date.parse(wedding.countdownTo) : NaN
  const [now, setNow] = useState(Date.now)
  const root = useCountdownBreeze(active, paused)
  useEffect(() => {
    if (!Number.isFinite(target)) return
    let timer = 0
    const sync = () => {
      clearTimeout(timer)
      const current = Date.now()
      setNow(current)
      if (current < target && !document.hidden) timer = window.setTimeout(sync, 1000 - current % 1000)
    }
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', sync) }
  }, [target])
  const parts = countdownParts(target, now)
  if (!parts) return null
  const units = [t('DAYS', 'రోజులు'), t('HOURS', 'గంటలు'), t('MINUTES', 'నిమిషాలు'), t('SECONDS', 'సెకన్లు')]
  const date = eventDateLabel(wedding.countdownTo!, locale)
  const time = eventTimeLabel(wedding.countdownTo!, locale)
  return <section id="muhurtham" ref={root} className="muhurtham-section" aria-labelledby="muhurtham-title" data-motion-paused={paused}>
    <div className="couple-border muhurtham-border" aria-hidden="true"><i/><i/><i/><i/></div>
    {['tl','tr','bl','br'].map(corner => <div key={corner} className={`couple-corner-seal couple-seal-${corner} muhurtham-seal`} aria-hidden="true"><Sun/></div>)}
    <Arch/>
    <div className="muhurtham-flowers" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <span className={`muhurtham-strand-wrap strand-${i}`} key={i}><img className="muhurtham-strand" src="/art/countdown/jasmine-strand.webp" alt="" width="160" height="900" loading="lazy"/></span>)}</div>
    <img className="muhurtham-sketch muhurtham-sketch-left" src="/art/couple/temple-sketch.webp" alt="" aria-hidden="true" width="700" height="1050" loading="lazy"/>
    <img className="muhurtham-sketch muhurtham-sketch-right" src="/art/couple/pavilion-sketch.webp" alt="" aria-hidden="true" width="700" height="1050" loading="lazy"/>
    <div className="muhurtham-petals" aria-hidden="true">{[14,18,24,31,36,64,69,76,82,86].map((left,i)=><i key={left} style={{left:`${left}%`,bottom:`${3+(i%3)*1.4}%`,rotate:`${i*31-45}deg`}}/>)}</div>
    <div className="muhurtham-heading" data-reveal><div className="muhurtham-heading-ornament" aria-hidden="true"><i/><Lotus/><i/></div><h2 id="muhurtham-title">{parts.arrived ? t('Our Muhurtham is here', 'మా సుముహూర్తం వచ్చింది') : t('Our Muhurtham in', 'మా సుముహూర్తానికి')}</h2></div>
    <div className="muhurtham-timer" role="timer" aria-live="off" aria-label={t('Time until our Muhurtham', 'మా సుముహూర్తానికి మిగిలిన సమయం')}>
      <dl className="muhurtham-counters">{parts.values.map((value, i) => <div className="muhurtham-counter" data-reveal key={units[i]}><CounterFrame/><dt>{units[i]}</dt><dd><span key={value} className="muhurtham-number">{String(value).padStart(2, '0')}</span></dd><Lotus className="muhurtham-card-lotus"/>{i < 3 && <i className="muhurtham-separator" aria-hidden="true"/>}</div>)}</dl>
    </div>
    <div className="muhurtham-date" data-reveal><time dateTime={wedding.countdownTo ?? undefined}>{date}<span aria-hidden="true"> · </span>{time}</time><small>{wedding.overnightNote[locale]}</small></div>
    <div className="muhurtham-still-life muhurtham-deepam" data-reveal><img src="/art/countdown/deepam-arrangement.webp" alt="" aria-hidden="true" width="600" height="750" loading="lazy"/></div>
    <div className="muhurtham-still-life muhurtham-kalash" data-reveal><img src="/art/countdown/kalash-arrangement.webp" alt="" aria-hidden="true" width="650" height="650" loading="lazy"/></div>
    <div className="muhurtham-bottom-rule" data-reveal aria-hidden="true"><i/><img src="/art/couple/floor-rangoli.webp" alt="" width="2172" height="724" loading="lazy"/><i/></div>
  </section>
}
