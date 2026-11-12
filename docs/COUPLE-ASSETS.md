# The Couple — layered hero assets

This is the first main-page section after Open invitation and the knot reveal. It follows the user's supplied composition with separate artwork and live, bilingual HTML text. The user explicitly chose portrait placeholders. Real photos are read from `wedding.families.first.portrait` and `wedding.families.second.portrait` in `shared/wedding.ts`; missing or failed photos show the initial and localized “Portrait to come” text.

Eight raster assets were generated with the built-in Imagegen tool. Originals are preserved in `asset-sources/couple/`; compressed alpha WebPs are in `public/art/couple/`. Run `node scripts/optimize-couple.mjs` to reproduce the delivery files. No generated person is shown as the actual couple.

The paper is reused from `public/art/cover/`. The couple section has its own wide-bowl hanging lamp and floor rangoli. Floral borders, scalloped photo frames, corner seals, central ornament and petals are code-native vectors or CSS elements.

## November 3 — independent leaf animation

The current toran is assembled from **32 separate mango leaves**, a fixed gold cord and eight jasmine strands. Each blade has an independent mesh, stem pivot, resting angle, length, air response and curvature; they share one canvas and one mipmapped texture. The small-scale wind field can move neighbouring leaves in opposite directions without moving their supports. Gravity, stiffness and damping return each leaf toward its hanging position. The original combined `mango-toran` remains as an archived earlier asset, and is no longer the moving toran texture.

New built-in image-generation asset: [mango-leaf.png](../asset-sources/motion/mango-leaf.png), optimized as [mango-leaf.webp](../public/art/couple/mango-leaf.webp). The exact generation and cleanup prompts are in [motion/PROMPTS.md](../asset-sources/motion/PROMPTS.md). The jasmine reuses the countdown's individual strand. Without WebGL, the same angular model drives individual CSS hinges; reduced motion removes the movement. Images retain their natural proportions and mirrored leaves preserve the world wind direction.

The second section now reuses the couple scene's floral border, corner seals, floor muggu and scattered petals, with stronger architectural sketches behind the brass arrangements. The date caption and floor pattern have separate space on desktop and phone.

## Photographic blue butterfly

The butterfly on Harika's portrait uses a real blue morpho specimen photograph by
Didier Descouens (Museum de Toulouse), sourced from Wikimedia Commons. The flying
butterflies also include real orange monarch, yellow sulphur and red glider photos.
They are not generated illustrations. The white background
and measurement scale were removed with conventional pixel masking. Original colors
and wing texture are preserved. Separate transparent wing and body images allow slow
wing folding around the fixed body, with continuous curved flight for the small ones.

Source: `asset-sources/couple/blue-morpho-original.jpg`. Rebuild the WebP layers with
`node scripts/prepare-butterfly.mjs`; build the other species with
`node scripts/prepare-flying-butterflies.mjs`. Full source, modifications and CC BY-SA 4.0
attribution are in `public/art/couple/butterfly-credits.txt`, linked from the floating song player's information panel.
The photo derivatives retain that license. No external image host is used at runtime.

Each visitor gets fresh random flight paths and arrival timing. Individual visits
fade in and out along curved routes with varied speeds, sizes and wing rhythms.
A shuffled species selection avoids consecutive repeats. At most four are flying
on desktop or three on mobile. Arrivals are spaced roughly 3–5 seconds apart so
visits overlap, with occasional quiet gaps after longer groups of visits. The
flight clock shares the existing decorations animation loop, so pausing, leaving
the section or hiding the tab freezes both movement and the arrival schedule.

## Generation prompts

## November 2 alignment revision — built-in Imagegen prompts

### mango-toran

[Original PNG](../asset-sources/couple/mango-toran.png) · [Delivery WebP](../public/art/couple/mango-toran.webp)

Use case: illustration-story. Asset type: transparent botanical cutout for the top border of a traditional Telugu wedding invitation. Generate a single horizontal 3:1 garland segment: a very thin natural golden twine runs horizontally at the very top. Eight separate long fresh green mango leaves hang DOWN from their stems along the twine, with natural gravity, curved tips, fine veins, varied individual angles, olive green and emerald watercolor shading. Two slender vertical strings of creamy white jasmine flowers terminate in small deep pink lotus buds, one near the left third and one near the right edge. Leaves occupy most of the height and the jasmine strings extend just slightly below them. Elegant hand-painted fine Indian gouache botanical illustration, soft warm highlights, natural proportions, detailed yet graceful. Composition fills the wide canvas with very little empty padding. Genuine transparent background. This segment will be repeated across a website, so keep the twine level and connecting at left and right edges. No large floral corner bouquets, no bells, no lamps, no text, no border, no backdrop, no drop shadows or glow. Full leaves visible, none cropped.

### hanging-lamp

[Original PNG](../asset-sources/couple/hanging-lamp.png) · [Delivery WebP](../public/art/couple/hanging-lamp.webp)

Use case: illustration-story. Asset type: individual transparent hanging brass deepam cutout for a traditional Telugu wedding invitation. A single long antique golden brass chain suspends a broad shallow diya oil-lamp bowl with five small graceful yellow orange flames. Tall narrow composition, aspect ratio 1:3. Chain centered at x50% from the absolute top of the canvas to 62% down, a short sculpted brass stem connects the chain to the broad bowl at 78% down. Bowl fills 90% of canvas width, with a graceful curled lip, detailed polished antique gold reflections. A small decorative tapering brass finial hangs below the bowl, ending near the bottom edge. Realistic hand-painted Indian fine gouache illustration matching an elegant cream wedding card, softly luminous gold, crisp details. Strictly upright vertical hanging pose under gravity, no perspective tilt. Genuine transparent background. No halo, no glow outside flames, no background, no text, no rope coils, no bells, no extra objects. Minimal transparent padding, complete chain and lamp, no cropping.

### floor-rangoli

[Original PNG](../asset-sources/couple/floor-rangoli.png) · [Delivery WebP](../public/art/couple/floor-rangoli.webp)

Use case: illustration-story. Asset type: separate transparent gold muggu/rangoli floor ornament for a Telugu wedding invitation. Wide 3:1 composition, a delicate symmetrical traditional lotus rangoli, viewed from a low oblique angle on a floor so that its entire circular design is naturally seen as a wide flat oval. Thin amber golden hand drawn rice-powder lines, 8 broad gently rounded lotus petals around a small central rosette, a second ring of looping paisley petals, tiny diamond tips at the four cardinal points, and sparse dots. Elegant Indian wedding stationery, restrained refined fine linework. Centered, complete motif, about 90% of canvas width with clean padding. Genuine transparent background including all spaces between the gold strokes. Only gold linework. No floor, no background, no text, no border, no heavy solid fills, no starburst, no very long pointed spikes, no photoreal setting, no drop shadow.


### peacock

[Original PNG](../asset-sources/couple/peacock.png) · [Delivery WebP](../public/art/couple/peacock.webp)

A single exquisite Indian peacock decorative ornament for a Telugu wedding invitation, isolated on true transparent alpha. Full elegant bird, head at upper right facing right, slender curved royal-blue neck, blue and turquoise wings with delicate antique-gold detailing; a long emerald tail sweeps diagonally down and left with beautiful gold-and-teal eyespots. Side profile, standing perched on an invisible arch edge. Fine miniature gouache watercolor illustration matching luxurious cream-and-gold Indian wedding stationery. The bird occupies the canvas tightly, fully visible including tail and crest. NO branch, NO arch, NO background, NO text, NO frame, NO shadows outside the bird. Portrait 2:3 composition.

### lotus-crest

[Original PNG](../asset-sources/couple/lotus-crest.png) · [Delivery WebP](../public/art/couple/lotus-crest.webp)

One symmetrical horizontal decorative crest for the top of a bridal portrait arch. A single open pink lotus at center, layered rose-pink and blush petals with a golden seed center. Graceful antique-gold acanthus curls and soft sage-green scrolling leaves extend left and right in a low arc. Fine realistic miniature gouache illustration for luxurious Indian wedding stationery. Isolated on true transparent alpha, every gap transparent, no background or shadow field. Wide 3:1 composition. NO portrait, NO frame, NO lettering. Crisp detailed gold and green curls, flower prominent but tasteful.

### temple-sketch

[Original PNG](../asset-sources/couple/temple-sketch.png) · [Delivery WebP](../public/art/couple/temple-sketch.webp)

Separate decorative illustration for a wedding webpage: delicate monochrome antique-gold line-art of a tall South Indian temple gopuram, small adjacent shrine, palms and fine tropical foliage at the base. Vertical composition with temple on the left half, open breathing room to the right. Hand-etched architectural drawing, light ochre gold ink only, no solid colored fills. Faint refined wedding stationery engraving on a TRUE TRANSPARENT background, no paper texture, no rectangle, no sky, no people, no text. All artwork fully visible, softly sparse foliage edges. Portrait 2:3.

### pavilion-sketch

[Original PNG](../asset-sources/couple/pavilion-sketch.png) · [Delivery WebP](../public/art/couple/pavilion-sketch.webp)

Separate decorative illustration for a wedding webpage: delicate monochrome antique-gold line-art of an elegant South Indian open ceremonial stone pavilion with carved pillars, rounded ornate finial canopy, shallow steps, tall coconut palms and low tropical plants. Pavilion lower right, airy palms behind, open breathing room to the left. Hand-etched architectural drawing in light ochre gold ink only, NO solid color fills. TRUE transparent alpha background, no paper or sky, no people, no writing. Fine refined wedding stationery engraving, portrait 2:3.

### lotus-corner

[Original PNG](../asset-sources/couple/lotus-corner.png) · [Delivery WebP](../public/art/couple/lotus-corner.webp)

A single small lower-left botanical corner ornament for refined Telugu wedding stationery, isolated on TRUE transparent alpha. Two open pink lotus flowers, one smaller pink bud, broad green lotus leaves, a few slender mango leaves, and cascading tiny white jasmine flowers. Low triangular arrangement, flower cluster near left, leaves taper toward lower right. Delicate realistic miniature gouache and watercolor, rich but restrained green and pink, subtle gold details. All objects fully visible with clean alpha in every gap. No pot, no brass objects, no floor, no shadow field, no text, no border, no background. Landscape 3:2 composition.

## Final transparency refinement

Applied separately to peacock, lotus-corner, temple-sketch and pavilion-sketch with `transparent_background: true`:

Edit the supplied decorative illustration as a clean background extraction. Preserve the exact subject, its detailed illustration, colors, composition, edges, and full silhouette. Remove ALL colored haze, glow, gradient, background paint, cast shadows and solid background outside the actual subject. Leave genuine fully transparent alpha around the silhouette and in open gaps. No green or gold aura, no soft halo, no colored field, no black or white background. For architecture preserve the fine gold ink lines and remove the background haze. Keep the actual object unchanged. Output a clean transparent cutout that composites perfectly on cream stationery.

## Motion and layout

The perched peacock uses the original artwork on one continuous image mesh. Its
head makes small alternating glances with randomized holds and rest periods; a
separate schedule gently settles the folded wing. Neck and shoulder motion blends
smoothly into the body, with the feet and long tail pinned. There are no cutout
seams, wing opening or whole-bird rocking. It shares the decorations clock and
pause/off-screen behavior. Reduced motion and unavailable/lost WebGL show the
original still image; restored graphics resume the frozen pose.

The entrance starts after the knot transition. Heading, top decorations, arches, crests, names and captions enter in coordinated stages using GSAP. Both names write simultaneously on a shared timeline, with length-weighted, gently eased pen strokes. The paired frames and crests arrive together. Motion is scoped and reverted on language or reduced-motion changes.

`LivingToran` renders the four natural-proportion mango/jasmine segments in one transparent canvas. The supporting cord stays pinned; leaf blades curve progressively toward their tips with an approximate length-preserving lift. Jasmine strings and buds use a slower pendulum response. A spatial breeze drives 32 damped leaf responses, eight flower responses and two heavier hanging lamps at a fixed 1/240-second integration step. Different lengths, stem stiffness and wind loading avoid synchronized rigid rocking. The main lamps rotate separately around their chain tops. The cover shares the same model, including slow rooted banana-leaf movement.

The toran uses a 420,000-pixel budget and a single shared texture with premultiplied-alpha mipmaps to suppress fine-edge shimmer. No new image assets were needed. Canvas deformation and local lamp transforms avoid inherited CSS-variable updates across the calligraphy and portrait tree. Pause retains the current physical state. Continuous updates stop while the hero is off screen or the document is hidden. Resize redraws the frozen pose without advancing time. Reduced motion, unavailable WebGL and lost GPU contexts show the original separate cutouts; a restored context resumes the current pose. This is a restrained, physically informed illustration animation.

Desktop fills the viewport from the top, without a site header. Container-relative sizing places the portrait frames around 30% down, with matching widths and preserved aspect ratios. Separate garland segments become smaller toward the middle, leaving the title clear. Lamp images rotate about their chain anchors; cutouts are never skewed or stretched. Phone layouts stack the frames and keep decorations away from readable text. Music, motion, language and guest shortcuts live in an inline row below the frame. Scroll to continue leads to the invitation letter, where the existing modal-opening action is retained.

