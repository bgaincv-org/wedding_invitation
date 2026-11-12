import { Lotus } from '@/Components/Decorations/Ornaments'
import { DeferredRsvp as RsvpForm } from './DeferredRsvp'
import { translator } from '@/lib/content'
import { wedding } from '@shared/wedding'
import type { Locale } from '@shared/wedding'

export function RsvpSection({ locale }: { locale: Locale }) {
 const t = translator(locale)
 return <section className="rsvp-section section-space" id="rsvp" aria-labelledby="rsvp-title"><div className="rsvp-copy" data-reveal><div className="section-eyebrow"><span>05</span>{t('THE BEST PART IS YOU', 'మీ సమక్షమే మా ఆనందం')}<i/></div><Lotus className="rsvp-lotus"/><h2 id="rsvp-title">{t('Our celebration.', 'మా వేడుక.')}<br/><em>{t('Your presence.', 'మీ సమక్షం.')}</em></h2><p>{t('A wedding is made of moments. The most beautiful ones are shared. Let us know if you’ll be part of ours.', 'వివాహం ఎన్నో మధుర క్షణాల కలయిక. మీతో పంచుకునే క్షణాలు మరింత అందమైనవి. మీరు వస్తారో తెలియజేయండి.')}</p><span className="rsvp-footnote">{t('A little reply. A lot of happiness.', 'ఒక చిన్న సమాధానం. ఎంతో ఆనందం.')}</span></div><div className="rsvp-form-container" data-reveal>{wedding.rsvpEnabled ? <RsvpForm locale={locale}/> : <p>{t('RSVPs will open soon. We can’t wait to celebrate with you.', 'సమాధానాలు త్వరలో స్వీకరిస్తాము. మీతో జరుపుకోవాలని ఎదురుచూస్తున్నాము.')}</p>}</div></section>
}
