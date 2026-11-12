import type { Locale, WeddingEvent } from '@shared/wedding'
import { wedding } from '@shared/wedding'
import { WeddingJourney } from './Components/Journey/WeddingJourney'
import { CoupleHero } from './Components/Couple/CoupleHero'
import { Countdown } from './Components/Countdown/Countdown'
import { InvitationLetter } from './Components/Invitation/InvitationLetter'
import { GuestDetails } from './Components/Details/GuestDetails'
import { MemoryGallery } from './Components/Gallery/MemoryGallery'
import { DivineBlessings } from './Components/Blessings/DivineBlessings'

type HomeProps = {
  locale: Locale
  entered: boolean
  revealed: boolean
  decorationsPaused: boolean
  onCalendar: (event: WeddingEvent) => void
  onOpenInvitation: () => void
  onShare: () => void
}

/** The full invitation, prepared behind the opening interaction. */
export function Home({ locale, entered, revealed, decorationsPaused, onCalendar, onShare }: HomeProps) {
  return <main id="main">
    <div className="invitation-chapter" data-chapter="01" data-anchor="home">
      <CoupleHero locale={locale} artReady={entered} active={revealed} paused={decorationsPaused}/>
      {entered && <>
        <Countdown locale={locale} active={revealed} paused={decorationsPaused}/>
        <InvitationLetter locale={locale} onShare={onShare}/>
        <WeddingJourney locale={locale} active={revealed} paused={decorationsPaused} onCalendar={onCalendar}/>
        <GuestDetails locale={locale} onCalendar={onCalendar} paused={decorationsPaused}/>
        <MemoryGallery locale={locale} photos={wedding.gallery} video={wedding.video} paused={decorationsPaused}/>
        <DivineBlessings locale={locale}/>
      </>}
    </div>
  </main>
}
