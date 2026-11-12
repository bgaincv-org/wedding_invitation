import type { WeddingEvent } from '../../shared/wedding'
import { wedding } from '../../shared/wedding'

const escape = (value: string) => value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
const stamp = (value: string | Date) => new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
// Fold at 75 UTF-8 octets, as required by RFC 5545 (including Telugu text).
function fold(line: string) {
  let result = '', bytes = 0
  for (const character of line) {
    const length = new TextEncoder().encode(character).length
    if (bytes + length > 75) { result += '\r\n '; bytes = 1 }
    result += character; bytes += length
  }
  return result
}
export function buildCalendar(event: WeddingEvent) {
  const start = Date.parse(event.startsAt ?? '')
  const end = event.endsAt ? Date.parse(event.endsAt) : null
  if (event.status !== 'confirmed' || !Number.isFinite(start) || (end !== null && (!Number.isFinite(end) || end <= start))) throw new Error('A confirmed start and a valid optional end time are required.')
  // RFC 5545 §3.6.1 permits a timed DTSTART without DTEND. Preserve the family's
  // supplied start time instead of inventing an end time for either celebration.
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SaHa//Sai Sathvik and Harika//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:${event.id}-sathvik-harika@wedding-letter`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(event.startsAt!)}`, ...(event.endsAt ? [`DTEND:${stamp(event.endsAt)}`] : []), `SUMMARY:${escape(`${wedding.couple.first.en} & ${wedding.couple.second.en} — ${event.title.en}`)}`, `DESCRIPTION:${escape(event.description.en)}`, `LOCATION:${escape(event.location ?? '')}`, ...(event.mapsUrl ? [`URL:${event.mapsUrl}`] : []), 'STATUS:CONFIRMED', 'END:VEVENT', 'END:VCALENDAR'].map(fold).join('\r\n') + '\r\n'
}
export function downloadCalendar(event: WeddingEvent) {
  const url = URL.createObjectURL(new Blob([buildCalendar(event)], { type: 'text/calendar;charset=utf-8' }))
  const link = document.createElement('a'); link.href = url; link.download = `${event.id}.ics`; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
