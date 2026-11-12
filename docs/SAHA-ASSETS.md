# SaHa artwork

The invitation uses the original identity artwork supplied by the couple:

- **Opening cover:** the gold wax seal and maroon SaHa wordmark sit together beneath the invitation button and enter with its existing reveal.
- **Couple heading:** the same compact signature sits between the divider lines. `SahaSignature` shares the original assets and accessible description between these placements.
- **Gallery heading:** the standalone SaHa lettering from `Stamp2.pdf`, page 1. The original vector paths are preserved, with the ink changed to the gallery's maroon `#8e2945`.
- **Closing blessings:** the gold wax seal at the bottom of the left invitation in `Slides (1).pdf`, page 1. The embedded image and its transparency mask are extracted directly, preserving the original monogram, hearts and gold texture. It replaces the small lotus divider above the closing message.
- **Browser and home-screen icons:** the four original monogram/heart paths above the wordmark in `Stamp2.pdf` are extracted as SVG and set in gold on the site's maroon. These generate the SVG/32px favicon, 180px Apple icon, and 192/512px manifest icons.

Placements stay compact and scale down on phones. The signature is noninteractive;
the existing gallery and blessings artwork retains its scroll reveal. The manifest
provides identity for home-screen bookmarks and keeps browser navigation; it does
not add a service worker or an offline cache.

## Source assets

- `asset-sources/branding/saha-wordmark-original.svg`
- `asset-sources/branding/saha-monogram-original.svg`
- `asset-sources/branding/saha-wax-seal-original.png`

## Website assets

- `public/art/branding/saha-wordmark.svg`
- `public/art/branding/saha-wax-seal.webp` (lossless, transparent)
- `public/art/branding/saha-monogram.svg`
- `public/favicon.svg`, `public/favicon-32.png`, `public/apple-touch-icon.png`
- `public/art/branding/saha-icon-192.png`, `public/art/branding/saha-icon-512.png`
- `public/site.webmanifest`

To regenerate from the supplied PDFs, with PyMuPDF installed:

```powershell
python scripts/prepare-saha-art.py 'path/to/Stamp2.pdf' 'path/to/Slides (1).pdf'
node scripts/prepare-saha-art.mjs
```

Only the requested identity artwork is used. The PDFs' printed dates, venue details, example photographs and other reference designs do not replace the website's event content.
