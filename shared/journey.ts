import { wedding } from './wedding'
import type { Localized, WeddingEvent } from './wedding'

export type WeddingMoment = {
  id: string
  title: Localized
  subtitle: Localized
  description: Localized
  artwork: string
  event?: WeddingEvent
}

/** Seven requested celebrations; only the two supplied invitations carry clock times. */
export const weddingJourney: WeddingMoment[] = [
  {
    id: 'mehendi', title: { en: 'Mehendi', te: 'మెహందీ' },
    subtitle: { en: 'A little colour, a lot of love', te: 'ప్రేమకు రంగుల వేడుక' },
    description: { en: 'Henna, laughter and lovely beginnings with our closest ones.', te: 'గోరింటాకు రంగులతో, ఆత్మీయుల నవ్వులతో అందమైన ఆరంభం.' },
    artwork: '/art/journey/ceremonies/mehendi.webp',
  },
  {
    id: 'pellikoduku', title: { en: 'Pellikoduku & Pellikuthuru', te: 'పెళ్లికొడుకు & పెళ్లికూతురు' },
    subtitle: { en: 'Wrapped in golden blessings', te: 'పసుపు పచ్చని ఆశీస్సులు' },
    description: { en: 'Turmeric, flowers and the warmth of our families’ blessings.', te: 'పసుపు, పూలు, కుటుంబ సభ్యుల ఆత్మీయ ఆశీస్సులతో.' },
    artwork: '/art/journey/ceremonies/pellikoduku.webp',
  },
  {
    id: 'reception', title: { en: 'The Reception', te: 'రిసెప్షన్' },
    subtitle: { en: 'An evening to remember', te: 'మధుర జ్ఞాపకాల సాయంత్రం' },
    description: { en: 'An evening of warm welcomes, shared smiles and celebration.', te: 'ఆత్మీయ స్వాగతాలు, చిరునవ్వులతో ఆనందాల వేడుక.' },
    artwork: '/art/journey/ceremonies/reception.webp', event: wedding.events.find(event => event.id === 'reception'),
  },
  {
    id: 'ganesh-puja', title: { en: 'Ganesh Puja', te: 'గణపతి పూజ' },
    subtitle: { en: 'An auspicious beginning', te: 'శుభారంభానికి తొలి పూజ' },
    description: { en: 'Seeking Lord Ganesha’s blessings for the journey ahead.', te: 'నూతన జీవన ప్రయాణానికి గణపతి ఆశీస్సులు కోరుతూ.' },
    artwork: '/art/journey/ceremonies/ganesh-puja.webp',
  },
  {
    id: 'kanyadanam', title: { en: 'Kanyadanam', te: 'కన్యాదానం' },
    subtitle: { en: 'Two families, one promise', te: 'రెండు కుటుంబాలు, ఒక బంధం' },
    description: { en: 'A sacred family moment, filled with love and blessings.', te: 'ప్రేమ, ఆశీస్సులతో నిండిన పవిత్రమైన కుటుంబ ఘట్టం.' },
    artwork: '/art/journey/ceremonies/kanyadanam.webp',
  },
  {
    id: 'wedding', title: { en: 'Wedding Muhurtham', te: 'వివాహ సుముహూర్తం' },
    subtitle: { en: 'The moment forever begins', te: 'శాశ్వత బంధానికి శుభ క్షణం' },
    description: { en: 'Jeelakarra Bellam marks our auspicious beginning together.', te: 'జీలకర్ర బెల్లంతో మా దాంపత్య జీవితానికి శుభారంభం.' },
    artwork: '/art/journey/ceremonies/muhurtham.webp', event: wedding.events.find(event => event.id === 'wedding'),
  },
  {
    id: 'mangalya-dharanam', title: { en: 'Mangalya Dharanam', te: 'మాంగల్య ధారణం' },
    subtitle: { en: 'A sacred bond, a lifetime of love', te: 'పవిత్ర బంధం, జీవితాంతం తోడు' },
    description: { en: 'The sacred mangalyam joins our lives in love and commitment.', te: 'మాంగల్య బంధంతో మా జీవితాలు ఒక్కటయ్యే శుభవేళ.' },
    artwork: '/art/journey/ceremonies/mangalya-dharanam.webp',
  },
]