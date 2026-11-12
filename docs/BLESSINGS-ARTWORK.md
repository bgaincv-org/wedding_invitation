# Sri Srinivasa Kalyanam artwork

Source: the gold-framed devotional painting attached by the user in this conversation.

Edited with the built-in Imagegen tool to remove the outer picture frame. This is an AI-assisted image edit, not a pixel-identical crop. The remaining golden temple architecture belongs to the painting itself.

## Saved files

- Edited master: `asset-sources/blessings/srinivasa-kalyanam-unframed.png`
- Website: `public/art/blessings/srinivasa-kalyanam.webp`
- Mobile: `public/art/blessings/srinivasa-kalyanam-mobile.webp`
- Regenerate web exports: `node scripts/prepare-blessings-art.mjs`

The devotional heading and Telugu verse follow the existing section in `wedding_invitation_new`. The presentation matches this invitation's warm parchment background, maroon calligraphy, Cormorant Garamond body text, gold accents and lotus decorations. The complete, unframed painting is displayed at up to 840px wide. It uses Sathvik and Harika's names from this project's shared content. The reference project is unchanged.

## Final editing prompt

Use case: precise-object-edit. Edit target: the supplied devotional painting that is surrounded by a THICK ornate rectangular metallic-gold picture frame and a narrow outside white margin. If another wide, unframed painting is included, it is only a reference and must NOT be used as the edit target. Primary request: remove ONLY the outer physical gold picture frame and white margins from the attached framed Sri Venkateswara / Srinivasa Kalyanam painting. Return the complete inner rectangular painting edge-to-edge, as a clean high-resolution crop. The retained inner painting begins just inside the picture frame: retain its temple canopy, architectural gold pillars, garlands, ALL deities and sages including the leftmost and rightmost figures, the central wedding couple, and the entire sacred fire scene along the bottom. Do not confuse the gold temple architecture INSIDE the painting with the external picture frame. Preserve the original painting exactly: all identities, faces, poses, hands, jewelry, crowns, clothing, colors, religious details, and composition. No repainting, restyling, new figures, new scenery, extra text, shadows, rounded corners, border, mat, or frame. Keep the black background that belongs to the artwork. Opaque rectangular image, not a transparent cutout. Make the artwork itself fill the entire output canvas with no surrounding margin.
