import type { Ref } from 'react'
import { Info } from 'lucide-react'
import type { Locale } from '@shared/wedding'
import { translator } from '@/lib/content'
import { WeddingMusic } from './WeddingMusic'
import type { WeddingMusicHandle } from './WeddingMusic'
import './WeddingSong.css'

/** Keep one audio instance mounted, independently of the hidden footer. */
export function WeddingSong({ locale, musicRef, visible }: { locale: Locale; musicRef: Ref<WeddingMusicHandle>; visible: boolean }) {
  const t = translator(locale)
  return <aside className="wedding-song-player" hidden={!visible} aria-label={t('Wedding song player', 'పెళ్లి పాట ప్లేయర్')}>
    <WeddingMusic ref={musicRef} locale={locale}/>
    <details className="wedding-song-credits">
      <summary aria-label={t('Song and artwork credits', 'పాట మరియు చిత్రాల వివరాలు')}><Info size={16}/></summary>
      <div className="wedding-song-credits-panel">
        <strong>{t('Pidikita Talambrala', 'పిడికిట తలంబ్రాల')}</strong>
        <a className="song-credit" href="https://www.tirumala.org/Annamacharya_Keertanas_Sravanam.aspx" target="_blank" rel="noopener noreferrer">{t('Vani Jairam · TTD recordings', 'వాణీ జయరాం · టీటీడీ రికార్డింగ్స్')}</a>
        <a className="butterfly-photo-credit" href="/art/couple/butterfly-credits.txt">{t('Butterfly photos: Didier Descouens · CC BY-SA 4.0', 'సీతాకోకచిలుకల చిత్రాలు: Didier Descouens · CC BY-SA 4.0')}</a>
      </div>
    </details>
  </aside>
}
