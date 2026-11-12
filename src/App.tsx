import { Check } from 'lucide-react'
import { Home } from '@/Pages/Home/Home'
import { OpenInvitation } from '@/Pages/OpenInvitation/OpenInvitation'
import { WeddingFooter } from '@/Components/Layout/WeddingFooter'
import { WeddingSong } from '@/Components/Audio/WeddingSong'
import { InvitationDialog, ShareDialog } from '@/Components/Dialogs/InvitationDialog'
import { useWeddingInvitation } from '@/hooks/useWeddingInvitation'
import { useExperience } from '@/Pages/Home/hooks/useExperience'
import { translator } from '@/lib/content'
import '@/styles/invitation.css'
import '@/styles/scenes.css'
import '@/styles/responsive.css'

// Temporarily disable the song UI and playback; set to true to restore both.
const weddingSongEnabled = false

function App() {
  const invitation = useWeddingInvitation()
  const { locale, entered, revealed, decorationsPaused, music, dialog, shareDialog, toast } = invitation
  const root = useExperience(locale, revealed)
  const t = translator(locale)
  return <div className={`experience locale-${locale}${revealed ? ' is-entered' : ''}`} ref={root}>
    <OpenInvitation locale={locale} onPrepare={invitation.prepareInvitation} onEnter={invitation.enterInvitation} onRevealed={invitation.revealInvitation}/>
    <div className="reading-progress" aria-hidden="true"/>
    <a className="skip-link" href="#main">{t('Skip to invitation', 'ఆహ్వానానికి వెళ్లండి')}</a>
    <Home locale={locale} entered={entered} revealed={revealed} decorationsPaused={decorationsPaused}
      onCalendar={invitation.calendar} onOpenInvitation={() => dialog.current?.showModal()} onShare={() => void invitation.share()}/>
    <WeddingFooter locale={locale} entered={entered} onShare={() => void invitation.share()}/>
    {weddingSongEnabled && <WeddingSong locale={locale} musicRef={music} visible={revealed}/>}
    {toast && <div className="toast" role="status"><Check size={17}/>{toast}</div>}
    <InvitationDialog locale={locale} dialog={dialog} onShare={() => void invitation.share()}/>
    <ShareDialog locale={locale} dialog={shareDialog} onCopy={() => void invitation.copy()}/>
  </div>
}

export default App
