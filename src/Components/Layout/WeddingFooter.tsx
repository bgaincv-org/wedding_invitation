import { ArrowUpRight, Share2 } from 'lucide-react'
import { wedding } from '@shared/wedding'
import type { Locale } from '@shared/wedding'
import { translator } from '@/lib/content'
import { Lotus } from '@/Components/Decorations/Ornaments'
import { FooterArtwork } from './FooterArtwork'

type WeddingFooterProps = { locale: Locale; entered: boolean; onShare: () => void }

/** Retain the footer artwork and copy for later use without showing a page section. */
export function WeddingFooter({ locale, entered, onShare }: WeddingFooterProps) {
  const t = translator(locale)
  return <footer className="site-footer has-footer-art" hidden>
    <Lotus/>
    <p>{t('The beginning of', 'అందమైన జీవితానికి')} <em>{t('always.', 'ఆరంభం.')}</em></p>
    <div className="footer-names">{wedding.couple.first[locale]} & {wedding.couple.second[locale]}</div>
    <div className="footer-bottom">
      <span>{t('MADE WITH LOVE. ROOTED IN TRADITION.', 'ప్రేమతో. సంప్రదాయాల సమక్షంలో.')}</span>
      <button className="text-button" onClick={onShare}><Share2 size={14}/>{t('Share our invitation', 'మా ఆహ్వానం పంచండి')}</button>
      <a href="#home">{t('BACK TO THE BEGINNING', 'తిరిగి ప్రారంభానికి')}<ArrowUpRight size={13}/></a>
    </div>
    {entered && <FooterArtwork/>}
  </footer>
}
