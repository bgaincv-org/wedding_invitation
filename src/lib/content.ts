import type { Locale } from '@shared/wedding'
import { wedding } from '@shared/wedding'

export const translator = (locale: Locale) => (english: string, telugu: string) => locale === 'te' ? telugu : english
export const WELCOME_SESSION_KEY = 'wedding-welcome-seen-v8'
export function shouldShowWelcome() {
  // Section links remain usable, but a reload always returns to the cover.
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  return !location.hash || navigation?.type === 'reload'
}
export function shouldPlayWelcomeIntro() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  // Remember only the cloth intro, never whether the cover may be shown.
  try { return sessionStorage.getItem(WELCOME_SESSION_KEY) !== 'yes' } catch { return true }
}
export function dateLabel(locale: Locale) {
  return wedding.celebrationDates[locale]
}
export function eventDateLabel(timestamp: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'te' ? 'te-IN' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: wedding.timezone }).format(new Date(timestamp))
}
export function eventTimeLabel(timestamp: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'te' ? 'te-IN' : 'en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: wedding.timezone }).format(new Date(timestamp)) + ' IST'
}
export const invitationTitle = `SaHa — ${wedding.couple.first.en} & ${wedding.couple.second.en}`
export const invitationSummary = `${invitationTitle}. ${wedding.tagline.en}. ${wedding.events.map(event => `${event.title.en}: ${event.description.en}`).join(' ')} ${wedding.venue.name.en}, ${wedding.venue.address.en}.`
/** Shared links deliberately omit query strings: a greeting is not authentication. */
export const invitationUrl = () => `${location.origin}${location.pathname}`
export function whatsappUrl() {
  const text = `${invitationSummary} ${invitationUrl()}`
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
export function safeMediaUrl(value: string | null | undefined) {
  if (!value || value.includes('\\')) return undefined
  if (value.startsWith('/') && !value.startsWith('//')) return value
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined } catch { return undefined }
}
