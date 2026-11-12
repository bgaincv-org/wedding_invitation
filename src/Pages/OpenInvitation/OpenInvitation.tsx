import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowRight, Pause, Play } from 'lucide-react'
import gsap from 'gsap'
import { wedding } from '@shared/wedding'
import type { Locale } from '@shared/wedding'
import { Lotus } from '@/Components/Decorations/Ornaments'
import { SahaSignature } from '@/Components/Decorations/SahaSignature'
import { SilkCurtain } from '@/Pages/OpenInvitation/Components/SilkCurtain'
import { KnotTransition } from '@/Pages/OpenInvitation/Components/KnotTransition'
import { prepareKnot } from '@/Pages/OpenInvitation/animation/knotPreparation'
import type { KnotPreparation } from '@/Pages/OpenInvitation/animation/knotPreparation'
import { LivingCover } from '@/Pages/OpenInvitation/Components/LivingCover'
import { WritingName } from '@/Components/Decorations/WritingName'
import { finishNameWriting, NAME_REVEAL_SPEED, writeNames } from '@/lib/animation/nameWriting'
import { dateLabel, translator, WELCOME_SESSION_KEY, shouldShowWelcome, shouldPlayWelcomeIntro } from '@/lib/content'
import './OpenInvitation.css'

type Phase = 'intro' | 'cover' | 'knot' | 'entering' | 'closed'

export function OpenInvitation({ locale, onPrepare, onEnter, onRevealed }: { locale: Locale; onPrepare: () => void; onEnter: () => void; onRevealed: () => void }) {
  const t = translator(locale)
  const openingName = t('Sathvik', 'సాత్విక్')
  const dialog = useRef<HTMLDialogElement>(null)
  const copy = useRef<HTMLDivElement>(null)
  const opening = useRef(false)
  const finished = useRef(false)
  const knot = useRef<KnotPreparation | null>(null)
  const [activeKnot, setActiveKnot] = useState<KnotPreparation | null>(null)
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [phase, setPhase] = useState<Phase>(() => !shouldShowWelcome() ? 'closed' : shouldPlayWelcomeIntro() ? 'intro' : 'cover')
  const [ready, setReady] = useState(false)
  const [coverPrepared, setCoverPrepared] = useState(false)
  const [introOpening, setIntroOpening] = useState(false)
  const [paused, setPaused] = useState(false)
  const [invitationReady, setInvitationReady] = useState(reduced)
  const revealCover = useCallback(() => setPhase(current => current === 'intro' ? 'cover' : current), [])
  const beginReveal = useCallback(() => setIntroOpening(true), [])
  const coverReady = useCallback(() => setCoverPrepared(true), [])
  const hideCover = useCallback(() => setPhase(current => current === 'knot' ? 'entering' : current), [])

  useLayoutEffect(() => {
    const element = dialog.current
    if (!element) return
    if (!element.open) element.showModal()
    return () => element.close()
  }, [])

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => { setReduced(media.matches); if (media.matches) revealCover() }
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [revealCover])

  useEffect(() => {
    if (phase !== 'intro') return
    let disposed = false
    const images = [...(dialog.current?.querySelectorAll('img') ?? [])]
    void Promise.allSettled([...images.map(image => image.decode()), document.fonts.ready]).then(() => { if (!disposed) setReady(true) })
    return () => { disposed = true }
  }, [phase])

  useEffect(() => {
    if (phase === 'closed' || reduced) { knot.current?.destroy(); knot.current = null; return }
    if (phase !== 'cover') return
    knot.current ??= prepareKnot()
    // Mount inactive page art during the cover, away from the opening interaction.
    if ('requestIdleCallback' in window) {
      const idle = window.requestIdleCallback(onPrepare, { timeout: 700 })
      return () => window.cancelIdleCallback(idle)
    }
    const timer = setTimeout(onPrepare, 100)
    return () => clearTimeout(timer)
  }, [phase, reduced, onPrepare])

  useEffect(() => () => { knot.current?.destroy(); knot.current = null }, [])

  useLayoutEffect(() => {
    if (phase !== 'cover') return
    try { sessionStorage.setItem(WELCOME_SESSION_KEY, 'yes') } catch { /* Storage is optional. */ }
    const title = dialog.current?.querySelector<HTMLHeadingElement>('#welcome-title')
    title?.focus({ preventScroll: true })
    const revealTargets = '.cover-vinayaka, .cover-eyebrow, .writing-ink, #welcome-title > em, .cover-divider, .cover-month, .cover-open-button, .cover-saha'
    if (reduced) return
    const copyElement = copy.current
    const elements = copy.current!.querySelectorAll(revealTargets)
    let disposed = false, started = false
    let fallback = 0
    const context = gsap.context(() => {
      gsap.set(revealTargets, { opacity: 0 })
    }, copy)
    const start = () => {
      if (disposed || started) return
      started = true
      clearTimeout(fallback)
      context.add(() => {
        const timeline = gsap.timeline({ defaults: { ease: 'power2.out', force3D: 'auto' }, onStart: () => setInvitationReady(false), onComplete: () => setInvitationReady(true) }).timeScale(NAME_REVEAL_SPEED)
        timeline.fromTo('.cover-vinayaka', { opacity: 0, scale: .97, y: 8 }, { opacity: 1, scale: 1, y: 0, duration: 1 }, 0)
          .fromTo('.cover-eyebrow', { opacity: 0, y: 9 }, { opacity: 1, y: 0, duration: .85 }, .28)
          .fromTo('#welcome-title > em', { opacity: 0, scale: .96 }, { opacity: 1, scale: 1, duration: .65, ease: 'sine.inOut' }, .58)
          .fromTo('.cover-divider', { opacity: 0, scaleX: .8 }, { opacity: 1, scaleX: 1, duration: .7 }, 2.85)
          .fromTo('.cover-month', { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .65 }, 3)
          .fromTo('.cover-open-button', { opacity: 0, y: 9, scale: .99 }, { opacity: 1, y: 0, scale: 1, duration: .75, clearProps: 'opacity,transform,translate,rotate,scale' }, 3.15)
          .fromTo('.cover-saha', { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: .65 }, 3.15)
        const names = copy.current!.querySelectorAll<HTMLElement>('[data-writing-name]')
        writeNames(timeline, names, .58, 2.4)
      })
    }
    if (document.fonts.status === 'loaded') start()
    else {
      // Use real glyph advances when available; a font request cannot block entry.
      fallback = window.setTimeout(start, 700)
      void document.fonts.ready.then(start)
    }
    return () => {
      disposed = true
      clearTimeout(fallback)
      context.revert()
      // Finish the lettering when opening, or changing motion preference mid-letter.
      gsap.set(elements, { clearProps: 'opacity,transform,clipPath,willChange' })
      finishNameWriting(copyElement)
    }
  }, [phase, reduced, locale])

  const finish = useCallback(() => {
    if (finished.current) return
    finished.current = true
    dialog.current?.close()
    setActiveKnot(null)
    setPhase('closed')
    onRevealed()
  }, [onRevealed])

  useEffect(() => {
    if (reduced && (phase === 'knot' || phase === 'entering')) finish()
  }, [phase, reduced, finish])

  const enter = () => {
    if (opening.current || phase !== 'cover') return
    opening.current = true
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    onEnter()
    if (reduced) finish()
    else { setActiveKnot(knot.current); setPhase('knot') }
  }

  if (phase === 'closed') return null
  return <dialog ref={dialog} className={`welcome-dialog ceremonial-cover is-${phase}`} aria-labelledby="welcome-title" aria-describedby="welcome-description" data-lenis-prevent data-motion-paused={paused} onCancel={event => {
    event.preventDefault()
    if (phase === 'intro') revealCover()
    else if (phase === 'cover') enter()
    else finish()
  }}>
    <div className="cover-scene">
      <LivingCover prepare={!reduced} enabled={phase === 'cover' && !reduced} paused={paused} deferPreparation={phase === 'intro' && introOpening} onPrepared={coverReady}/>
      <div ref={copy} className="cover-copy" inert={phase !== 'cover'}>
        <img className="cover-vinayaka" src="/art/cover/vinayaka-reference.webp" alt={t('A golden Vinayaka blessing', 'శ్రీ వినాయకుని ఆశీస్సులు')} width="300" height="388" fetchPriority="high"/>
        <p className="cover-eyebrow">{wedding.tagline[locale]}</p>
        <h2 id="welcome-title" tabIndex={-1} aria-label={`${openingName} & ${wedding.couple.second[locale]}`}><WritingName>{openingName}</WritingName><em>&</em><WritingName>{wedding.couple.second[locale]}</WritingName></h2>
        <div className="cover-divider" aria-hidden="true"><span/><Lotus/><span/></div>
        <p className="cover-month">{dateLabel(locale)}</p>
        <p id="welcome-description" className="sr-only">{t('With the blessings of our families, we invite you to celebrate our wedding in Shamshabad, Hyderabad.', 'మా కుటుంబాల ఆశీస్సులతో శంషాబాద్, హైదరాబాద్‌లో మా వివాహ వేడుకకు ఆహ్వానిస్తున్నాము.')}</p>
        <button className="cover-open-button" onClick={enter} disabled={phase !== 'cover' || (!reduced && !invitationReady)}><span>{phase === 'knot' || phase === 'entering' ? t('Opening with love…', 'ప్రేమతో ఆహ్వానం…') : t('Open invitation', 'ఆహ్వానం తెరవండి')}</span><ArrowRight size={20}/></button>
        <SahaSignature className="cover-saha" label={t('SaHa — Sathvik and Harika', 'సహ — సాత్విక్ మరియు హారిక')}/>
      </div>
      {phase === 'cover' && !reduced && <button className="cover-motion-toggle" onClick={() => setPaused(value => !value)} aria-pressed={paused} aria-label={paused ? t('Resume decorative motion', 'కదలికలు కొనసాగించండి') : t('Pause decorative motion', 'కదలికలు ఆపండి')}>{paused ? <Play size={14}/> : <Pause size={14}/>}</button>}
    </div>
    {phase === 'intro' && <SilkCurtain ready={ready && coverPrepared} onReveal={beginReveal} onComplete={revealCover}/>}
    {(phase === 'knot' || phase === 'entering') && !reduced && <KnotTransition prepared={activeKnot} onCovered={hideCover} onComplete={finish}/>}
  </dialog>
}
