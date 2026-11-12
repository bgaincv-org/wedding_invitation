import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { finishNameWriting, NAME_REVEAL_SPEED, writeNames } from '@/lib/animation/nameWriting'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export function useExperience(locale: string, enabled: boolean) {
  const root = useRef<HTMLDivElement>(null)
  const seen = useRef(new WeakSet<HTMLElement>())
  useGSAP(() => {
    if (!enabled) return
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', motionContext => {
      const rootElement = root.current
      const lenis = new Lenis({ duration: 1.05, smoothWheel: true, anchors: { offset: -12 }, prevent: node => !!node.closest('dialog[open]') })
      const tick = (time: number) => lenis.raf(time * 1000)
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add(tick)
      const entrance = gsap.timeline({ defaults: { ease: 'sine.inOut', force3D: true } }).timeScale(NAME_REVEAL_SPEED)
      entrance.from('.couple-heading > *', { y: 8, opacity: 0, stagger: .09, duration: 1.05 }, 0)
        .from('.couple-garland, .couple-lamp', { opacity: 0, stagger: .06, duration: 1.2 }, .05)
        .from('.couple-sketch', { opacity: 0, duration: 1.3 }, .2)
        .from('.couple-frame-wrap', { y: 10, opacity: 0, duration: 1.2 }, .25)
        .from('.couple-crest', { y: 8, opacity: 0, duration: .9 }, .8)
        .from('.couple-center-ornament', { opacity: 0, duration: 1.1 }, .7)
        .from('.couple-role, .couple-description', { y: 8, opacity: 0, stagger: .07, duration: .65 }, 2.8)
        .from('.couple-florals, .couple-footer', { y: 12, opacity: 0, stagger: .1, duration: .8 }, 2.7)
      const names = root.current!.querySelectorAll<HTMLElement>('.couple-person [data-writing-name]')
      writeNames(entrance, names, 1.05, 1.9)
      gsap.to('.reading-progress', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: true } })
      const closing = rootElement?.querySelector('.closing-invitation')
      const closingArt = closing?.querySelector('.closing-backdrop')
      if (closing && closingArt) gsap.fromTo(closingArt, { yPercent: -5, scale: 1.08 }, { yPercent: 5, scale: 1, ease: 'none', scrollTrigger: { trigger: closing, start: 'top bottom', end: 'bottom top', scrub: 1 } })
      const revealed = new Set<HTMLElement>()
      const revealObserver = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting).map(entry => entry.target as HTMLElement)
        if (!visible.length) return
        visible.forEach(element => { revealObserver.unobserve(element); seen.current.add(element); element.style.willChange = 'transform, opacity' })
        motionContext.add(() => gsap.to(visible, {
          y: 0, opacity: 1, duration: .95, stagger: .045, ease: 'sine.inOut', force3D: true,
          onComplete: () => gsap.set(visible, {clearProps:'opacity,transform,willChange'}),
        }))
      }, {rootMargin:'0px 0px -3% 0px', threshold:0})
      const registerReveals = () => {
        let added = 0
        rootElement?.querySelectorAll<HTMLElement>('[data-reveal], .invitation-chapter h2').forEach(element => {
          if (revealed.has(element) || element.closest('.woven-journey, .couple-hero, .wedding-journey')) return
          // The parent owns the fade; nested fades multiply opacity and movement.
          if (element.parentElement?.closest('[data-reveal]')) return
          revealed.add(element)
          if (seen.current.has(element)) return
          added++
          gsap.set(element, {y: element.tagName === 'H2' ? 6 : 10, opacity:0})
          revealObserver.observe(element)
        })
        return added
      }
      registerReveals()
      const path = document.querySelector<SVGPathElement>('.golden-thread path')
      if (path) {
        const length = path.getTotalLength()
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
        gsap.to(path, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.invitation-section', start: 'top 70%', end: 'bottom 30%', scrub: 1 } })
      }
      let disposed = false, refreshTimer = 0
      const refresh = () => {
        clearTimeout(refreshTimer)
        refreshTimer = window.setTimeout(() => { if (!disposed) ScrollTrigger.refresh() }, 140)
      }
      const resize = new ResizeObserver(refresh)
      if (root.current) resize.observe(root.current)
      // Lazy gallery/reply content receives the same fade when it arrives later.
      const additions = new MutationObserver(records => {
        if (!records.some(record => [...record.addedNodes].some(node => node instanceof HTMLElement && !node.closest('[role="timer"]')))) return
        motionContext.add(() => { if (registerReveals()) refresh() })
      })
      if (rootElement) additions.observe(rootElement, { childList: true, subtree: true })
      void document.fonts.ready.then(() => { if (!disposed) refresh() })
      return () => {
        disposed = true
        clearTimeout(refreshTimer)
        resize.disconnect()
        additions.disconnect()
        revealObserver.disconnect()
        revealed.forEach(element => element.style.removeProperty('will-change'))
        gsap.ticker.remove(tick)
        lenis.destroy()
        finishNameWriting(rootElement)
      }
    }, root)
    return () => media.revert()
  }, { scope: root, dependencies: [locale, enabled], revertOnUpdate: true })
  return root
}
