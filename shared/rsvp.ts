import { z } from 'zod'
import { wedding } from './wedding'

export const rsvpSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254).transform(value => value.toLowerCase().trim()),
  attendance: z.enum(['yes', 'no', 'maybe']),
  guests: z.number().int().min(1).max(wedding.maxGuests),
  note: z.string().trim().max(500).default(''),
  consent: z.literal(true),
  website: z.string().max(0).default(''),
  requestId: z.uuid(),
  eventIds: z.array(z.string().refine(id => wedding.events.some(event => event.id === id && event.public !== false))).max(10).default([]),
}).strict()
export type RsvpInput = z.infer<typeof rsvpSchema>
