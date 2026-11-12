import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, CalendarDays, MapPin, Navigation, Pause, Play, LockKeyhole } from 'lucide-react'
import { Lotus } from '@/Components/Decorations/Ornaments'
import { translator, dateLabel, eventDateLabel, eventTimeLabel } from '@/lib/content'
import { wedding } from '@shared/wedding'
import type { Locale, WeddingEvent } from '@shared/wedding'
import './GuestDetails.css'

export function GuestDetails({ locale, onCalendar, paused = false }: { locale: Locale; onCalendar: (event: WeddingEvent) => void; paused?: boolean }) {
  const t = translator(locale)
  const root = useRef<HTMLElement>(null)
  const [mapInteractive, setMapInteractive] = useState(false)
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading')
  const [motionPaused, setMotionPaused] = useState(false)
  useEffect(() => {
    const section = root.current
    if (!section) return
    let visible = false
    const update = () => { section.dataset.motionActive = String(visible && !document.hidden) }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update() })
    observer.observe(section)
    document.addEventListener('visibilitychange', update)
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update) }
  }, [])

  return <section ref={root} className="venue-section" id="the-details" aria-labelledby="details-title" data-motion-paused={paused || motionPaused}>
    <div className="venue-layout">
      <div className="venue-intro" data-reveal>
        <Lotus className="venue-lotus"/>
        <p className="venue-eyebrow">{t('ONE PLACE, BEAUTIFUL BEGINNINGS', 'మా ఆనందానికి వేదిక')}</p>
        <h2 id="details-title">{t('Join us in Hyderabad', 'హైదరాబాద్‌లో కలుద్దాం')}</h2>
        <h3>{wedding.venue.name[locale]}</h3>
        <address>{wedding.venue.address[locale]}</address>
        <div className="venue-map-preview" data-interactive={mapInteractive} data-lenis-prevent={mapInteractive || undefined}>
          <iframe src={wedding.venue.mapsEmbedUrl} title={t('Google Map of The Environ Convention', 'The Environ Convention గూగుల్ మ్యాప్')} loading="lazy" referrerPolicy="no-referrer-when-downgrade" tabIndex={mapInteractive ? 0 : -1} aria-hidden={!mapInteractive} onLoad={() => setMapStatus('ready')} onError={() => setMapStatus('unavailable')}/>
          {mapStatus !== 'ready' && <div className="venue-map-loading" role="status"><MapPin size={24}/><span>{mapStatus === 'loading' ? t('Loading venue map…', 'వేదిక మ్యాప్ లోడ్ అవుతోంది…') : t('Use Open venue for directions.', 'దారి కోసం వేదికను తెరవండి.')}</span></div>}
          {!mapInteractive && <button type="button" className="venue-map-explore" onClick={() => setMapInteractive(true)} aria-label={t('Explore the interactive venue map', 'వేదిక మ్యాప్‌ను చూడండి')}><span><Navigation size={15}/>{t('Explore map', 'మ్యాప్ చూడండి')}</span></button>}
          {mapInteractive && <button type="button" className="venue-map-lock" onClick={() => setMapInteractive(false)}><LockKeyhole size={13}/>{t('Lock map', 'మ్యాప్ లాక్ చేయండి')}</button>}
        </div>
        <p className="venue-map-caption"><MapPin size={13}/>{t('ORR Exit 15 · Mansanpalle', 'ఓఆర్ఆర్ ఎగ్జిట్ 15 · మంసాన్‌పల్లి')}</p>
        <a className="venue-map" href={wedding.venue.mapsUrl} target="_blank" rel="noopener noreferrer"><MapPin size={17}/><span>{t('Open venue', 'వేదికను తెరవండి')}<small>Google Maps</small></span><ArrowUpRight className="venue-map-arrow" size={19}/></a>
        <button type="button" className="venue-motion-toggle" disabled={paused} aria-pressed={motionPaused} onClick={() => setMotionPaused(value => !value)}>{motionPaused ? <Play size={12}/> : <Pause size={12}/>}<span>{motionPaused ? t('Resume venue animation', 'వేదిక యానిమేషన్ కొనసాగించండి') : t('Pause venue animation', 'వేదిక యానిమేషన్ ఆపండి')}</span></button>
      </div>
      <div className="venue-schedule" data-reveal>
        <p className="venue-dates">{dateLabel(locale)}</p>
        <p className="venue-overnight">{t('An evening of celebration, followed by our wedding in the early hours of Sunday.', 'శనివారం రిసెప్షన్ అనంతరం, ఆదివారం తెల్లవారుజామున మా వివాహం.')}</p>
        <ol>{wedding.events.filter(event => event.public !== false && event.startsAt).map(event => <li key={event.id}>
          <h3>{event.title[locale]}</h3>
          <time dateTime={event.startsAt!}><span>{eventDateLabel(event.startsAt!, locale)}</span><strong>{eventTimeLabel(event.startsAt!, locale)}{event.id === 'reception' && t(' onwards', ' నుండి')}</strong></time>
          <p>{event.hospitality?.[locale]}</p>
          <button type="button" onClick={() => onCalendar(event)}><CalendarDays size={15}/>{t('Add to calendar', 'క్యాలెండర్‌లో చేర్చండి')}</button>
        </li>)}</ol>
      </div>
    </div>
  </section>
}
