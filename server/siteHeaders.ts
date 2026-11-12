import { wedding } from '../shared/wedding'
import { securityHeaders } from './api'
const origins = (values: (string | null | undefined)[]) => [...new Set(values.flatMap(value => {
  try { const url = new URL(value ?? ''); return url.protocol === 'https:' && !url.username && !url.password ? [url.origin] : [] } catch { return [] }
}))].join(' ')
const images = origins([...wedding.gallery.map(item => item.src), wedding.families.first.portrait?.src, wedding.families.second.portrait?.src, wedding.video?.poster])
const videos = origins([wedding.video?.src])
/** Keep local production checks and the deployed Worker on the same policy. */
export const siteHeaders = {
  ...securityHeaders,
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), autoplay=(self)',
  'Content-Security-Policy': `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: ${images}; font-src 'self'; connect-src 'self'; media-src 'self' blob: ${videos}; frame-src https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'`,
}
