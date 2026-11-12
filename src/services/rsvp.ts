import type { RsvpInput } from '@shared/rsvp'

export class ApiError extends Error {
  readonly status: number
  constructor(status: number) { super('Unable to save your reply'); this.status = status }
}

/** Both the Node/Mongo service and the hosted D1 adapter implement this contract. */
export async function saveRsvp(input: RsvpInput): Promise<{ saved: true; receipt: string }> {
  const response = await fetch('/api/v1/rsvp', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input), signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) throw new ApiError(response.status)
  const result: unknown = await response.json()
  if (!result || typeof result !== 'object' || !('saved' in result) || result.saved !== true || !('receipt' in result) || typeof result.receipt !== 'string') throw new ApiError(502)
  return { saved: true, receipt: result.receipt }
}
