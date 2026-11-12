import './SahaSignature.css'

/** The couple's original PDF artwork, kept together as one quiet signature. */
export function SahaSignature({ className = '', label = 'SaHa — Sai Sathvik and Harika' }: { className?: string; label?: string }) {
  return <div className={`saha-signature ${className}`} role="img" aria-label={label}>
    <img className="saha-signature-seal" src="/art/branding/saha-wax-seal.webp" alt="" width="388" height="407" decoding="async"/>
    <img className="saha-signature-wordmark" src="/art/branding/saha-wordmark.svg" alt="" width="107" height="48" decoding="async"/>
  </div>
}
