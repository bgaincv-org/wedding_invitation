import { useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { z } from 'zod'
import type { RsvpInput } from '@shared/rsvp'
import { saveRsvp, ApiError } from '@/services/rsvp'
import { ArrowUpRight, Check, LoaderCircle } from 'lucide-react'
import { wedding } from '@shared/wedding'
import type { Locale } from '@shared/wedding'
import { rsvpSchema } from '@shared/rsvp'
import { Lotus } from '@/Components/Decorations/Ornaments'

export default function ConnectedRsvp({ locale }: { locale: Locale }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { mutations: { retry: false } } }))
  return <QueryClientProvider client={client}><RsvpForm locale={locale}/></QueryClientProvider>
}

export function RsvpForm({ locale }: { locale: Locale }) {
  const t = (en: string, te: string) => locale === 'te' ? te : en
  const { register, control, handleSubmit, reset, setValue, formState: { errors } } = useForm<z.input<typeof rsvpSchema>, unknown, RsvpInput>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: { name: '', email: '', attendance: 'yes', guests: 1, note: '', website: '', eventIds: [], requestId: crypto.randomUUID() },
  })
  const attendance = useWatch({ control, name: 'attendance' })
  const mutation = useMutation({ mutationFn: saveRsvp, gcTime: 0 })
  const previousPayload = useRef('')
  const status = mutation.isSuccess ? 'success' : mutation.isPending ? 'sending' : mutation.isError ? 'error' : 'idle'
  const receipt = mutation.data?.receipt ?? ''
  const message = mutation.error instanceof ApiError && mutation.error.status === 429
    ? t('Please wait a few minutes before trying again.', 'కొన్ని నిమిషాల తర్వాత మళ్లీ ప్రయత్నించండి.')
    : t('Your reply could not be saved. Your details are still here; please try again.', 'మీ సమాధానం సేవ్ కాలేదు. మీ వివరాలు ఇక్కడే ఉన్నాయి; మళ్లీ ప్రయత్నించండి.')
  const submit = (input: RsvpInput) => {
    const fingerprint = JSON.stringify({ ...input, requestId: undefined })
    if (previousPayload.current && previousPayload.current !== fingerprint) {
      input.requestId = crypto.randomUUID()
      setValue('requestId', input.requestId)
    }
    previousPayload.current = fingerprint
    mutation.mutate(input)
  }
  if (status === 'success') return <div className="rsvp-success" role="status"><span className="success-icon"><Check size={24}/></span><Lotus/><h3>{t('Your reply is safely with us.', 'మీ సమాధానం అందింది.')}</h3><p>{attendance === 'no' ? t('Thank you for letting us know. Your warm wishes mean so much.', 'తెలియజేసినందుకు ధన్యవాదాలు. మీ ఆశీస్సులు మాకు ఎంతో విలువైనవి.') : t('Thank you for being part of our beginning. Final celebration details will be shared here.', 'మా ఆనందంలో భాగమైనందుకు ధన్యవాదాలు. పూర్తి వేడుక వివరాలు ఇక్కడ పంచుకుంటాము.')}</p><small>{t('Your reference', 'మీ రిఫరెన్స్')}: {receipt}</small><button className="text-button" onClick={() => { mutation.reset(); previousPayload.current = ''; reset({ name: '', email: '', attendance: 'yes', guests: 1, note: '', website: '', eventIds: [], requestId: crypto.randomUUID() }) }}>{t('Send another reply', 'మరో సమాధానం పంపండి')} <ArrowUpRight size={16}/></button></div>
  return <form className="rsvp-form" onSubmit={event => { void handleSubmit(submit)(event) }}>
    <div className="form-row"><label>{t('Your name', 'మీ పేరు')}<input {...register('name')} aria-invalid={!!errors.name} placeholder={t('First & last name', 'పూర్తి పేరు')} autoComplete="name" minLength={2} maxLength={100} required /></label><label>{t('Email address', 'ఇమెయిల్ చిరునామా')}<input type="email" {...register('email')} aria-invalid={!!errors.email} placeholder="you@example.com" autoComplete="email" maxLength={254} required /></label></div>
    <fieldset><legend>{t('Will you be joining us?', 'మీరు వస్తున్నారా?')}</legend><div className="attendance-options">{[['yes', t('Joyfully accept', 'తప్పక వస్తాము')], ['maybe', t('Yet to decide', 'ఇంకా నిర్ణయించలేదు')], ['no', t('Sending love', 'శుభాకాంక్షలతో')]].map(([value, label]) => <label key={value} className={attendance === value ? 'selected' : ''}><input type="radio" {...register('attendance')} value={value} /><span>{label}</span>{attendance === value && <Check size={13}/>}</label>)}</div></fieldset>
    <div className="form-row note-row">{attendance !== 'no' && <label>{t('Guests, including you', 'మీతో సహా అతిథులు')}<select {...register('guests', { valueAsNumber: true })}>{Array.from({ length: wedding.maxGuests }, (_, i) => <option key={i} value={i + 1}>{i + 1} {t(i ? 'guests' : 'guest', 'మంది')}</option>)}</select></label>}<label className="note-label">{t('A little note (optional)', 'మీ సందేశం (ఐచ్ఛికం)')}<textarea {...register('note')} aria-invalid={!!errors.note} placeholder={t('A wish for the happy couple…', 'వధూవరులకు మీ శుభాకాంక్షలు…')} maxLength={500} rows={2}/></label></div>
    {wedding.rsvpEvents && attendance !== 'no' && <fieldset className="event-options"><legend>{t('Which celebrations will you join?', 'ఏ వేడుకలకు వస్తారు?')}</legend>{wedding.events.filter(event => event.public !== false && event.status === 'confirmed').map(event => <label key={event.id}><input type="checkbox" value={event.id} {...register('eventIds')}/>{event.title[locale]}</label>)}</fieldset>}
    {Object.keys(errors).length > 0 && <p className="form-error" role="alert">{t('Please check your details and consent before sending.', 'దయచేసి వివరాలు, సమ్మతిని సరిచూసుకోండి.')}</p>}
    <div className="honeypot" aria-hidden="true"><label>Leave blank<input {...register('website')} tabIndex={-1} autoComplete="off" /></label></div>
    <label className="consent"><input type="checkbox" {...register('consent')} aria-invalid={!!errors.consent} required/><span>{t('I agree to share these details with the couple for wedding planning.', 'వివాహ ఏర్పాట్ల కోసం ఈ వివరాలను వధూవరులతో పంచుకోవడానికి అంగీకరిస్తున్నాను.')}</span></label>
    <p className="privacy-note">{t('Your reply is private. Your email is used only to coordinate the celebrations. Contact the family to request a correction or deletion.', 'మీ సమాధానం వ్యక్తిగతం. మీ ఇమెయిల్ వేడుక ఏర్పాట్ల కోసమే. వివరాలు మార్చడానికి లేదా తొలగించడానికి కుటుంబాన్ని సంప్రదించండి.')}</p>
    {status === 'error' && <p className="form-error" role="alert">{message}</p>}
    <button type="submit" className="button button-dark submit-button" disabled={status === 'sending'}>{status === 'sending' ? <><LoaderCircle className="spin" size={16}/>{t('Sending your reply…', 'పంపుతున్నాము…')}</> : <>{t('Send with love', 'ప్రేమతో పంపండి')}<ArrowUpRight size={17}/></>}</button>
  </form>
}
