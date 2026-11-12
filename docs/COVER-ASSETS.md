# Opening-cover artwork

## First-visit curtain handoff — November 11, 2026

The first-visit panche and saree now share a single refresh-driven 2.65-second
opening, without the previous half-second hold. Both textures and shaders prepare
behind the original stills and become visible together. The closed mesh matches
the stills' crop and lighting; folds develop with the pull. The fallback no longer
uses a continuously repainting background animation.

Preparation has a 1.8-second limit. If an asset misses it, both panels keep their
chosen fallback for the entire opening: late textures cannot appear or compile a
renderer midway through the movement. Hidden tabs suspend the shared clock.
Cover preparation also waits until the curtains clear if its image arrives late.
The cover keeps its original picture beneath the canvas and refreshes the canvas
before exposing it, avoiding a transparent frame at the handoff.

Regression coverage is in `tests/browser/intro.spec.ts`: mobile/desktop startup,
synchronized rendering, delayed cloth/cover assets, hidden tabs, and resizing
through the complete entry flow. Timing captures and visual checks are under
`verification/intro-smoothness/`. A local Edge run measured a maximum moving-frame
interval of 12.1 ms on a fresh desktop load; device/browser performance varies.
The separate after-click knot uses the current 4.35-second choreography documented
in [KNOT-ANIMATION.md](KNOT-ANIMATION.md). Older dated entries below retain the
previous implementation history.

## Current transition and reveals — November 3, 2026

Clicking Open invitation runs a 9.2-second two-cloth sequence: ivory panche and red saree enter from opposite sides, cross at different depths, form an open loop, thread their ends through, tighten, settle, and fade. Both continuous cloth meshes share one WebGL depth buffer with opaque materials; the animation never switches to a finished-knot image. The same woven gold borders, gold floral motifs, folds, and silk colors travel with each cloth through every stage. Their broad hanging ends and zari hems follow the reference composition.

The guided 3D cloth model integrates spring response, gravity, damping and central contact separation at a fixed 1/120-second step. The free ends have different response rates. This is a choreographed cloth approximation, not a full inextensible cloth/self-collision simulation or a pixel-identical copy of the illustration. Hidden tabs freeze both cloth and fade time. Reduced motion and Escape finish immediately. Unavailable textures or missing/lost WebGL use the detailed still reference as a finite fallback; failures cannot block entry. Canvas resolution has a 1.5-million-pixel budget and adapts to slow frames. No new image assets or runtime dependencies were added for the two-cloth animation.

The main page's content groups now use a single IntersectionObserver and gentle opacity/translation reveals. Their movement is 6–10 px, uses a smooth start/end ease, and has no frame stretching. Already-seen elements stay revealed across language changes. Countdown digit updates do not rescan the entire page or rebuild scroll triggers. Name writing remains simultaneous.

The cover has 32 local leaf response samples, replacing the previous eight broad blended regions. The main toran uses independent leaf meshes; see [COUPLE-ASSETS.md](COUPLE-ASSETS.md).

## Current breeze motion — November 2, 2026

The cover and couple section share a spatial, smoothly varying wind field. Mango leaves respond through gravity, stem stiffness and air damping; flower strands have a slower, smaller pendulum response; heavy brass lamps have lower wind loading. Leaf stems and suspension points stay pinned, and tip deflection raises the leaf along its bending arc. The cover protects the entire lamp bowl and chain from the separate foliage deformation. Banana-leaf movement remains constrained to green foliage with planted bases.

The cover's simulation state now lives outside its renderer so mobile/desktop texture changes and restored GPU contexts do not reset wind time or pendulum poses. Pausing, resuming and resizing preserve phase. The model advances at fixed 1/240-second steps with bounded catch-up; rendering follows the browser refresh clock. The couple garland uses separate leaf meshes on one transparent canvas with premultiplied mipmaps, retaining individual images as a fallback.

## Current lettering and fade motion — November 2, 2026

Sathvik and Harika start and finish writing together on both the opening cover and the main couple scene. The cover uses a shared start of 0.58 seconds and a 2.4-second writing span on the existing 1.35× timeline, giving about 1.78 seconds of visible handwriting. Its complete text/button reveal now lasts about 2.9 seconds after the opening fabric clears. Both use the real traced SVG pen paths, with stroke-length weighting, short pen lifts, and a blended sine ease that softens acceleration without stopping abruptly at each stroke. Cached path lengths avoid repeated geometry reads. Telugu preserves native shaping and uses a synchronized whole-name fade.

Page sections receive one opacity/transform fade per content group, including content loaded later. Headings inside an animated group do not receive a second overlapping fade. Temporary layer hints and transforms are released on completion or reduced-motion changes. Animation uses the browser's refresh clock without a fixed 60 Hz timer; actual 120 fps rendering requires a suitable display, browser and device, and was not measured on physical hardware.

The earlier dated sections below record the artwork and opening iterations; current interaction behavior is covered by `tests/browser/cover.spec.ts` and `tests/browser/handwriting.spec.ts`.

## Tied-cloth opening — October 31, 2026

The latest user reference replaces the earlier full-height split panels with one connected saree–pancha wedding knot. Ivory fabric remains on the left and burgundy on the right. The cloth settles, its loose tails respond to a soft breeze, and the entire joined piece gradually fades over textured ivory paper. It never tears apart or visually unties. Then Vinayaka, the wedding label, names, divider, month and button enter in sequence. The button becomes available once its entrance finishes; its hover, press, arrow and brief sheen use transforms and opacity.

`src/Pages/OpenInvitation/animation/knotRenderer.ts` deforms a transparent mesh around the supported arms and loose tails. `src/lib/animation/breezePhysics.ts` integrates two driven, damped pendulums at a fixed 1/240-second step. The cover lamps rotate around their top suspension points; foliage bends more toward its free tips, with banana stems anchored and the standing brass lamp protected from leaf motion. Flame brightness varies separately from the brass. This is a physically informed illustration animation, not a full 3D cloth or fluid simulation.

Cover deformation now runs on approximately 15,000 vertices instead of repeating the trigonometry at every screen pixel. The knot has a one-million-pixel budget; the cover has a 1.5-million-pixel budget. Sustained slow frames progressively reduce only canvas resolution, never live text resolution. Animations follow the browser refresh clock without a 60 Hz cap. Hidden tabs pause the intro and ambient artwork. Reduced motion goes directly to the readable cover. GPU loss and missing artwork have finite fallbacks. Native 120 Hz output still depends on the display, browser and device.

The first paint includes the knot even while the main bundle loads. The cover graphics are prepared behind the opening cloth, then their frame loop starts when the cover becomes visible; shader setup does not have to wait for the text entrance. Both bootstrap and application use session key v7. The introductory knot is shown once per session; the Open invitation cover returns on every reload. Clicking the button mounts the five chapters underneath a one-second cover fade. Main-page text starts after the cover closes, and keyboard focus is restored after the visible DOM commits.

### Wedding-knot asset and final prompt

Built-in Imagegen, using the user's attached knot illustration as the visual reference. Original: `asset-sources/cover/wedding-knot.png` (1672 × 941, alpha). Delivery: `public/art/cover/wedding-knot.webp` (1672 pixels wide, 280,900 bytes). Sharp only resizes and encodes the generated image, preserving alpha. Rebuild it with `scripts/optimize-cover.mjs`.

Use case: precise-object-edit. Asset type: transparent ceremonial cloth knot for a premium Telugu wedding invitation animation. Use the attached reference ONLY for the interlocked wedding knot silhouette and curved fabric drape. Recreate as a richly detailed, realistic silk textile illustration: ivory-white pancha with antique gold zari on the LEFT and deep burgundy-red saree with tiny woven gold motifs on the RIGHT, securely joined in one clearly recognizable central wedding knot. Both long cloth arms sweep gently upward toward the left and right edges from the center, like the reference, and two naturally folded, broad fabric tails hang below the knot. The ivory tail must be on the left and burgundy tail on the right. Show gravity, weight, soft folds, fine silk weave and restrained metallic gold borders, matching luxury South Indian wedding stationery. No people, no hands, no poles, no scenery, no letters. True transparent background everywhere around the cloth AND inside the space between the curved arms and tails. Wide landscape composition, tightly cropped with about 4% clear padding around all textile tips. No white rectangle, no shadow outside the textile silhouette. Preserve the simple tied-knot arrangement, not a bow, no extra loops or extra garments.

### Wedding song

The optional footer link opens the label-provided **Pidikita Talambrala — Nithya Santoshini**, supplied to YouTube by Times Music: https://www.youtube.com/watch?v=lF4wWbUuQWU . No recording was downloaded, extracted or bundled; no third-party player loads automatically. The existing opt-in ambient chimes remain a separate sound control.

## Previous split-panel motion — October 31, 2026

A first visit starts with two equal fabric panels meeting at the center: ivory-and-gold pancha on the left and the existing red-and-gold saree on the right. Both gently billow, hold for .55 seconds, then draw outward together over 3.15 seconds to expose the invitation cover. The cloth edges gather and curve with separate wave phases and changing light. Clicking Open invitation then fades into the main site. There is no second curtain transition or visible skip button.

`src/Pages/OpenInvitation/animation/silkRenderer.ts` supplies fold deformation and moving light. `src/Pages/OpenInvitation/animation/coverRenderer.ts` applies small, localized displacements to the reference scene's mango leaves, hanging lamps and corner foliage, with a gentle lamp glow. The paper, temple, procession and live text stay stationary. This is decorative image deformation, not a physical cloth simulation. Desktop and portrait artwork have separate motion masks.

`src/lib/animation/imageMesh.ts` bounds the two cloth canvases to one million pixels each (two million combined), and the living cover to two million pixels, with a maximum 1.5 device pixel ratio. The textile UVs preserve pattern proportions and the inner gold border on narrow portrait screens. Drawing pauses in hidden tabs; all mesh resources and frame loops are disposed when their scene closes. A motion control freezes the cover artwork. Reduced-motion users go directly to the readable invitation without cloth or text effects. Each cloth has its own CSS fallback, so losing one texture or graphics context does not disable the other panel. A readiness deadline prevents stalled assets from trapping a visitor.

`public/intro-bootstrap.js` displays the same half-pancha, half-saree composition before the main application bundle is ready. It honors the same v6 session key as `src/lib/content.ts`, direct section links and reduced-motion preferences. Keep those two session version strings aligned. Reaching the cover records only that the cloth opening has been seen. The Open invitation cover returns on every reload, including reloads of section URLs such as `#rsvp`; returning visits to the home URL also show the cover. Fresh direct section links remain usable. Escape completes an active cloth reveal before allowing entry from the cover.

The landing page has five main chapters and five corresponding navigation links: Invitation, Families, Celebrations, Details & Memories, and RSVP. Existing content, gallery, guest information and reply functionality remain within those chapters. Headings and content reveal once as they enter view; anchor navigation stays available without motion.

## Pancha textile — October 31, 2026

Generated with the built-in Imagegen tool, using the existing red textile as an edit target. Original saved to `asset-sources/pancha-silk-original.png`; delivery asset: `public/art/pancha-silk.webp`. The original is 1024 × 1536. Sharp only resizes to 760 pixels wide and encodes WebP at quality 78. The original red saree asset is unchanged.

Final prompt:

Use case: precise-object-edit. Asset type: realistic fabric texture for the left half of a Telugu wedding invitation opening animation. Input image is the edit target: a red saree textile. Create a matching men's traditional ivory pancha/dhoti textile. Change the red body to warm ivory white handwoven silk-cotton with a subtle realistic weave. Remove all paisley and lotus motifs from the central body; it should be elegantly plain ivory. Replace the ornate red-and-gold side bands with dignified antique-gold woven zari borders along BOTH vertical edges, with fine geometric gold details and a very narrow ochre selvedge. Keep the portrait 2:3 framing, full-frame edge-to-edge textile, soft vertical draped folds, photographic realism, material scale, and warm soft lighting. Ivory should remain clean and luminous with gentle cream shadows, not yellow or gray. No people, no text, no logos, no background, no transparency. This is fabric only, not a garment on a person.

## Reference artwork update — October 31, 2026

The second user-supplied image is the design reference. The cover now uses a coordinated illustration with small, slender mango leaves, jasmine and lotus strands, hanging brass lamps, temple and lake, a compact wedding procession and botanical corners. The desktop composition follows the reference; the portrait scene is recomposed for phones. These are generated recreations, not pixel-identical copies of the supplied image.

The names, month, divider and action are live HTML/SVG. The gold Vinayaka is a separate transparent image. The final entry sequence and decorative motion are described in Current motion flow above. English and Telugu remain supported.

Generated using the built-in Imagegen tool. Final project files:

| Asset | Original | Web delivery | Size |
| --- | --- | --- | --- |
| Desktop scene | `asset-sources/cover/reference-scene.png` | `public/art/cover/reference-scene.webp` | 1586 × 992, 325 KB |
| Portrait scene | `asset-sources/cover/reference-scene-mobile.png` | `public/art/cover/reference-scene-mobile.webp` | 848 × 1855, 251 KB |
| Gold Vinayaka | `asset-sources/cover/vinayaka-reference.png` | `public/art/cover/vinayaka-reference.webp` | 300 × 388, 48 KB, alpha |

The final generation prompts are recorded below. Sharp only resizes and encodes the generated PNGs into WebP; it does not redraw the artwork. `node scripts/optimize-cover.mjs` regenerates the delivery assets. The picture source and matching preloads select the portrait scene at aspect ratios of 4:5 or narrower.

### Final desktop composition prompt

Use case: precise-object-edit. Edit this exact wedding artwork to an 8:5 landscape canvas, output 1600 pixels wide by 1000 pixels high (NOT a panoramic 21:9 canvas). Keep the identical art style and objects. The current image is too wide and shallow. Recompose to this exact normalized layout: slender SMALL mango-leaf garland runs along the entire upper edge, only top 0-14% for the leaves, with taller jasmine strings at the far corners; two hanging lamps centered at x=8.5% and 91.5%, from top to y=21%; thin gold side filigree reaches y=47%; temple at far left x=10-21% with its top at y=40% and its bottom at y=70%; horizon and lake at y=71%; the full wedding procession (musicians, horse groom, palanquin bride, carriers, parasols, women) runs from x=16% to x=89%, its parasol tops at y=60% and feet aligned at y=91%; large banana plants frame extreme left and right from y=50% to bottom; lotus flowers and gold lamp/kalash in the lower corners; paving and rangoli across lowest 10%. Central space must be completely EMPTY pale ivory textured paper from x=29-72%, y=11-57%. Fine crisp details with reference's soft ivory, burgundy, green and gold palette. Preserve arrangement, every object and scale of individual illustrations; only adapt canvas composition to 8:5. No text, no Ganesha icon, no button, no divider, no border framing the canvas.

### Final portrait composition prompt

Use case: precise-object-edit. Adapt this exact South Indian wedding artwork into a tall PHONE wallpaper aspect ratio 9:19.5, approximately 864x1872 pixels. Preserve the same fine hand-painted art, colors, beautiful little slender mango leaves and white jasmine pink lotus toran along the top, two small suspended brass lamps near the top corners, fine gold side ornaments, soft pale ivory paper, temple to the left in the distance, lake, banana leaves and lotus botanical corners, full small wedding procession on the lower edge with musicians, groom on white horse, bride palanquin, parasols, bearers and women. Layout for a working mobile wedding invitation: decorative upper toran occupies only top 0-13%, thin corner hanging ornaments down to y=28%. The center region x=12-88%, y=18-60% must be EMPTY ivory cream paper for the site's live text and a button, NO objects there. The subtle distant temple should start y=63% at far left. The full small procession should be along y=78%-94%, all figures and feet visible and with natural proportions. Temple lake and trees above and behind the procession. Botanical corners from y=75% to bottom, keep them slim. Stone floor and small rangoli along bottom 6%. Refined, uncluttered and balanced. No text, no button, no Ganesha, no divider. This is a portrait background illustration only. Do not squeeze or stretch people: recompose appropriately to the tall canvas.

### Final Vinayaka prompt

Use case: background-extraction. Asset type: standalone gold Vinayaka emblem for a wedding website. From the ORIGINAL wedding invitation reference with 'Sathvik & Harika' text (NOT the newly generated empty landscape), extract and faithfully reproduce ONLY the gold Ganesha/Vinayaka calligraphic icon above 'THE WEDDING OF'. Gold thick-and-thin swirled calligraphy: distinctive curled crown, left elephant ear, broad seated body forming a loop, long elegant curved elephant trunk, curved right arm and small round gold dot, same asymmetric pose as reference. Exact warm gold gradient and gold foil feel. This must be the reference's elegant substantial gold calligraphy, not the previous thin outlined elephant. Isolate that single complete icon centered on a TRUE TRANSPARENT canvas with only a very small margin (approximately 5%). Portrait shape icon height about 1.3 times its width. No lettering, no other ornaments, no scenery, no cream or white fill, no shadows outside the symbol. Sharp and sophisticated luxury wedding stationery emblem.

## Earlier separate-layer assets

Generated with the built-in Imagegen tool for the user-supplied visual reference. The reference guided the composition; text remains live HTML. The nine final originals are separate PNGs in `asset-sources/cover/`. Delivery WebPs are in `public/art/cover/`. Decorative procession figures are fictional illustrations; the temple scene is not the confirmed venue.

Run `node scripts/optimize-cover.mjs` to resize/compress delivery images with Sharp. Transparent assets retain alpha; paper and the courtyard floor are intentionally opaque. The toran, landscape and procession have separate smaller mobile derivatives. The existing `asset-sources/dharmavaram-silk-original.png` remains unchanged and its `/art/dharmavaram-silk.webp` derivative supplies the animated cloth.

## Asset inventory and prompt set

The first seven entries record the generation briefs in normalized form for recreation; Vinayaka and the floor preserve the final generation prompt verbatim. The botanical extraction prompt below is also verbatim.

### paper

Original: [paper.png](../asset-sources/cover/paper.png). Delivery: [paper.webp](../public/art/cover/paper.webp).

Warm pale ivory handmade cotton paper, subtly mottled fibers and delicate cream watercolor clouding near the edges. Luminous blank center, restrained pale gold tone. Flat overhead, no shadows, borders, objects, flowers, text or symbols. Landscape 1536×1024; fine cotton texture, not brown parchment.

### toran

Original: [toran.png](../asset-sources/cover/toran.png). Delivery: [toran.webp](../public/art/cover/toran.webp).

A wide South Indian ceremonial toran isolated on transparent alpha. Fresh natural mango leaves hang from a gold cord, interspersed with white jasmine garlands, small pink lotus buds and delicate gold accents. Rich realistic miniature gouache detail, warm light, transparent gaps, no background, typography or watermarks. Leave room below for separate invitation text.

### hanging-deepam

Original: [hanging-deepam.png](../asset-sources/cover/hanging-deepam.png). Delivery: [hanging-deepam.webp](../public/art/cover/hanging-deepam.webp).

A single antique brass South Indian hanging deepam suspended from a long fine gold chain, isolated on genuine alpha. Graceful carved brass bowl with small warm flames; realistic metal and delicate miniature detail. Tall narrow canvas; full chain and lamp visible. No background, letters or cast shadow outside the object.

### temple-landscape

Original: [temple-landscape.png](../asset-sources/cover/temple-landscape.png). Delivery: [temple-landscape.webp](../public/art/cover/temple-landscape.webp).

A wide panoramic South Indian temple landscape in delicate realistic miniature watercolor and gouache. Tall ornate gopuram at far left, palms, a tranquil lake, atmospheric distant greenery and pale stone foreground. Light cream and muted warm gold. Upper area transparent for a separately composed invitation; no people or text. Architectural illustration, not an identifiable wedding venue.

### procession

Original: [procession.png](../asset-sources/cover/procession.png). Delivery: [procession.webp](../public/art/cover/procession.webp).

A wide miniature South Indian wedding procession isolated on genuine transparent alpha: musicians, a groom riding a white horse, an ornate burgundy-and-gold palanquin with a bride, bearers, parasols and women carrying ceremonial offerings. Ivory, burgundy, green and gold clothing; fine realistic hand-painted detail. All figures and feet fully visible, no backdrop or typography. Fictional illustrative people, not portraits of the actual couple.

### left-botanical

Original: [left-botanical.png](../asset-sources/cover/left-botanical.png). Delivery: [left-botanical.webp](../public/art/cover/left-botanical.webp).

Banana leaves rising along the left edge with an ornate standing brass deepam, small flames, white jasmine and pink lotus at the base. Rich natural green, antique gold, detailed realistic miniature illustration, isolated transparent cutout. Keep the center-facing edge open for typography.

### right-botanical

Original: [right-botanical.png](../asset-sources/cover/right-botanical.png). Delivery: [right-botanical.webp](../public/art/cover/right-botanical.webp).

Banana foliage along the right edge with an engraved gold kalash, coconut and mango leaves, jasmine and pink lotus at the base. Natural greens and warm gold, detailed miniature illustration, isolated transparent cutout. Keep the center-facing edge open.

### vinayaka

Original: [vinayaka.png](../asset-sources/cover/vinayaka.png). Delivery: [vinayaka.webp](../public/art/cover/vinayaka.webp).

A single minimalist Vinayaka / Ganesha calligraphy emblem for a luxury Indian wedding invitation, isolated on transparent alpha. Draw the recognisable elephant-headed seated Ganesha with ONLY 10 to 15 elegant tapering gold brush strokes and graceful negative space: rounded elephant ears, curled trunk, small crown, gently curved seated body. FLAT two-dimensional line emblem, like gold foil wedding stationery. Antique gold #b48124 with very subtle metallic tone variation inside the strokes. The interior between strokes must remain transparent. Absolutely NO solid statue, NO realistic idol, NO rendered face, NO shading or three-dimensional sculpture, NO detailed ornaments, NO scene, NO text, NO background. Simple sophisticated calligraphic line silhouette, centered and fully visible, square canvas with generous margin.

### courtyard-floor

Original: [courtyard-floor.png](../asset-sources/cover/courtyard-floor.png). Delivery: [courtyard-floor.webp](../public/art/cover/courtyard-floor.webp).

Use case: illustration-story. Asset type: a separate foreground floor layer for a refined South Indian wedding invitation. Very wide panoramic 3:1 illustration of a warm pale cream sandstone courtyard terrace seen at a low oblique angle. Beautiful large hand-cut pale sandstone paving slabs with delicate seams. A small elegant white and pale gold muggu/rangoli motif centered near the bottom, a few scattered pink rose petals and tiny white jasmine blossoms along the lower edge. NO buildings, NO people, NO foliage, NO furniture, NO horizon, NO sky, NO lettering. Only the ground surface. Flat cream and pale honey-gold palette, delicate realistic miniature gouache watercolor. Clean uncluttered with much empty paving. Even soft warm light. No strong cast shadows. The entire image is usable stone floor texture.

## Final botanical transparency refinement

Applied separately to the left and right images using their local original image paths and `transparent_background: true`:

Use case: background-extraction. Edit this exact botanical wedding corner illustration. Keep the banana leaves, flowers, jasmine and brass ceremonial object exactly intact, same colors, detail, size, arrangement and silhouette. Remove ALL the surrounding background: remove the green haze, dark areas, white field and every cast shadow outside the objects. Output ONLY the sharply isolated leaves, flowers and brass object with genuine full alpha transparency outside their contour and in every gap. Do NOT replace the background with white, black, gray, green or any color. Do NOT add an aura or gradient. True clean transparent cutout ready to composite on cream paper. Preserve fine leaf edges.

## Additional code-native ornament

`public/art/cover/gold-hangings.svg` is an original vector drawing of thin gold chains and geometric filigree. It is kept separate from the generated rasters. Great Vibes, Cormorant Garamond, DM Sans and Noto Serif Telugu are self-hosted fonts.

