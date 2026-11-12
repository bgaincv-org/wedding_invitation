import { useId } from 'react'
export function Lotus({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 90 62" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="1.2"><path d="M45 50C22 34 35 16 45 5c10 11 23 29 0 45Z"/><path d="M45 50C17 51 12 28 13 16c16 3 30 12 32 34ZM45 50c28 1 33-22 32-34-16 3-30 12-32 34Z"/><path d="M45 50C17 64 4 42 3 31c16-2 30 4 42 19ZM45 50c28 14 41-8 42-19-16-2-30 4-42 19Z"/><path d="M20 58h50M45 50v8"/></g></svg>
}

export function Sun({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 100 100" fill="none" aria-hidden="true"><circle cx="50" cy="50" r="26" stroke="currentColor" strokeWidth=".8"/><circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth=".5"/>{Array.from({ length: 24 }, (_, i) => <path key={i} d="M50 6v12M47 11l3-5 3 5" transform={`rotate(${i * 15} 50 50)`} stroke="currentColor" strokeWidth=".8"/>)}</svg>
}

export function Monogram({ className = '' }: { className?: string }) {
  return <span className={`monogram ${className}`} aria-label="Sai Sathvik and Harika"><span>S</span><i>&</i><span>H</span></span>
}

export function Muggu({ className = '', preserveAspectRatio = 'xMidYMid meet' }: { className?: string; preserveAspectRatio?: string }) {
  return <svg className={`muggu ${className}`} viewBox="0 0 300 300" preserveAspectRatio={preserveAspectRatio} fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth="1">{Array.from({ length: 8 }, (_, i) => <g key={i} transform={`rotate(${i * 45} 150 150)`}><path d="M150 12C102 68 198 100 150 150C102 100 198 68 150 12Z"/><path d="M150 42c-23 35 23 63 0 88"/><path d="m150 10-9 15 9 14 9-14Z"/></g>)}<circle cx="150" cy="150" r="32"/><circle cx="150" cy="150" r="26"/>{Array.from({ length: 16 }, (_, i) => <circle key={i} cx={150 + Math.cos(i * Math.PI / 8) * 109} cy={150 + Math.sin(i * Math.PI / 8) * 109} r="2" fill="currentColor"/>)}</g></svg>
}

export function Deepam({ className = '' }: { className?: string }) {
  const gradientId = useId()
  return <svg className={`deepam ${className}`} viewBox="0 0 120 180" fill="none" aria-hidden="true"><defs><linearGradient id={gradientId} x1="30" y1="0" x2="90" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="#795528"/><stop offset=".45" stopColor="#d4b572"/><stop offset=".65" stopColor="#f0d797"/><stop offset="1" stopColor="#8c6835"/></linearGradient></defs><g fill={`url(#${gradientId})`} stroke="#a6874c" strokeWidth=".7"><path d="M20 153h80l-6 9H26Z"/><path d="M37 143q23-13 46 0l10 10H27Z"/><path d="M55 72h10l-2 61 13 11H44l13-11Z"/><ellipse cx="60" cy="74" rx="20" ry="6"/><path d="M14 52q46 24 92 0c-5 19-20 25-46 25S19 71 14 52Z"/><ellipse cx="60" cy="52" rx="46" ry="7"/><path d="M54 47h12l-6-14Z"/></g><path className="lamp-flame" d="M60 6c-2 12-13 17-11 28 2 10 17 11 21 1 4-10-7-18-10-29Z" fill="#e8b65a"/><path d="M60 22c-1 8-6 11-5 16s10 5 10-1-4-8-5-15Z" fill="#fff4c9"/></svg>
}

export function Garland({ className = '' }: { className?: string }) {
  return <svg className={`garland ${className}`} viewBox="0 0 1200 170" fill="none" preserveAspectRatio="xMidYMin slice" aria-hidden="true"><path d="M-20 10Q150 215 300 10Q450 215 600 10Q750 215 900 10Q1050 215 1220 10" stroke="#9e8d54" strokeWidth="2"/>{Array.from({ length: 81 }, (_, i) => { const x = i * 15, local = (x % 300) / 300, y = 10 + 410 * local * (1 - local); return <g key={i} transform={`translate(${x} ${y}) rotate(${(local - .5) * 90})`}><ellipse rx="8" ry="5" fill={i % 7 === 0 ? '#c58c36' : '#ece5cd'} stroke="#c8bb90" strokeWidth=".5"/><ellipse cy="7" rx="7" ry="5" fill={i % 7 === 0 ? '#d9a448' : '#f7f0da'} stroke="#d2c4a0" strokeWidth=".5"/>{i % 5 === 0 && <path d="M0 13Q-17 29-1 48Q13 32 0 13Z" fill="#64704a"/>}</g>})}</svg>
}

export function BotanicalSprig({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 130 220" fill="none" aria-hidden="true"><path d="M62 215Q40 145 78 33" stroke="currentColor" strokeWidth="1.2"/>{[0,1,2,3,4].map(i => <g key={i} transform={`translate(${64-i*2} ${50+i*31}) rotate(${i*7})`}><path d="M0 0C-38-34-47-19-34-4-22 10-9 5 0 0ZM1 0c28-41 44-30 36-12C29 5 12 6 1 0Z" fill="currentColor" opacity=".32" stroke="currentColor" strokeWidth=".7"/></g>)}<g fill="#e8dfc9" stroke="currentColor" strokeWidth=".7"><circle cx="78" cy="25" r="8"/><circle cx="68" cy="31" r="6"/><circle cx="88" cy="32" r="6"/><circle cx="78" cy="37" r="6"/></g></svg>
}
