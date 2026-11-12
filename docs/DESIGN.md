# A Wedding Letter

Current content and visible flow are documented in [INVITATION-DETAILS.md](INVITATION-DETAILS.md). The notes below retain the design history; proposed ceremonies and pending details have been replaced by the family's confirmed December 19–20, 2026 schedule.

Sai Sathvik and Harika's invitation takes the form of a hand-painted Telugu wedding letter. Its visual thread moves from an architectural courtyard to an intimate letter, an open celebration schedule, ritual objects, practical guest information and a reply.

The tactile wedding-letter direction connects invitation stationery to an original ceremonial world. The richer revision adds a skippable silk opening and a daylight-to-evening progression. It preserves direct guest links, native scrolling and honest pending details. See [the reference study](REFERENCES.md) for observed behavior and the blocked Dil Se demo boundary.

Warm ivory, antique gold and a restrained olive ink palette pair Cormorant Garamond with DM Sans and Noto Serif Telugu. All fonts are served locally. The artwork depicts an imagined ceremonial environment, not the actual venue. The cover's miniature procession depicts fictional ceremonial figures; no generated portrait represents the real couple.

The opening is always accessible. The invitation button reveals a native modal letter, with keyboard dismissal and focus restoration. GSAP introduces the letter and draws a golden thread as the guest scrolls. A modest, reversible parallax adds depth to the courtyard. Ritual tabs explain Jeelakarra Bellam, Talambralu and Saptapadi. The optional rice shower connects the interaction to the meaning of Talambralu. Optional synthesized chimes require an explicit gesture; audio is not presented as a traditional composition.

Reduced-motion mode removes parallax, scroll smoothing, revealing transitions and decorative movement. The mobile composition reframes the courtyard around its mandap; it is intentionally cropped to retain clear text. The desktop layout becomes a single-column letter on narrow phones. English and Telugu are independently typeset.

## Cultural research

- [George Town Heritage Celebrations booklet, Telugu Association of Malaysia contribution, pp. 28–29](https://gtwhi.com.my/wp-content/uploads/2019/03/GTHC-2019_Booklet.pdf): Jeelakarra Bellam and the symbolism of an enduring bond.
- [Siddhivinaayak Telugu ceremony worksheet](https://siddhivinaayak.org/weedingpattern/telagu_wedding.pdf): practitioner reference for preparations, Muhurtham, Talambralu and Saptapadi. Its sample timings are not used.
- [WeddingWire Telugu ceremony guide](https://www.weddingwire.in/wedding-tips/telugu-marriage--c4539): supporting reference for engagement and turmeric preparations.
- [GSAP matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/) and [GSAP React](https://gsap.com/resources/React/): scoped animation cleanup and reduced-motion handling.

The editorial ritual descriptions are educational, not the couple's confirmed ceremony order. Optional preparations and the gathering are explicitly proposed. Saptapadi is described as seven steps in the presence of the sacred fire, without assuming seven full circuits. Final ceremony wording, Telugu name transliterations, participating rituals and Muhurtham should be reviewed by the family and priest.

## Original artwork

Generated with the built-in Imagegen tool and inspected visually. Full-resolution originals are retained under `asset-sources/`. Optimized delivery files live under `public/art/`; the application does not request the originals. Run `yarn art:optimize` to reproduce WebP assets.

Courtyard prompt: “Original exquisite hand-painted Indian wedding invitation environment, wide landscape, no text. Fine watercolor and gouache with delicate etched details on warm ivory handmade paper, antique gold, muted sage, pale peach, dusty terracotta. Large empty upper center for typography. Ornate pale sandstone South Indian columns on extreme edges, mango leaves and jasmine vines. Bottom center a four-pillar ceremonial mandap with mango-leaf toran, jasmine garlands, elegant golden canopy and brass oil lamps. Botanical trees, antique pots, painted steps, a shallow lotus pond. No people, gods, logos or Muslim dome. Refined stationery atelier illustration, not photorealistic or cartoon.”

Ritual prompt: “Museum-quality Indian botanical miniature watercolor/gouache on warm ivory paper, portrait composition. Engraved antique brass bowl filled with turmeric rice, a hammered cup of turmeric, jasmine strings and muted pink lotus blossoms on ivory silk with a muted gold border. A betel leaf with cumin and jaggery beside the bowl. Slender brass oil lamp, tiny warm flame, mango foliage at upper left, blank upper paper. No people, hands, lettering or modern objects. Fine detailed Indian stationery art, muted terracotta, moss green, ochre gold, paper grain and soft afternoon shadows.”

The actual generation prompts additionally specified composition proportions and image sizes. Generated images were copied into the project; the skill's source copies are preserved. Sharp performs only delivery resizing/compression. SVG lotus, sun, thread and favicon are original code-native ornaments.

## Earlier richer experience revision

The entry uses two Dharmavaram-inspired oxblood silk panels, gold buta and zari, original jasmine/mango garlands, a muggu and a brass deepam. A tassel button opens the panels; Skip and Escape are available. The intro appears once per session and is bypassed by direct links. No sound or ritual action is required. Reduced motion makes entry immediate.

Two arched initial cameos introduce the real names and configurable families. The next scene uses native CSS sticky positioning with reversible GSAP thread drawing and illustrated frames moving closer. On mobile and reduced motion it becomes a static composition. The gallery distinguishes original illustrations from real photos, supports keyboard and touch, and restores focus. The closing note is an optional personal reveal in an evening courtyard. A fixed guest dock keeps RSVP, directions and sharing nearby.

New generated-art briefs: (1) portrait Dharmavaram-inspired oxblood silk, tactile weave, spaced gold motifs and woven vertical borders, no text; (2) original watercolor/gouache evening courtyard, jasmine and mango-leaf garlands, brass hanging lamps, a four-pillar mandap, lotus pools and stone steps, no people or identifiable venue; (3) miniature stationery still life with burgundy silk, ivory shawl, blank handmade wedding letter and wax seal, jasmine, marigold, lotus and engraved brass. All three were generated and visually inspected, then resized/compressed to WebP. Original PNGs remain outside the delivery build. Paper grain, zari borders, garlands, botanical sprigs, muggu and deepam are original SVG code.

## Illustrated cover revision — October 30, 2026

The user's supplied reference sets the new first-load composition: cream cotton paper, separate mango-and-jasmine toran, gold Vinayaka, hanging brass deepams, burgundy calligraphic names, a gold-bordered opening button, temple landscape and a miniature wedding procession. Great Vibes is self-hosted for English names; Telugu retains Noto Serif Telugu. Nine newly generated PNG assets are retained separately; mobile image variants reduce transferred artwork. Gold hanging ornaments are original SVG. See [cover asset briefs](COVER-ASSETS.md).

Toran, lamps and botanical corners move gently, with a persistent pause control and reduced-motion support. Opening the invitation brings in the existing Dharmavaram silk texture on two WebGL cloth meshes. Continuous folds, wave deformation, changing normals and subtle highlights simulate flowing fabric. GSAP controls the close/reopen timing; only the reveal runs a rendering loop. CSS panels provide a fallback without WebGL. Skip, Escape and reduced motion enter immediately. Focus transfers to the main heading. The cover appears once per session; direct section links retain their existing bypass.

The inner invitation letter uses the same paper, toran and Vinayaka. The remaining website flow and confirmed family details are preserved. Desktop and phone compositions have independent sizing so real HTML names and controls remain readable over the layered art.
