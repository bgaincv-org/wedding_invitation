import { useRef } from 'react'
import type { RefObject } from 'react'
import { ArrowRight, Copy, MessageCircle, Share2, X } from 'lucide-react'
import type { Locale } from '@shared/wedding'
import { wedding } from '@shared/wedding'
import { FamilyInvitationCopy } from '@/Components/Decorations/FamilyInvitationCopy'
import { Lotus } from '@/Components/Decorations/Ornaments'
import { translator, dateLabel, invitationUrl, whatsappUrl } from '@/lib/content'

export function InvitationDialog({ locale, dialog, onShare }: { locale: Locale; dialog: RefObject<HTMLDialogElement | null>; onShare: () => void }) {
  const t = translator(locale)
  return <dialog ref={dialog} className="invitation-dialog invitation-dialog-ornate" data-lenis-prevent onClick={event => { if (event.target === event.currentTarget) dialog.current?.close() }} aria-labelledby="dialog-title">
    <button className="dialog-close" onClick={() => dialog.current?.close()} aria-label={t('Close invitation', 'ఆహ్వానం మూసివేయండి')}><X size={20}/></button>
    <img className="dialog-toran" src="/art/cover/reference-scene.webp" alt="" aria-hidden="true"/>
    <div className="dialog-inner">
      <img className="dialog-vinayaka" src="/art/cover/vinayaka-reference.webp" alt="" aria-hidden="true"/>
      <h2 id="dialog-title">{wedding.tagline[locale]}</h2>
      <FamilyInvitationCopy locale={locale}/>
      <div className="dialog-date">{dateLabel(locale)}<span>{wedding.venue.name[locale]}</span></div>
      <p>{wedding.venue.address[locale]}</p>
      {wedding.events.map(event => <p key={event.id}><strong>{event.title[locale]}</strong><br/>{event.description[locale]}</p>)}
      <a className="button button-dark" href="#the-details" onClick={() => dialog.current?.close()}>{t('Venue & directions', 'వేదిక వివరాలు')}<ArrowRight size={16}/></a>
      <button className="text-button" onClick={onShare}><Share2 size={14}/>{t('Share the joy', 'ఆనందాన్ని పంచండి')}</button>
    </div>
  </dialog>
}
export function ShareDialog({ locale, dialog, onCopy }: { locale: Locale; dialog: RefObject<HTMLDialogElement | null>; onCopy: () => void }) {
  const t = translator(locale)
  const input = useRef<HTMLInputElement>(null)
  return <dialog ref={dialog} className="share-dialog" data-lenis-prevent aria-labelledby="share-title"><button className="dialog-close" onClick={() => dialog.current?.close()} aria-label={t('Close sharing', 'మూసివేయండి')}><X/></button><Lotus/><h2 id="share-title">{t('Pass a little', 'కొంత ఆనందం')}<br/><em>{t('happiness along.', 'పంచుకోండి.')}</em></h2><p>{t('An invitation is lovelier when it reaches the people we love.', 'మన ఆత్మీయులకు చేరినప్పుడే ఆహ్వానం మరింత అందంగా ఉంటుంది.')}</p><div className="share-actions"><a className="button button-dark" href={whatsappUrl()} target="_blank" rel="noopener noreferrer"><MessageCircle size={17}/>WhatsApp<ArrowRight size={16}/></a><button className="button button-outline" onClick={onCopy}><Copy size={16}/>{t('Copy invitation link', 'ఆహ్వాన లింక్ కాపీ చేయండి')}</button></div><label className="share-link-label">{t('Or select and copy the link', 'లేదా లింక్‌ను ఎంచుకుని కాపీ చేయండి')}<input ref={input} aria-label={t('Invitation link', 'ఆహ్వాన లింక్')} readOnly value={invitationUrl()} onFocus={event => event.currentTarget.select()}/></label><small>{t('Shared links contain no guest details.', 'పంచుకునే లింక్‌లో అతిథుల వివరాలు ఉండవు.')}</small></dialog>
}
