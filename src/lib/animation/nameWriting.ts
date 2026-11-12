import gsap from 'gsap'

// Keep the names and their surrounding reveals in sync at a brisker pace.
export const NAME_REVEAL_SPEED = 1.35

const strokeLengths = new WeakMap<SVGPathElement, number>()
// A pen slows into curves without coming to a hard stop at every small stroke.
const penEase = (progress: number) => .35 * progress + .65 * (1 - Math.cos(Math.PI * progress)) / 2

/** Animate a pen along curved centreline masks, preserving the filled calligraphy. */
export function writeName(timeline: gsap.core.Timeline, element: HTMLElement, start: number, duration: number) {
  const ink = element.querySelector<HTMLElement>('.writing-ink')!
  const strokes = [...element.querySelectorAll<SVGPathElement>('.pen-stroke')]
  gsap.set(ink, { opacity: 0 })
  timeline.set(element, { attr: { 'data-writing-state': 'writing' } }, start)
  if (!strokes.length) {
    // Untraced scripts keep native shaping and a gentle whole-name entrance.
    timeline.fromTo(ink, { opacity: 0 }, { opacity: 1, duration: Math.min(duration, .9), ease: 'sine.inOut' }, start)
      .set(element, { attr: { 'data-writing-state': 'complete' } }, start + Math.min(duration, .9))
    return
  }
  const paths = strokes.map(path => {
    const length = strokeLengths.get(path) ?? path.getTotalLength()
    strokeLengths.set(path, length)
    gsap.set(path, { strokeDasharray: `${length + 2} ${length + 2}`, strokeDashoffset: length + 2, opacity: 0 })
    return { path, weight: Math.pow(length, .8) }
  })
  const total = paths.reduce((sum, path) => sum + path.weight, 0)
  const lift = .006
  const drawingTime = duration - lift * (paths.length - 1)
  const minimum = Math.min(.04, drawingTime / paths.length * .25)
  const flowingTime = drawingTime - minimum * paths.length
  timeline.set(ink, { opacity: 1 }, start)
  let time = start
  for (const { path, weight } of paths) {
    const strokeDuration = minimum + flowingTime * weight / total
    timeline.set(path, { opacity: 1 }, time)
      .to(path, { strokeDashoffset: 0, duration: strokeDuration, ease: penEase }, time)
    time += strokeDuration + lift
  }
  timeline.set(element, { attr: { 'data-writing-state': 'complete' } }, start + duration)
}

/** Both names share the same clock, start and finish, regardless of stroke count. */
export function writeNames(timeline: gsap.core.Timeline, elements: Iterable<HTMLElement>, start: number, duration: number) {
  for (const element of elements) writeName(timeline, element, start, duration)
}

/** Ensure interrupted timelines always leave complete, readable names. */
export function finishNameWriting(root: Element | null) {
  root?.querySelectorAll<HTMLElement>('[data-writing-name]').forEach(element => {
    element.querySelector<HTMLElement>('.writing-ink')!.style.removeProperty('opacity')
    element.removeAttribute('data-writing-state')
  })
}
