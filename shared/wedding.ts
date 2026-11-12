export type Locale = 'en' | 'te'
export type Localized = { en: string; te: string }
export type WeddingMedia = { src: string; alt: Localized; caption: Localized; kind: 'photo' | 'illustration' }
export type FamilyMember = { parents: Localized | null; grandparents: Localized | null; portrait: { src: string; alt: Localized } | null; message: Localized | null }
export type WeddingEvent = {
  id: string
  title: Localized
  subtitle: Localized
  description: Localized
  status: 'planned' | 'confirmed'
  startsAt: string | null
  endsAt: string | null
  location: string | null
  mapsUrl?: string | null
  timingNote?: Localized
  hospitality?: Localized
  dressCode?: Localized | null
  public?: boolean
}

const venue = {
  name: { en: 'The Environ Convention', te: 'The Environ Convention' },
  address: {
    en: 'Exit 15 ORR, 65, Mansanpalle Village, Maheshwaram Mandal, near Shamshabad, Hyderabad, Telangana',
    te: 'ఓఆర్ఆర్ ఎగ్జిట్ 15, 65, మంసాన్‌పల్లి గ్రామం, మహేశ్వరం మండలం, శంషాబాద్ సమీపంలో, హైదరాబాద్, తెలంగాణ',
  },
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=The%20Environ%20Convention%2C%2065%2C%20Mansanpalle%20Village%2C%20Maheshwaram%20Mandal%2C%20Hyderabad%2C%20Telangana',
  mapsEmbedUrl: 'https://www.google.com/maps?q=The%20Environ%20Convention%2C%2065%2C%20Mansanpalle%20Village%2C%20Maheshwaram%20Mandal%2C%20Hyderabad%2C%20Telangana&output=embed&z=14',
}
const receptionAt = '2026-12-19T19:00:00+05:30'
const muhurthamAt = '2026-12-20T03:40:00+05:30'

/** Confirmed by the family in Slides (1).pdf and the supplied invitation copy. */
export const wedding = {
  couple: {
    first: { en: 'Sai Sathvik', te: 'సాయి సాత్విక్' },
    second: { en: 'Harika', te: 'హారిక' },
  },
  formalNames: {
    first: { en: 'Chy. Sai Sathvik', te: 'చి. సాయి సాత్విక్' },
    second: { en: 'Chy. La. Sow. Harika', te: 'చి. ల. సౌ. హారిక' },
  },
  tagline: { en: 'Forever Begins', te: 'శాశ్వత బంధానికి ఆరంభం' },
  invocation: { en: 'Srirasthu · Subhamasthu · Avignamasthu', te: 'శ్రీరస్తు · శుభమస్తు · అవిఘ్నమస్తు' },
  celebrationDates: { en: '19–20 December 2026', te: '19–20 డిసెంబర్ 2026' },
  month: { en: 'December', te: 'డిసెంబర్' },
  year: 2026 as number | null,
  date: '20 December 2026' as string | null,
  muhurtham: { en: 'Sunday, 20 December 2026 · 3:40 AM IST', te: 'ఆదివారం, 20 డిసెంబర్ 2026 · తెల్లవారుజామున 3:40 IST' } as Localized | null,
  overnightNote: {
    en: 'Early Sunday morning, following Saturday’s reception.',
    te: 'శనివారం రిసెప్షన్ అనంతరం, ఆదివారం తెల్లవారుజామున.',
  },
  location: { en: 'Shamshabad, Hyderabad', te: 'శంషాబాద్, హైదరాబాద్' },
  venue,
  timezone: 'Asia/Kolkata',
  contact: null as { name: string; phone: string } | null,
  maxGuests: 6,
  families: {
    first: {
      parents: { en: 'Nalini Sudha & Nagi Reddy Jonnala', te: 'Nalini Sudha & Nagi Reddy Jonnala' },
      grandparents: null, portrait: null,
      message: { en: 'Visakhapatnam', te: 'విశాఖపట్నం' },
    } as FamilyMember,
    second: {
      parents: { en: 'Smt. Madhavi Latha & Sri. Ravi Shankar Reddy Pachipala', te: 'Smt. Madhavi Latha & Sri. Ravi Shankar Reddy Pachipala' },
      grandparents: null, portrait: null,
      message: { en: 'Hyderabad', te: 'హైదరాబాద్' },
    } as FamilyMember,
    blessing: { en: 'Smt. & Sri. (Late) J. V. Subba Reddy', te: 'Smt. & Sri. (Late) J. V. Subba Reddy' } as Localized,
  },
  blessings: [
    { en: 'Sri Mannem Ranga Rao', te: 'శ్రీ మన్నెం రంగారావు' },
    { en: 'Smt. Prameela Rani', te: 'శ్రీమతి ప్రమీలరాణి' },
  ] as Localized[],
  welcome: { en: 'Your presence fills us with joy.', te: 'మీ అందరి ఆగమనం మాకెంతో ఆనందం.' },
  compliments: { en: 'Best compliments from near and dear ones.', te: 'బంధుమిత్రుల శుభాకాంక్షలతో.' },
  story: null as Localized | null,
  personalMessage: null as Localized | null,
  gallery: [] as WeddingMedia[],
  video: null as { src: string; poster?: string; title: Localized } | null,
  countdownTo: muhurthamAt as string | null,
  countdownTentative: false,
  events: [
    {
      id: 'reception',
      title: { en: 'The Reception', te: 'రిసెప్షన్' },
      subtitle: { en: 'An evening of love & celebration', te: 'ఆత్మీయుల సమక్షంలో ఆనంద వేడుక' },
      description: { en: 'Saturday, 19 December 2026, from 7:00 PM IST onwards. Join our families for the reception, followed by dinner.', te: 'శనివారం, 19 డిసెంబర్ 2026, రాత్రి 7:00 గంటల నుండి రిసెప్షన్. అనంతరం విందు.' },
      timingNote: { en: '7:00 PM onwards', te: 'రాత్రి 7:00 గంటల నుండి' },
      hospitality: { en: 'Followed by dinner', te: 'అనంతరం విందు' },
      status: 'confirmed', startsAt: receptionAt, endsAt: null,
      location: `${venue.name.en}, ${venue.address.en}`, mapsUrl: venue.mapsUrl,
    },
    {
      id: 'wedding',
      title: { en: 'The Wedding Muhurtham', te: 'వివాహ సుముహూర్తం' },
      subtitle: { en: 'Sacred vows, a lifetime together', te: 'పవిత్ర బంధంతో నూతన జీవనం' },
      description: { en: 'Sunday, 20 December 2026, at 3:40 AM IST, in the early hours of Sunday following Saturday’s reception. The wedding is followed by breakfast.', te: 'శనివారం రిసెప్షన్ అనంతరం, ఆదివారం 20 డిసెంబర్ 2026 తెల్లవారుజామున 3:40 గంటలకు వివాహ సుముహూర్తం. అనంతరం అల్పాహారం.' },
      timingNote: { en: 'Early Sunday morning, following Saturday’s reception', te: 'శనివారం రిసెప్షన్ అనంతరం, ఆదివారం తెల్లవారుజామున' },
      hospitality: { en: 'Followed by breakfast', te: 'అనంతరం అల్పాహారం' },
      status: 'confirmed', startsAt: muhurthamAt, endsAt: null,
      location: `${venue.name.en}, ${venue.address.en}`, mapsUrl: venue.mapsUrl,
    },
  ] as WeddingEvent[],
}

export const traditions = [
  { id: 'jeelakarra', name: { en: 'Jeelakarra Bellam', te: 'జీలకర్ర బెల్లం' }, caption: { en: 'THE PROMISE', te: 'అనుబంధం' }, title: { en: 'Through the sweet.\nThrough everything.', te: 'సుఖదుఃఖాల్లో\nకలిసే ప్రయాణం.' }, description: { en: 'Cumin and jaggery come together in a simple, sacred gesture. Placed on each other’s heads at the Muhurtham, they symbolise a bond that stays together through every season of life.', te: 'సుముహూర్తంలో ఒకరి తలపై మరొకరు జీలకర్ర బెల్లం ఉంచుతారు. జీవితంలోని సుఖదుఃఖాల్లో విడదీయరాని అనుబంధానికి ఇది ప్రతీక.' } },
  { id: 'talambralu', name: { en: 'Talambralu', te: 'తలంబ్రాలు' }, caption: { en: 'THE JOY', te: 'ఆనందం' }, title: { en: 'A little golden rain.\nA lifetime of joy.', te: 'పసిడి వర్షం.\nఆనందాల హరివిల్లు.' }, description: { en: 'A shower of turmeric-tinted rice, a burst of laughter. Talambralu fills the ceremony with playfulness and wishes for a life of abundance, happiness, and shared joy.', te: 'పసుపు కలిపిన బియ్యంతో వధూవరులు ఒకరిపై మరొకరు తలంబ్రాలు పోసుకుంటారు. ఆనందం, సమృద్ధి, శుభాకాంక్షలతో నిండిన మధురమైన ఘట్టం.' } },
  { id: 'saptapadi', name: { en: 'Saptapadi', te: 'సప్తపది' }, caption: { en: 'THE JOURNEY', te: 'ప్రయాణం' }, title: { en: 'Seven steps.\nEvery tomorrow.', te: 'ఏడు అడుగులు.\nజీవితాంతం తోడు.' }, description: { en: 'In the presence of the sacred fire, seven steps mark promises of care, strength, and companionship. Small steps at the beginning of a lifelong journey, side by side.', te: 'అగ్ని సాక్షిగా వేసే ఏడు అడుగులు పరస్పర ప్రేమ, బలం, స్నేహానికి ప్రతిజ్ఞలు. జీవితాంతం ఒకరికొకరు తోడుగా ఉండే ప్రయాణానికి ఆరంభం.' } },
]
