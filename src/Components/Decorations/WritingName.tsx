import { useId } from 'react'
import { handwritingPaths } from '@/lib/animation/handwritingPaths'

/** Each glyph is exposed by an animated pen path through its actual letterform. */
export function WritingName({ children }: { children: string }) {
  const id = `pen-${useId().replace(/[^a-z0-9_-]/gi, '')}`
  const letters = Array.from(children)
  const supported = letters.every(letter => letter === ' ' || handwritingPaths[letter])
  let offset = 0
  const glyphs = supported ? letters.map(letter => {
    const glyph = letter === ' ' ? { outline: '', advance: 250, strokes: [] } : handwritingPaths[letter]
    const x = offset
    offset += glyph.advance
    return { ...glyph, x }
  }) : []
  return <span className={`writing-name${supported ? ' has-calligraphy' : ''}`} data-writing-name>
    <span className="writing-layout sr-only">{children}</span>
    {supported ? <svg className="writing-ink writing-calligraphy" viewBox={`0 0 ${offset} 1000`} width={`${offset / 1000}em`} height="1em" aria-hidden="true" focusable="false">
      {glyphs.map((glyph, index) => <g key={index} transform={`translate(${glyph.x} 0)`}>
        <defs><mask id={`${id}-${index}`} maskUnits="userSpaceOnUse" x="-150" y="-150" width={glyph.advance + 450} height="1400">
          {glyph.strokes.map((stroke, part) => <path key={part} className="pen-stroke" d={stroke.d} fill="none" stroke="white" strokeWidth={stroke.width} strokeLinecap="round" strokeLinejoin="round"/>) }
        </mask></defs>
        <path className="writing-glyph" d={glyph.outline} fill="currentColor" mask={`url(#${id}-${index})`}/>
      </g>)}
    </svg> : <span className="writing-ink writing-fallback" aria-hidden="true">{children}</span>}
  </span>
}
