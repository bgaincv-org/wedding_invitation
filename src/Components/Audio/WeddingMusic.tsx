import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Ref } from 'react'
import { Music2, Pause } from 'lucide-react'
import type { Locale } from '@shared/wedding'
import { translator } from '@/lib/content'
import './WeddingMusic.css'

type Status = 'idle' | 'loading' | 'playing' | 'paused' | 'blocked' | 'error'
export interface WeddingMusicHandle { play(): void }

export function WeddingMusic({ locale, ref }: { locale: Locale; ref: Ref<WeddingMusicHandle> }) {
  const t = translator(locale)
  const audio = useRef<HTMLAudioElement>(null)
  const wanted = useRef(false)
  const request = useRef(0)
  const fade = useRef(0)
  const [status, setStatus] = useState<Status>('idle')

  const pause = useCallback(() => {
    wanted.current = false
    request.current += 1
    cancelAnimationFrame(fade.current)
    audio.current?.pause()
    setStatus('paused')
  }, [])

  const play = useCallback(() => {
    const player = audio.current
    if (!player) return
    const attempt = ++request.current
    wanted.current = true
    cancelAnimationFrame(fade.current)
    if (player.error) player.load()
    if (player.paused) player.volume = 0
    setStatus('loading')
    // Request playback in the click handler. Waiting for the curtain animation
    // loses user activation on browsers that restrict autoplay.
    void player.play().then(() => {
      if (attempt === request.current && wanted.current && !player.paused) setStatus('playing')
    }).catch((error: unknown) => {
      if (attempt !== request.current || !wanted.current) return
      wanted.current = false
      cancelAnimationFrame(fade.current)
      setStatus(error instanceof DOMException && error.name === 'NotAllowedError' ? 'blocked' : 'error')
    })
  }, [])

  const onPlaying = () => {
    const player = audio.current
    if (!player) return
    if (!wanted.current || document.hidden) { pause(); return }
    setStatus('playing')
    cancelAnimationFrame(fade.current)
    const started = performance.now(), from = player.volume
    const tick = (now: number) => {
      if (!wanted.current || player.paused) return
      const progress = Math.min((now - started) / 1400, 1)
      player.volume = from + (.35 - from) * (1 - Math.cos(progress * Math.PI)) / 2
      if (progress < 1) fade.current = requestAnimationFrame(tick)
    }
    fade.current = requestAnimationFrame(tick)
  }

  useImperativeHandle(ref, () => ({ play }), [play])
  useEffect(() => {
    const player = audio.current
    const visibility = () => { if (document.hidden && wanted.current) pause() }
    document.addEventListener('visibilitychange', visibility)
    return () => {
      wanted.current = false
      request.current += 1
      cancelAnimationFrame(fade.current)
      document.removeEventListener('visibilitychange', visibility)
      player?.pause()
    }
  }, [pause])

  const playing = status === 'playing'
  const loading = status === 'loading'
  const message = status === 'blocked' ? t('Tap Play song to hear our wedding music.', 'మా పెళ్లి పాట వినడానికి ప్లే నొక్కండి.')
    : status === 'error' ? t('The song could not load. Tap Play song to retry.', 'పాట లోడ్ కాలేదు. మళ్లీ ప్రయత్నించడానికి ప్లే నొక్కండి.') : ''

  return <>
    <audio ref={audio} className="wedding-audio" src="/audio/pidikita-talambrala-vani-jairam.mp3" preload="none" loop playsInline
      onPlaying={onPlaying}
      onPause={() => { cancelAnimationFrame(fade.current); if (wanted.current) { wanted.current = false; request.current += 1; setStatus('paused') } }}
      onWaiting={() => { if (wanted.current) setStatus('loading') }}
      onError={() => { wanted.current = false; request.current += 1; cancelAnimationFrame(fade.current); setStatus('error') }}/>
    <p className={message ? 'song-notice' : 'sr-only'} role="status">{message}</p>
    <button type="button" className={`sound-control ${playing ? 'is-playing' : ''}`} data-song-state={status}
      onClick={playing || loading ? pause : play}
      aria-label={playing ? t('Pause wedding song', 'పెళ్లి పాట ఆపండి') : loading ? t('Cancel loading song', 'పాట లోడ్ ఆపండి') : t('Play wedding song', 'పెళ్లి పాట వినండి')}
      aria-pressed={playing}>
      {playing || loading ? <Pause size={15}/> : <Music2 size={15}/>}
      <span>{playing ? t('Pause wedding song', 'పెళ్లి పాట ఆపండి') : loading ? t('Cancel loading song', 'పాట లోడ్ ఆపండి') : t('Play wedding song', 'పెళ్లి పాట వినండి')}</span>
    </button>
  </>
}
