import { wedding } from '@shared/wedding'
import type { Locale } from '@shared/wedding'
import { translator } from '@/lib/content'
import './FamilyInvitationCopy.css'

export function FamilyInvitationCopy({ locale }: { locale: Locale }) {
  const t = translator(locale)
  return <div className="family-invitation-copy">
    <p className="family-invocation">{wedding.invocation[locale]}</p>
    <p className="family-hosts">{wedding.families.first.parents?.[locale]}<span>{wedding.families.first.message?.[locale]}</span></p>
    <p>{t('Request your blessings and love on the wedding of their only son', 'తమ ఏకైక కుమారుని వివాహానికి మీ ప్రేమాభిమానాలు, ఆశీస్సులు కోరుతూ')}</p>
    <p className="family-formal-name">{wedding.formalNames.first[locale]}</p>
    <p className="family-with">{t('with', 'మరియు')}</p>
    <p className="family-formal-name">{wedding.formalNames.second[locale]}</p>
    <p className="family-bride-parents"><span>{t('Elder daughter of', 'పెద్ద కుమార్తె')}</span><strong>{wedding.families.second.parents?.[locale]}</strong><span>{wedding.families.second.message?.[locale]}</span></p>
    <div className="family-elders"><p>{t('With the blessings of', 'ఆశీస్సులతో')}</p><strong>{wedding.families.blessing[locale]}</strong><p>{wedding.compliments[locale]}</p></div>
  </div>
}
