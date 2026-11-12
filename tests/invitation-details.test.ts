import test from 'node:test'
import assert from 'node:assert/strict'
import { wedding } from '../shared/wedding'
import { buildCalendar } from '../src/lib/calendar'

test('the overnight schedule stays chronological across the IST calendar boundary', () => {
  const [reception, muhurtham] = wedding.events
  assert.equal(wedding.events.length, 2)
  assert.equal(new Date(reception.startsAt!).toISOString(), '2026-12-19T13:30:00.000Z')
  assert.equal(new Date(muhurtham.startsAt!).toISOString(), '2026-12-19T22:10:00.000Z')
  assert.equal(Date.parse(muhurtham.startsAt!) - Date.parse(reception.startsAt!), 8 * 3600000 + 40 * 60000)
  assert.equal(wedding.countdownTo, muhurtham.startsAt)
  assert.equal(wedding.countdownTentative, false)
})

test('both calendar downloads preserve confirmed times, venue and maps without invented end times', () => {
  for (const [i, event] of wedding.events.entries()) {
    const file = buildCalendar(event)
    const unfolded = file.replace(/\r\n /g, '')
    assert.match(unfolded, i === 0 ? /DTSTART:20261219T133000Z/ : /DTSTART:20261219T221000Z/)
    assert.doesNotMatch(unfolded, /DTEND:|DURATION:/)
    assert.ok(unfolded.includes('Sai Sathvik & Harika'))
    assert.ok(unfolded.includes('The Environ Convention'))
    assert.ok(unfolded.includes('Exit 15 ORR'))
    assert.ok(unfolded.includes(`URL:${wedding.venue.mapsUrl}`))
    assert.ok(unfolded.includes('STATUS:CONFIRMED'))
    assert.equal(event.mapsUrl, wedding.venue.mapsUrl)
    for (const line of file.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75)
  }
})

test('calendar rejects malformed dates and backwards end times', () => {
  const event = wedding.events[0]
  for (const change of [{ startsAt: 'invalid' }, { endsAt: 'invalid' }, { endsAt: '2026-12-18T19:00:00+05:30' }]) {
    assert.throws(() => buildCalendar({ ...event, ...change }))
  }
})
