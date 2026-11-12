import { wedding } from '@shared/wedding'
import type { Locale } from '@shared/wedding'
import { translator } from '@/lib/content'
import './DivineBlessings.css'

export function DivineBlessings({ locale }: { locale: Locale }) {
  const t = translator(locale)

  return <section id="blessings" className="divine-blessings" aria-labelledby="blessings-title">
    <div className="blessings-florals" aria-hidden="true">
      <img src="/art/couple/lotus-corner.webp" alt="" width="600" height="400" loading="lazy" decoding="async" />
      <img src="/art/couple/lotus-corner.webp" alt="" width="600" height="400" loading="lazy" decoding="async" />
    </div>
    <header className="blessings-heading" data-reveal>
      <div className="blessings-heading-symbol" aria-hidden="true">
        <span />
        <svg className="blessings-namam" viewBox="0 0 60 72" fill="none">
          <path d="M11 8v31c0 17 10 25 19 29 9-4 19-12 19-29V8h-8v30c0 10-5 16-11 20-6-4-11-10-11-20V8Z" fill="currentColor" />
          <path className="blessings-namam-center" d="M27 4h6v37l-3 8-3-8Z" />
        </svg>
        <span />
      </div>
      <p className="blessings-eyebrow">{t('UNDER HIS GRACE, OUR JOURNEY BEGINS', 'స్వామివారి దివ్య ఆశీస్సులతో')}</p>
      <h2 id="blessings-title">{t('Sri Srinivasa Kalyanam', 'శ్రీ శ్రీనివాస కళ్యాణం')}</h2>
      <p className="blessings-verse" lang="te">
        <span>కళ్యాణాద్భుత గాత్రాయ కామితార్థ ప్రదాయినే ।</span>
        <span>శ్రీమద్వేంకట నాథాయ శ్రీనివాసాయ మంగళమ్ ॥</span>
      </p>
    </header>

    <figure className="blessings-artwork" data-reveal>
      <img src="/art/blessings/srinivasa-kalyanam.webp"
        srcSet="/art/blessings/srinivasa-kalyanam-mobile.webp 768w, /art/blessings/srinivasa-kalyanam.webp 1448w"
        sizes="(max-width: 600px) calc(100vw - 48px), (max-width: 920px) calc(100vw - 80px), 840px"
        alt={t('Lord Venkateswara and Goddess Padmavathi’s divine wedding, with deities and sages gathered around the sacred fire', 'దేవతలు, మహర్షుల సమక్షంలో అగ్ని సాక్షిగా శ్రీ వేంకటేశ్వర స్వామి, పద్మావతి అమ్మవారి దివ్య కళ్యాణం')}
        width="1448" height="1086" loading="lazy" decoding="async" />
      <figcaption>{t('Sri Venkateswara Swamy & Sri Padmavathi Ammavaru', 'శ్రీ వేంకటేశ్వర స్వామి · శ్రీ పద్మావతి అమ్మవారు')}</figcaption>
    </figure>

    <div className="blessings-closing" data-reveal>
      <div className="blessings-rule" aria-hidden="true">
        <span />
        <img className="blessings-saha-seal" src="/art/branding/saha-wax-seal.webp" alt="" width="388" height="407" loading="lazy" decoding="async" />
        <span />
      </div>
      <p className="blessings-wish">{t('With divine grace and the blessings of our loved ones.', 'స్వామివారి కృపతో, బంధుమిత్రుల ఆశీస్సులతో…')}</p>
      <p className="blessings-names"><span>{wedding.couple.first[locale]}</span><i>&</i><span>{wedding.couple.second[locale]}</span></p>
      <div className="blessings-family" lang="te"><p>ఆశీర్వదించు వారు</p>{wedding.blessings.map(person => <strong key={person.en}>{person.te}</strong>)}<p className="blessings-family-welcome">{wedding.welcome.te}</p></div>
      {locale === 'en' && <p className="blessings-signoff">{wedding.welcome.en}</p>}
    </div>
  </section>
}
