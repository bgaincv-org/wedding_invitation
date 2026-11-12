/** Wall-clock countdown: explicit offset in the target, never an accumulating decrement. */
export function countdownParts(target: number, now: number) {
  if (!Number.isFinite(target) || !Number.isFinite(now)) return null
  const seconds = Math.max(0, Math.ceil((target - now) / 1000))
  return {
    arrived: seconds === 0,
    values: [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60],
  }
}
