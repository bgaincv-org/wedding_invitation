import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { ArrowLeft, ArrowRight, Expand, Pause, Play, X } from 'lucide-react'
import { Lotus } from '@/Components/Decorations/Ornaments'
import './MemoryGallery.css'

type LocalizedText = { en: string; te: string }

export type MediaItem = {
  src: string
  alt: LocalizedText
  caption: LocalizedText
  kind: 'photo' | 'illustration' | 'placeholder'
}

type MemoryGalleryProps = {
  locale: 'en' | 'te'
  paused?: boolean
  photos?: MediaItem[]
  video?: { src: string; poster?: string; title: LocalizedText } | null
}

// Keep the frames ready for photographs, using the couple's original identity for now.
const galleryPlaceholders: MediaItem[] = [
  {
    src: '/art/branding/saha-wax-seal.webp',
    alt: {
      en: 'SaHa gold wax seal, marking a space for our future memories.',
      te: 'మా మధుర జ్ఞాపకాల కోసం సహ బంగారు ముద్రతో ఖాళీ ఫ్రేమ్.',
    },
    caption: { en: 'An evening wrapped in jasmine', te: 'మల్లెల పరిమళాల సాయంత్రం' },
    kind: 'placeholder',
  },
  {
    src: '/art/branding/saha-monogram.svg',
    alt: {
      en: 'SaHa monogram with the Hindi letter Ha and two hearts, on ivory.',
      te: 'ఐవరీ నేపథ్యంపై హిందీ హ అక్షరం, రెండు హృదయాలతో సహ చిహ్నం.',
    },
    caption: { en: 'A little letter. So much love.', te: 'ఒక చిన్న శుభలేఖ. ఎంతో ప్రేమ.' },
    kind: 'placeholder',
  },
  {
    src: '/art/branding/saha-monogram.svg',
    alt: {
      en: 'SaHa monogram with the Hindi letter Ha and two hearts, on ivory.',
      te: 'ఐవరీ నేపథ్యంపై హిందీ హ అక్షరం, రెండు హృదయాలతో సహ చిహ్నం.',
    },
    caption: { en: 'The beauty in our traditions', te: 'మన సంప్రదాయాల్లో అందం' },
    kind: 'placeholder',
  },
  {
    src: '/art/branding/saha-wax-seal.webp',
    alt: {
      en: 'SaHa gold wax seal, marking a space for our future memories.',
      te: 'మా మధుర జ్ఞాపకాల కోసం సహ బంగారు ముద్రతో ఖాళీ ఫ్రేమ్.',
    },
    caption: { en: 'A beautiful beginning awaits', te: 'అందమైన ఆరంభం కోసం' },
    kind: 'placeholder',
  },
]

function safeMediaUrl(value?: string) {
  if (!value) return undefined
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')) return value
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined
  } catch { return undefined }
}

function Artwork({ item, locale, eager = false }: { item: MediaItem; locale: 'en' | 'te'; eager?: boolean }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <span className="memory-image-fallback" role="img" aria-label={item.alt[locale]}>
    <Lotus />
    <span>{item.caption[locale]}</span>
    <small>{locale === 'en' ? 'This image is taking a little longer to arrive.' : 'ఈ చిత్రం ప్రస్తుతం అందుబాటులో లేదు.'}</small>
  </span>
  if (item.kind === 'placeholder') return <span className="memory-brand-placeholder">
    <img className={item.src.endsWith('.webp') ? 'memory-brand-seal' : 'memory-brand-monogram'}
      src={item.src} alt={item.alt[locale]} loading={eager ? 'eager' : 'lazy'} decoding="async"
      width={item.src.endsWith('.webp') ? 388 : 64} height={item.src.endsWith('.webp') ? 407 : 70}
      onError={() => setFailed(true)} draggable={false} />
    <img className="memory-brand-wordmark" src="/art/branding/saha-wordmark.svg" alt=""
      width="107" height="48" loading={eager ? 'eager' : 'lazy'} decoding="async" draggable={false} />
  </span>
  return <img
    src={item.src}
    alt={item.alt[locale]}
    loading={eager ? 'eager' : 'lazy'}
    decoding="async"
    width="900"
    height="1200"
    onError={() => setFailed(true)}
    draggable={false}
  />
}

export function MemoryGallery({ locale, photos = [], video = null, paused = false }: MemoryGalleryProps) {
  const t = (en: string, te: string) => locale === 'te' ? te : en
  const suppliedItems = photos.filter(item => safeMediaUrl(item.src))
  const items = suppliedItems.length ? suppliedItems : galleryPlaceholders
  const photoMode = items.some(item => item.kind === 'photo')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [videoOpen, setVideoOpen] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [ornamentsPaused, setOrnamentsPaused] = useState(false)
  const gallery = useRef<HTMLElement>(null)
  const lightbox = useRef<HTMLDialogElement>(null)
  const player = useRef<HTMLVideoElement>(null)
  const returnFocus = useRef<HTMLButtonElement | null>(null)
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const headingId = useId()
  const dialogHeadingId = useId()
  const selected = items[selectedIndex % items.length]
  const videoUrl = safeMediaUrl(video?.src)
  const posterUrl = safeMediaUrl(video?.poster)

  useEffect(() => {
    const section = gallery.current
    if (!section) return
    let inView = false
    const updateMotion = () => { section.dataset.motionActive = String(inView && !document.hidden) }
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      updateMotion()
    }, { rootMargin: '80px' })
    observer.observe(section)
    document.addEventListener('visibilitychange', updateMotion)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', updateMotion)
    }
  }, [])

  function openImage(index: number, trigger: HTMLButtonElement) {
    returnFocus.current = trigger
    setSelectedIndex(index)
    setVideoOpen(false)
    setIsOpen(true)
    lightbox.current?.showModal()
  }

  function openFilm(trigger: HTMLButtonElement) {
    returnFocus.current = trigger
    setVideoFailed(false)
    setVideoOpen(true)
    setIsOpen(true)
    lightbox.current?.showModal()
  }

  function onClose() {
    player.current?.pause()
    setVideoOpen(false)
    setIsOpen(false)
    pointerStart.current = null
    returnFocus.current?.focus({ preventScroll: true })
  }

  function move(direction: number) {
    setSelectedIndex(index => (index + direction + items.length) % items.length)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (videoOpen) return
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      event.stopPropagation()
      move(event.key === 'ArrowRight' ? 1 : -1)
    }
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'touch') pointerStart.current = { x: event.clientX, y: event.clientY }
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current
    pointerStart.current = null
    if (!start || event.pointerType !== 'touch' || videoOpen) return
    const distance = event.clientX - start.x
    if (Math.abs(distance) > 50 && Math.abs(distance) > Math.abs(event.clientY - start.y)) move(distance > 0 ? -1 : 1)
  }

  return <section ref={gallery} className="memory-gallery" id="moments" aria-labelledby={headingId}
    data-motion-paused={paused || ornamentsPaused || isOpen}>
    <div className="memory-border memory-border-top" aria-hidden="true" />
    <div className="memory-toran" aria-hidden="true" />
    <div className="memory-ornament memory-ornament-left" aria-hidden="true">
      <img src="/art/gallery/jasmine-lamp.webp" alt="" width="640" height="960" loading="lazy" decoding="async" />
    </div>
    <div className="memory-ornament memory-ornament-right" aria-hidden="true">
      <img src="/art/gallery/ceremonial-parasol.webp" alt="" width="640" height="960" loading="lazy" decoding="async" />
    </div>
    <header className="memory-gallery-heading" data-reveal>
      <div className="memory-saha-signature">
        <span aria-hidden="true" />
        <img src="/art/branding/saha-wordmark.svg" width="107" height="48" loading="lazy" decoding="async"
          alt={t('SaHa — Sai Sathvik + Harika', 'సహ — సాయి సాత్విక్ + హారిక')} />
        <span aria-hidden="true" />
      </div>
      <h2 id={headingId}>{t('Before the Vows', 'ప్రమాణాలకు ముందు')}</h2>
      <p>{photoMode
        ? <>{t('Little moments that brought us', 'మనల్ని ఇక్కడికి చేర్చిన')}<br />{t('to a lifetime together.', 'మధురమైన చిన్న జ్ఞాపకాలు.')}</>
        : <>{t('A little glimpse of the love', 'మన ప్రేమ, మన వేడుకలోని')}<br />{t('and celebration to come.', 'మధురమైన చిన్న అందాలు.')}</>}</p>
      <div className="memory-heading-rule" aria-hidden="true"><span /><Lotus /><span /></div>
    </header>

    <div className={`memory-gallery-collection ${items.length === 1 ? 'memory-gallery-single' : ''}`}>
      {items.map((item, index) => <figure className="memory-figure" key={`${item.src}-${index}`} data-reveal>
        <button type="button" className="memory-image-button" onClick={event => openImage(index, event.currentTarget)} aria-label={`${t('Open', 'చూడండి')}: ${item.caption[locale]}`} aria-haspopup="dialog">
          <span className="memory-image-frame"><Artwork key={item.src} item={item} locale={locale} /></span>
          <span className="memory-image-open" aria-hidden="true"><Expand size={17} /></span>
        </button>
        <figcaption><span className="memory-image-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span>{item.caption[locale]}</span></figcaption>
      </figure>)}
    </div>

    <div className="memory-gallery-afterword" data-reveal>
      <div className="memory-afterword-rule" aria-hidden="true"><span /><Lotus /><span /></div>
      <p>{photoMode
        ? t('Every little moment, a part of our forever.', 'ఒక్కో క్షణం. మన కథలో ఓ పుట.')
        : t('Our photographs, coming soon. A little space for our memories.', 'మా ఫోటోలు త్వరలో. మా మధుర జ్ఞాపకాల కోసం ఈ చోటు.')}</p>
      <button type="button" className="memory-motion-control" aria-pressed={ornamentsPaused}
        disabled={paused} onClick={() => setOrnamentsPaused(value => !value)}>
        {ornamentsPaused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
        {ornamentsPaused ? t('Resume ornaments', 'అలంకరణల కదలికను కొనసాగించండి') : t('Pause ornaments', 'అలంకరణల కదలికను ఆపండి')}
      </button>
    </div>
    <div className="memory-border memory-border-bottom" aria-hidden="true" />

    {video && videoUrl && <div className="memory-film" data-reveal>
      <div className="memory-film-rule" aria-hidden="true"><Lotus /></div>
      <div><span className="memory-eyebrow">{t('A SPECIAL GLIMPSE', 'ఒక మధుర దృశ్యం')}</span><h3>{video.title[locale]}</h3><p>{t('Press play when you’re ready. A little more of our story.', 'మీకు వీలైనప్పుడు చూడండి. మా కథలో మరో మధుర ఘట్టం.')}</p></div>
      <button className="memory-film-button" onClick={event => openFilm(event.currentTarget)}><span><Play size={17} fill="currentColor" aria-hidden="true" /></span>{t('Watch our film', 'మా వీడియో చూడండి')}</button>
    </div>}

    <dialog
      className={`memory-dialog ${videoOpen ? 'memory-dialog-film' : ''}`}
      ref={lightbox}
      aria-labelledby={dialogHeadingId}
      data-lenis-prevent
      onClose={onClose}
      onKeyDown={onKeyDown}
      onClick={event => { if (event.target === event.currentTarget) lightbox.current?.close() }}
    >
      <div className="memory-dialog-topline"><span>{videoOpen ? t('A SPECIAL GLIMPSE', 'ఒక మధుర దృశ్యం') : selected.kind === 'placeholder' ? t('SAHA — OUR STORY', 'సహ — మా కథ') : selected.kind === 'illustration' ? t('AN ORIGINAL ILLUSTRATION', 'స్వతంత్ర చిత్రకళ') : t('A MOMENT TO REMEMBER', 'ఒక మధుర జ్ఞాపకం')}</span><button onClick={() => lightbox.current?.close()} aria-label={t('Close gallery', 'గ్యాలరీ మూసివేయండి')}><X size={21} /></button></div>
      <div className="memory-dialog-stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { pointerStart.current = null }}>
        {isOpen && (videoOpen && videoUrl
          ? videoFailed
            ? <div className="memory-video-error" role="status"><Lotus /><p>{t('The film could not load just now.', 'వీడియో ప్రస్తుతం లోడ్ కాలేదు.')}</p><button className="text-button" onClick={() => setVideoFailed(false)}>{t('Try again', 'మళ్లీ ప్రయత్నించండి')}<ArrowRight size={16} /></button></div>
            : <video ref={player} controls preload="none" playsInline poster={posterUrl} src={videoUrl} onError={() => setVideoFailed(true)} aria-label={video?.title[locale]} />
          : <Artwork key={selected.src} item={selected} locale={locale} eager />)}
      </div>
      <div className="memory-dialog-bottomline">
        {!videoOpen && <button onClick={() => move(-1)} disabled={items.length < 2} aria-label={t('Previous image', 'మునుపటి చిత్రం')}><ArrowLeft size={20} /></button>}
        <div className="memory-dialog-caption" aria-live="polite" aria-atomic="true"><h3 id={dialogHeadingId}>{videoOpen ? video?.title[locale] : selected.caption[locale]}</h3>{!videoOpen && <p>{selectedIndex % items.length + 1} <span aria-hidden="true">/</span><span className="sr-only">{t('of', 'లో')}</span> {items.length}</p>}</div>
        {!videoOpen && <button onClick={() => move(1)} disabled={items.length < 2} aria-label={t('Next image', 'తదుపరి చిత్రం')}><ArrowRight size={20} /></button>}
      </div>
    </dialog>
  </section>
}
