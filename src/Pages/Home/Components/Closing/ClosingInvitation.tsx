import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ArrowUpRight, Share2, MessageCircle, Printer } from 'lucide-react'
import type { Locale } from '@shared/wedding'
import { wedding } from '@shared/wedding'
import { Deepam, Garland, Lotus } from '@/Components/Decorations/Ornaments'
import { translator, whatsappUrl } from '@/lib/content'

export function ClosingInvitation({ locale, onShare }: { locale: Locale; onShare: () => void }) {
  const scope = useRef<HTMLElement>(null)
  const [revealed, setRevealed] = useState(false)
  const t = translator(locale)
  useGSAP(() => {
    if (!revealed || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo('.closing-revealed > *', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .8, stagger: .1, ease: 'power2.out' })
  }, { scope, dependencies: [revealed], revertOnUpdate: true })
  const reveal = () => setRevealed(true)
  return <section className={`closing-invitation ${revealed ? 'is-revealed' : ''}`} ref={scope} id="with-love" aria-labelledby="closing-title"><img className="closing-backdrop" src="/art/jasmine-evening.webp" alt="" loading="lazy" width="1024" height="1536"/><div className="closing-scrim"/><Garland className="closing-garland"/><div className="closing-card"><span className="tiny-label">{t('ONE LAST THING, BEFORE YOU GO', 'మీరు వెళ్లే ముందు, ఒక మాట')}</span><Deepam className="closing-lamp"/><h2 id="closing-title">{t('With you, it becomes', 'మీ రాకతోనే')}<br/><em>{t('a celebration.', 'మా వేడుక సంపూర్ణం.')}</em></h2>{!revealed ? <><p>{t('We have saved a little something for the people who make our world feel like home.', 'మా ప్రపంచాన్ని ఆప్యాయంగా మార్చే మీ కోసం ఒక చిన్న ఆహ్వానం.')}</p><button className="button closing-reveal-button" onClick={reveal}>{t('A note from our hearts', 'మా మనసులోని మాట')}<ArrowUpRight size={17}/></button></> : <div className="closing-revealed" aria-live="polite"><Lotus/><p>{wedding.personalMessage?.[locale] ?? t('Come with your laughter. Come with your blessings. Come just as you are. As we begin this beautiful chapter, your presence will be our most cherished gift.', 'మీ నవ్వులతో, మీ ఆశీస్సులతో విచ్చేయండి. ఈ అందమైన అధ్యాయం ప్రారంభంలో మీ సమక్షమే మాకు అమూల్యమైన కానుక.')}</p><div className="closing-signature">{wedding.couple.first[locale]} <em>&</em> {wedding.couple.second[locale]}</div><span>{wedding.month[locale]} · {wedding.location[locale]}</span><a className="button" href="#rsvp">{t('Save us a little happiness — RSVP', 'మీ రాకను తెలియజేయండి')}<ArrowUpRight size={16}/></a></div>}<p className="closing-blessing" lang="te">మీ రాక మాకెంతో ఆనందదాయకం · శుభమస్తు</p></div><div className="closing-share"><button onClick={onShare}><Share2 size={15}/>{t('Share invitation', 'ఆహ్వానం పంచండి')}</button><a href={whatsappUrl()} target="_blank" rel="noopener noreferrer"><MessageCircle size={16}/>{t('WhatsApp', 'వాట్సాప్')}</a><button onClick={() => window.print()}><Printer size={16}/>{t('Print details', 'వివరాలు ముద్రించండి')}</button></div></section>
}
