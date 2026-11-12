import { useState } from 'react'
import { wedding } from '@shared/wedding'
import type { Locale } from '@shared/wedding'
import { BotanicalSprig, Muggu } from '@/Components/Decorations/Ornaments'
import { translator, safeMediaUrl } from '@/lib/content'

export function FamilyPortraits({ locale }: { locale: Locale }) {
  const t = translator(locale)
  const [failed, setFailed] = useState<Record<string, boolean>>({})
  const people = [
    { key: 'first' as const, initial: 'S', name: wedding.couple.first, role: t('THE GROOM', 'వరుడు'), relation: t('Son of', 'కుమారుడు'), fallback: t('With the love and blessings of his family', 'తన కుటుంబ ప్రేమాభిమానాలు, ఆశీస్సులతో') },
    { key: 'second' as const, initial: 'H', name: wedding.couple.second, role: t('THE BRIDE', 'వధువు'), relation: t('Daughter of', 'కుమార్తె'), fallback: t('With the love and blessings of her family', 'తన కుటుంబ ప్రేమాభిమానాలు, ఆశీస్సులతో') },
  ]
  return <section className="families-section section-space" id="our-families" aria-labelledby="families-title"><div className="family-heading" data-reveal><span className="tiny-label">{t('NOT JUST TWO HEARTS. TWO WHOLE WORLDS.', 'రెండు మనసులే కాదు. రెండు కుటుంబాలు.')}</span><h2 id="families-title">{t('With our families,', 'మా కుటుంబాలతో,')}<br/><em>{t('with all our love.', 'మా ప్రేమతో.')}</em></h2><p>{t('The hands that raised us. The hearts that shaped us. The blessings we carry into every tomorrow.', 'మమ్మల్ని పెంచిన చేతులు. మమ్మల్ని తీర్చిదిద్దిన మనసులు. మా ప్రతి రేపటికీ తోడయ్యే ఆశీస్సులు.')}</p></div><div className="family-portraits">{people.map(person => { const details = wedding.families[person.key]; const portrait = safeMediaUrl(details.portrait?.src); return <article className={`family-person family-${person.key}`} key={person.key} data-reveal><div className="family-cameo"><div className="cameo-inner">{portrait && !failed[person.key] ? <img src={portrait} alt={details.portrait!.alt[locale]} onError={() => setFailed({ ...failed, [person.key]: true })} loading="lazy" width="360" height="460"/> : <><Muggu/><span className="cameo-initial" aria-hidden="true">{person.initial}</span></>}</div><BotanicalSprig className="cameo-sprig sprig-left"/><BotanicalSprig className="cameo-sprig sprig-right"/></div><span className="family-role">{person.role}</span><h3>{person.name[locale]}</h3>{details.parents ? <p><small>{person.relation}</small>{details.parents[locale]}</p> : <p>{person.fallback}</p>}{details.grandparents && <p className="family-grandparents">{details.grandparents[locale]}</p>}{details.message && <p className="family-message">{details.message[locale]}</p>}</article>})}<div className="family-union" aria-hidden="true"><span>&</span><i/>{t('TOGETHER', 'కలిసి')}</div></div>{wedding.families.blessing && <p className="family-blessing">{wedding.families.blessing[locale]}</p>}</section>
}
