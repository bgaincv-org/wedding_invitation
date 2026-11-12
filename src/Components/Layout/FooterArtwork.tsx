import './FooterArtwork.css'

/** Preserve the uploaded artwork; CSS turns the original portrait canvas upright. */
export function FooterArtwork() {
  return <div className="footer-artwork footer-artwork-reference" data-reveal aria-hidden="true">
    <img src="/art/footer/reference-lossless.webp" alt="" width="1152" height="2048" loading="lazy" decoding="async"/>
  </div>
}
