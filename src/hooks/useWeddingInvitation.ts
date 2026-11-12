import { startTransition, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Locale, WeddingEvent } from '@shared/wedding'
import type { WeddingMusicHandle } from '@/Components/Audio/WeddingMusic'
import { downloadCalendar } from '@/lib/calendar'
import { invitationUrl, invitationTitle, invitationSummary, translator, shouldShowWelcome } from '@/lib/content'

/** Owns preferences, opening state and guest actions across both pages. */
export function useWeddingInvitation() {
  const [locale, setLocale] = useState<Locale>(() => { try { return localStorage.getItem('wedding-language') === 'te' ? 'te' : 'en' } catch { return 'en' } })
  const [decorationsPaused, setDecorationsPaused] = useState(false)
  const [toast, setToast] = useState('')
  const [entered, setEntered] = useState(() => !shouldShowWelcome())
  const [revealed, setRevealed] = useState(() => !shouldShowWelcome())
  const music = useRef<WeddingMusicHandle>(null)
  const prepareInvitation = useCallback(() => { startTransition(() => setEntered(true)) }, [])
  const enterInvitation = useCallback(() => { setEntered(true); music.current?.play() }, [])
  const revealInvitation = useCallback(() => { setRevealed(true) }, [])
  const wasRevealed = useRef(revealed)
  const dialog = useRef<HTMLDialogElement>(null)
  const shareDialog = useRef<HTMLDialogElement>(null)
  const t = translator(locale)

  useLayoutEffect(() => {
    // Focus only after React commits the visible main page, never on a hidden hero.
    if (revealed && !wasRevealed.current) document.querySelector<HTMLHeadingElement>('#hero-title')?.focus({ preventScroll: true })
    wasRevealed.current = revealed
  }, [revealed])

  useEffect(() => { document.documentElement.lang = locale; try { localStorage.setItem('wedding-language', locale) } catch { /* Preferences are optional. */ } }, [locale])
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' })
    })
    return () => cancelAnimationFrame(frame)
  }, [])
  useEffect(() => { if (!toast) return; const timeout = setTimeout(() => setToast(''), 4500); return () => clearTimeout(timeout) }, [toast])

  async function copy() {
    try { await navigator.clipboard.writeText(invitationUrl()); setToast(t('Invitation link copied. Share a little joy.', 'ఆహ్వాన లింక్ కాపీ అయింది.')); shareDialog.current?.close() }
    catch { if (!shareDialog.current?.open) shareDialog.current?.showModal() }
  }
  async function share() {
    if (navigator.share) {
      try { await navigator.share({ title: invitationTitle, text: invitationSummary, url: invitationUrl() }); return }
      catch (error) { if (error instanceof Error && error.name === 'AbortError') return }
    }
    await copy()
  }
  function calendar(event: WeddingEvent) {
    try { downloadCalendar(event) } catch { setToast(t('The calendar file could not be created. Please use the times shown in the invitation.', 'క్యాలెండర్ ఫైల్ సృష్టించలేకపోయాము. దయచేసి ఆహ్వానంలో చూపిన సమయాలను చూడండి.')) }
  }
  return { locale, setLocale, decorationsPaused, setDecorationsPaused, toast, entered, revealed, music, dialog, shareDialog, prepareInvitation, enterInvitation, revealInvitation, copy, share, calendar }
}
