import { ArrowDown, Share2 } from 'lucide-react'
import { wedding } from '@shared/wedding'
import type { Locale } from '@shared/wedding'
import { translator, dateLabel } from '@/lib/content'
import { SahaSignature } from '@/Components/Decorations/SahaSignature'
import { FamilyInvitationCopy } from '@/Components/Decorations/FamilyInvitationCopy'
import './InvitationLetter.css'

export function InvitationLetter({ locale, onShare }: { locale: Locale; onShare: () => void }) {
  const t = translator(locale)
  return <section id="our-invitation" className="family-invitation" aria-labelledby="invitation-title">
    <div className="family-invitation-layout">
      <header className="family-invitation-intro" data-reveal>
        <SahaSignature/>
        <p className="family-invitation-eyebrow">{t('WITH OUR FAMILIES', 'మా కుటుంబాల ప్రేమాభిమానాలతో')}</p>
        <h2 id="invitation-title">{wedding.tagline[locale]}</h2>
        <p className="family-invitation-dates">{dateLabel(locale)}</p>
        <p>{t('Two hearts, two families, one beautiful beginning. We would love to have you beside us.', 'రెండు మనసులు, రెండు కుటుంబాలు, ఒక అందమైన ఆరంభం. మా ఆనందంలో మీరు భాగం కావాలని కోరుకుంటున్నాము.')}</p>
        <div className="family-invitation-actions"><a href="#celebrations">{t('Our celebrations', 'మా వేడుకలు')}<ArrowDown size={16}/></a><button onClick={onShare}><Share2 size={15}/>{t('Share invitation', 'ఆహ్వానం పంచుకోండి')}</button></div>
      </header>
      <div className="family-invitation-letter" data-reveal><FamilyInvitationCopy locale={locale}/></div>
    </div>
  </section>
}
