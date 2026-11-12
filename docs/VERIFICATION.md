# Verification record

## November 11, 2026 — confirmed family invitation and venue

The PDF and supplied family wording now replace the provisional schedule with the December 19 reception and December 20, 3:40 AM IST Muhurtham at The Environ Convention. See [current content, data flow and verification](INVITATION-DETAILS.md). Entries below are historical and may describe earlier layouts or provisional dates.

## November 3, 2026 — page and component organization

Reorganized the frontend into `Pages/Home`, `Pages/OpenInvitation` and shared `Components`, with feature-owned styles and animation helpers. App composition, cross-page state and API access now have separate homes. Updated imports, TypeScript/Vite aliases, test paths and documentation. The full editing map is in [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md).

- Production TypeScript/client/Worker build and ESLint passed. All 19 unit/API tests passed, including isolated RSVP persistence, countdown, footprint geometry and cloth/wind calculations.
- Audited 146 local imports across 56 source files for resolution and exact filesystem casing; no missing or incorrectly cased paths.
- Before/after screenshots of the couple section matched decoded pixels exactly at phone and desktop widths (390 and 1440 px) with reduced motion enabled.
- The 70-check browser run passed 69 checks. One toran pause/resize check initially reported an unavailable GPU renderer; rerunning that unchanged check alone passed. This is recorded as a transient failure, not a clean first-pass suite. Context-loss/restoration and no-WebGL fallback checks passed in the broader run.
- Verified opening and knot transitions, simultaneous handwriting, music playback/recovery, English/Telugu layouts from 320 to 1440 px, phone rotation, downward footprints, countdown, gallery, sharing, dialogs, RSVP failure recovery and original footer artwork. No real guest RSVP was submitted; the browser persistence test was deliberately excluded.

Evidence: `artifacts/structure/`, browser trace/report output, and the unit/build logs. Browser verification used standalone Playwright because the in-app browser connection was unavailable. Physical devices and presentation frame rates were not measured.

## November 3, 2026 — exact uploaded footer reference

Replaced the generated footer interpretation with the user's original uploaded 1152×2048 image. The delivery WebP is lossless: its decoded RGB buffer matches the PNG byte-for-byte. A CSS rotation of −90° makes the temple upright and places the lotus border along the page bottom; the 16:9 container preserves the complete composition on phones and desktops. Original colours and all embedded background details are retained. Source provenance and checksum are recorded in [footer/REFERENCE.md](../asset-sources/footer/REFERENCE.md).

Four focused browser checks passed at 320, 390, 768 and 1440 px, verifying counterclockwise orientation, undistorted proportions, complete bounds, no overlap with footer links, no horizontal overflow and placement at the page bottom. Phone and desktop screenshots were reviewed.

## November 3, 2026 — mobile invitation, forward footsteps and wedding journey

The third visible section is a winding wedding journey, with four separate ceremony illustrations, native SVG footprints, a repeated kolam pattern and the existing ivory/maroon/gold border. Desktop footprints follow the curve at measured distances; phones use a narrow trail beside readable event captions. Left and right feet alternate, with mirroring inside the SVG and reveal transforms on a separate layer. Every toe points down the page, including during animation, reverse scrolling and resizing. Ceremony details remain proposed except for the user's provisional December 13, 2026, 7:20 PM IST target; no venue or additional dates were invented.

The phone pass covers the opening cover, couple scene, timer, journey, letter, families, woven scene, traditions, details, gallery, RSVP, closing note and footer. RSVP fields stack on narrow phones, inputs retain 16px text, attendance choices wrap, and tabs, consent and footer links have larger touch targets. Telugu headings and supporting copy reflow, landscape phones retain room for portraits, and the closing note sizes to its content. The header remains absent. Music, motion, language and guest shortcuts now sit in the footer. A touch-phone language-change/rotation crash was fixed by retaining completed GSAP reveal triggers until context cleanup rather than deleting them during refresh.

The supplied sideways devotional reference was regenerated upright as a transparent landscape footer, with the temple, wedding assembly, banana plants, kolams and lotus baseline. It is the final artwork below the footer links, with a smaller phone delivery file. Separate originals and exact built-in image-generation prompts are recorded in [journey/PROMPTS.md](../asset-sources/journey/PROMPTS.md) and [footer/PROMPT.md](../asset-sources/footer/PROMPT.md).

**29 distinct affected browser checks passed** across focused runs, including English/Telugu at 320–1440px, all-section bounds at 320×568, 390×844, 600×900 and 844×390, phone dialogs/tabs/form controls, footer artwork proportions, genuine venue navigation, gallery interactions and the language/rotation regression. The new journey returned zero axe violations at four widths. Two geometry unit checks passed, including down-facing headings, alternating feet, stride and caption bounds. Standalone Edge and WebKit touch-phone checks exercised the real opening, all section reveals, Telugu, portrait-to-landscape rotation and reduced motion with no runtime errors or backward-facing feet. Screenshots were visually reviewed. Strict TypeScript, production build and ESLint passed; no RSVP was submitted during the mobile checks. Physical devices and physical 120 Hz rendering were not measured. The in-app Browser connection remains unavailable due to missing sandbox metadata, so standalone Playwright supplied browser QA.

## November 3, 2026 — individual leaves, cloth tying and reveal refinement

The main garland now uses 32 separate textured leaf meshes with fixed stem pivots, varied lengths and resting angles, flexible tips and gravity/damping. Local eddies create distinct adjacent responses instead of one shared sway. The cover samples 32 local leaf angles. The non-WebGL main-page fallback animates individual CSS hinges, and pause/reduced-motion modes remain available. The countdown scene gains the first section's border, corner seals, architectural sketches, petals and floor muggu.

Open invitation now brings two independently deforming fabric lengths from opposite sides, crosses and wraps them at the centre, cinches the free ends downward, and settles into the detailed wedding-knot artwork. The GPU path uses a separate foreground pass for the over/under fold. The matching animated SVG path fallback completes through missing or lost graphics contexts. All stages and the final couple focus were exercised. This is choreographed illustration animation, not a full cloth-contact simulation.

Section reveals use a single native observer, small 6–10 px translations and a gentle start/end curve; already-revealed elements stay visible across locale changes. Countdown ticks no longer trigger a full-page reveal scan. The two names still write simultaneously.

**25 distinct affected browser tests passed** across two focused runs (15 existing breeze/countdown/couple/experience/handwriting checks and 10 cover/cloth/individual-leaf checks). The non-WebGL individual leaf assertion also passed on its focused rerun. **10 unit checks passed**, covering equivalent 30/60/120 Hz physics, wind-off settling, opposing leaf angles, invalid/paused time, countdown timezone/expiry and continuous cloth curves with gravity-hung final ends. Production build, strict TypeScript and ESLint passed.

Additional Edge, Firefox and WebKit visual checks confirmed the live cloth meshes and completed invitation without runtime errors. Pixel comparisons found **zero changed pixels at the top support strip**, with respectively 44,663, 31,363 and 6,170 changed pixels in the moving leaf region. Paused frames were identical. Desktop/phone screenshots were reviewed, the date caption stays above the floor muggu, and no horizontal overflow was found. The in-app Browser still fails to connect because of missing sandbox metadata; standalone Playwright provided browser QA. Physical 120 Hz output was not measured. The new separate leaf asset and built-in generation prompts are in [motion/PROMPTS.md](../asset-sources/motion/PROMPTS.md).

## November 3, 2026 — reference-inspired Muhurtham section and realistic breeze

The second visible main-page section is now the Muhurtham countdown, directly after the couple scene. It uses the same parchment, separate generated jasmine/deepam/kalash artwork, live gold frames, bilingual text, and the existing section fades. The hero's scroll link leads to it. The requested working date is **13 December 2026, 7:20 PM IST** (`2026-12-13T19:20:00+05:30`), marked provisional in the shared wedding data and visible caption. No exact venue or ceremony end time was invented. The timer derives from wall-clock time, resynchronizes on tab visibility changes, and clamps to zero on arrival. It does not announce every second to screen readers.

The cover and couple scene now use spatial wind, gravity, stem stiffness and damping. Lightweight leaves bend from fixed supports; jasmine and brass lamps respond with progressively less deflection. The main toran uses a bounded mesh and premultiplied mipmaps to avoid shimmering fine edges. Canvas loss/reduced motion retain static artwork. Pausing, offscreen suspension, responsive artwork changes and context restoration preserve the simulation state. The countdown's hanging strands use the same damped model; grounded brass arrangements remain still.

Eight unit checks passed: countdown timezone/rollover/expiry/invalid inputs and five physics checks, including equivalent trajectories at 30/60/120 Hz and settling after wind ceases. Nineteen distinct affected Edge browser checks passed across focused runs: nine breeze/handwriting/countdown checks, eight bilingual cover sizes plus paused resizing, and the couple-opening flow. Countdown checks use a New York browser timezone to verify the correct IST target, tick updates, zero state, English/Telugu, section order, pause/reduced motion and zero axe violations. A hidden lazy-loaded garland is intentionally excluded from image-decode checks on mobile.

Standalone Edge, Firefox and WebKit reviews found no runtime/asset errors or horizontal overflow. Screenshots of the new section were inspected. Additional English/Telugu checks at 320, 390, 768, 1024 and 1672 px confirm all counter numbers and labels fit without overlap. Earlier breeze pixel comparisons found zero movement at the fixed toran supports while leaf tips moved in all three engines. Paused cover shader values remain identical through desktop/portrait/desktop resizing; screenshot byte equality across resizing is unsuitable because text and texture edges are rerasterized. Strict TypeScript, production build and ESLint passed. In-app Browser remains unavailable because its environment metadata lacks `sandboxPolicy`; standalone Playwright supplied QA. Physical 120 Hz output was not measured.

Artwork sources and exact built-in image-generation prompts are recorded in [countdown/PROMPTS.md](../asset-sources/countdown/PROMPTS.md). The public assets total approximately 469 KB and are loaded after entering the invitation.

## November 2, 2026 — simultaneous handwriting and smoother section fades

Both names now begin and finish on the same browser animation frame on the cover and main couple section. Stroke durations follow the actual pen-path lengths with a smooth velocity curve and brief pen lifts. The cover reveal completes in about 2.9 seconds after the fabric clears, preserving the faster pacing. Main-page headings no longer receive a second fade inside already-animated content. Lazy-loaded content receives the same reveal, and completed/interrupted fades release temporary layer hints. The couple's breeze now writes transforms only to the moving cutouts instead of changing inherited CSS variables throughout the hero.

All **45 browser tests passed** across two non-overlapping runs (9 motion/experience checks and the remaining 36 cover, invitation and music checks). New tests verify matching start/end frames at 390 and 1440 px, stable title bounds, and readable names when reduced motion interrupts the writing. All **3 existing motion-model tests** passed, including equivalent gravity trajectories at 30, 60 and 120 Hz. Production build, strict TypeScript and ESLint passed. The real local RSVP test record was removed after verification.

Additional Edge and Firefox desktop and WebKit phone reviews checked **63 visible content reveals** across all sections without stuck opacity, leftover layer hints or runtime errors. The Edge review deliberately held back the gallery module until after the main entrance to verify late-content animation. English/Telugu changes and reduced-motion cleanup passed in all three browsers. Partial handwriting and completed-page screenshots were inspected. These are browser and simulation checks; physical 120 Hz rendering was not measured. Actual output frame rate depends on the screen, browser and device. The in-app browser connection still lacks sandbox metadata, so standalone Playwright was used.

## November 2, 2026 — header removal and couple composition alignment

Removed the main header and placed music, motion, language and guest controls in normal flow below the framed couple scene. Desktop starts at y=0 and fills the viewport. The portrait frame proportions, name placement and spacing follow the second supplied reference; the approved photo placeholders remain. Three separate transparent assets replace the distorted garland, narrow lamp and stretched rangoli. The garland uses naturally scaled segments and the hanging lamps retain gravity/damping motion about their chain anchors.

The complete Edge browser suite passed **42/42 tests**, including the real RSVP receipt; its synthetic local record was removed afterward. After final accessible-label and landmark corrections, all **16 affected interaction checks** passed again. TypeScript, production build and ESLint passed. Additional normal-motion checks in Edge (1898×1048), Firefox (1440×900) and Playwright WebKit (390×844) reported no runtime errors or failed requests, and the complete English and Telugu pages returned **zero axe violations**. Screenshots at 1672×941, 1440×900 and phone sizes were visually inspected; the framed hero has no overlaid controls or horizontal overflow. The in-app browser still cannot connect because of missing sandbox metadata, so standalone Playwright provided browser QA. Physical-device testing was not performed.

## November 2, 2026 — reference-inspired couple introduction

The first main-page section now uses separately generated and optimized artwork, live bilingual text, portrait placeholders approved by the user, and a GSAP entrance after the knot transition. Strict TypeScript, ESLint and production build passed. The couple interaction test verifies the transition, complete names, image loading, pause/resume, reduced motion and the scroll link. English/Telugu reflow includes the new names and portrait frames at 320–1440 px. The existing letter-opening action remains in the invitation section immediately below.

The full 42-test run passed 41 checks; the RSVP database write succeeded but an old page-wide status locator also matched the music announcement. That assertion was scoped to the RSVP section and passed on a separate rerun. The new couple section and the full English/Telugu pages returned zero axe violations in the selected WCAG rules. Edge, Firefox and Playwright WebKit smoke checks completed without runtime errors. Desktop, phone and Telugu screenshots were reviewed. The in-app browser connection still reports missing environment metadata, so standalone Playwright was used. Physical devices and field performance were not measured.

## October 30, 2026 — layered cover and flowing silk revision

- Strict TypeScript, ESLint and production build passed.
- Complete Edge interaction suite: **27 passed**. After the final scrollbar-gutter correction, the 11 cover-specific tests passed again.
- Cover fits 320, 360, 375, 390, 430, 768, 1024 and 1440 px in English and Telugu, with no horizontal overflow or failed artwork requests.
- Native-dialog focus, pause, Skip/Escape, reduced motion and fallback without WebGL passed. The real WebGL cloth reveal was visually inspected through completion. No rendering loop remains active after it completes.
- New cover, English main page, Telugu main page and decorated invitation dialog: **0 axe violations** in the selected WCAG rules.
- Firefox and Playwright WebKit production smoke flows: **4 passed**, covering 390 px with reduced motion and 1440 px with the animated reveal. No runtime errors were reported.
- Separate full-resolution PNGs and mobile/desktop WebP derivatives were visually inspected on cream backgrounds. Desktop and mobile screenshots were reviewed after correcting a blank right-hand gutter and adding the foreground floor layer.
- Automated RSVP testing created one clearly identified local QA reply; that synthetic reply was removed afterward. This revision changes no API or backend behavior.

The in-app Browser tool remains unavailable (`missing field sandboxPolicy`); tests used standalone Playwright with installed Edge, Firefox and WebKit. Physical devices were not tested. **The loading measurements below belong to the October 27 build and do not describe this larger illustrated cover.** No updated field performance score is claimed.

## October 27, 2026 — expanded invitation baseline

Completed October 27, 2026 against the earlier expanded invitation.

| Check | Result |
| --- | --- |
| Frontend/server strict TypeScript, ESLint, production build | Pass |
| SQLite/D1 API and calendar suite | 7 passed |
| Edge browser interaction/reflow suite | 16 passed |
| NestJS strict TypeScript and ESLint | Pass |
| NestJS integration suite with actual isolated MongoDB 8.0.16 | 9 passed |
| Full browser → Vite proxy → NestJS → MongoDB → receipt | Pass |
| Authenticated Docker/Mongo persistence across restart | Pass; see backend/VERIFICATION.md |
| Axe WCAG 2 A/AA, 2.1 AA, 2.2 AA: intro, English, Telugu, gallery dialog | 0 violations |
| Firefox and Playwright WebKit: 390 and 1440 px smoke flows | 4 passed, no runtime errors |
| Reflow: 320, 360, 375, 390, 430, 768, 1024, 1440 px | No horizontal overflow in either language |

Browser coverage includes silk entry, Skip/Escape, session preference, focus restoration, native invitation dialog, keyboard ritual tabs, decorative joy interaction, explicit audio controls, gallery arrows/swipe/Escape, accessible lightbox, closing reveal, share links without guest query data, clipboard denial/manual fallback, map link, FAQs, form validation, real storage, API failure retaining fields, deferred RSVP loading from shortcuts/direct links, language persistence, reduced motion, rapid forward/reverse scrolling and desktop-to-mobile resize. The direct RSVP test found a deferred-loading regression; it was fixed and the final 16-test run passed.

Backend coverage includes receipts, idempotent retries, conflicting retry rejection, optional event IDs, strict validation, consent, honeypot, body limits, origins, methods, atomic rate limiting, inert SQL-like text, declines counting zero guests, protected export/deletion and calendar timezone/escaping/folding. All writes use isolated databases or explicitly named local QA records; no production guest reply was submitted by automation. The extra browser/Mongo test uses a disposable real Mongo process and shuts it down afterward.

Screenshots were visually reviewed for the entry (including 320 × 568), hero, letter, family cameos, woven scene, celebration rows, traditions, illustration gallery, guest details, RSVP and closing note in desktop/mobile compositions. A stretched woven image and duplicate SVG gradient IDs were corrected. Full screenshots and axe reports are in the ignored `artifacts/` directory.

## Loading measurements

The production build is measured with Edge, a 4× CPU slowdown, 1.6 Mbps download and 150 ms latency. These are local lab measurements, not field Core Web Vitals or a Lighthouse score.

| Viewport | Opening LCP | CLS | Blocking time during load | Initial transfer |
| --- | --- | --- | --- | --- |
| 390 × 844 | 2.676 s | 0.0050 | 310 ms | 423 KB |
| 1440 × 844 | 2.368 s | 0.0023 | 135 ms | 423 KB |

Optimizations include gzip in the production preview, preloaded opening silk and title font, hero artwork loaded at entry, main scenes mounted after entry, subset serif fonts, deferred RSVP dependencies, lazy gallery code and lazy below-fold images. Initial JS is approximately 141 KB gzip; RSVP code is a separate 48 KB gzip chunk. No failed asset requests were observed. The mobile LCP in this deliberately throttled run remains slightly above 2.5 seconds; no unsupported performance score or real-user percentile is claimed.

## Boundaries

The in-app Browser could not connect because its tool returned an environment metadata error. Separate Playwright browsers were used. Playwright WebKit is not physical iPhone Safari. Physical-device feel, screen-reader speech output and native OS share-sheet delivery remain untested. Automated scans are not accessibility certification. Sound controls were tested; subjective audio quality was not measured.

Exact date/year, Muhurtham, venue pin, family names, real portraits and video remain configurable until supplied. Calendar and countdown are intentionally absent without confirmed timestamps. Original illustrations are labeled as illustrations.

The Nest/Mongo implementation is tested and deployable, but Sites continues running the D1 adapter. Public Node/Mongo deployment requires an appropriate host and environment configuration. Site audience remains owner-private. Publication and authorized production HTTP checks are confirmed separately by the deployment result.

## Reference cover refinement — October 31, 2026

The second supplied invitation image is now the cover reference. Desktop and portrait artwork, small mango leaves, a separate gold Vinayaka, smaller centered names, the lotus divider and burgundy button replace the older layered composition. The inner invitation uses the same artwork. See COVER-ASSETS.md for final assets and generation prompts.

- Production TypeScript/Vite/Worker build: passed.
- Full Edge browser suite: 27 tests passed, including opening, cloth fallback, Escape, focus, session state, responsive English/Telugu, gallery, sharing, RSVP persistence and retry behavior.
- Updated cover axe checks: zero WCAG 2 A/AA, 2.1 AA and 2.2 AA violations in English and Telugu.
- Visual screenshots reviewed at 1584 × 993 (reference proportions), 1920 × 1200, 1440 × 900, 1024 × 768, 768 × 1024, 390 × 844, 320 × 568 and 844 × 390. All artwork requests succeeded and no horizontal overflow was observed.
- A prior v3 welcome session still shows the refreshed cover once; the new v4 session preference then preserves the normal entry behavior.
- The single synthetic local RSVP created by this run was removed by its exact receipt and timestamp. No production RSVP was submitted.
- Screenshot and measurement evidence: artifacts/reference-cover-*.png and artifacts/reference-cover-review.json (ignored local QA files).

The in-app browser connection failed due to environment metadata. Verification used the project's separate Playwright/Edge browser. Generated illustrations closely follow the supplied reference but are not pixel-identical reproductions. Physical phones were not tested.

## Saree arrival and living cover — October 31, 2026

The arrival now progresses through a single red saree sweeping to the right, the animated reference cover, and five main landing-page chapters. Cover names and ornaments reveal in sequence; mango foliage, hanging lamps and corner leaves move subtly while the scene remains legible. Main headings reveal on scroll without splitting Telugu text.

- Final Edge suite: 31 passed. Covers first-paint silk with a delayed application bundle, automatic reveal before the invitation button, five chapters/navigation links, returning sessions, reduced-motion changes, unavailable texture, missing/lost WebGL, actual frozen artwork while paused, responsive source switching, focus, sharing, gallery, RSVP persistence and retry.
- Firefox and Playwright WebKit: all four desktop/mobile arrival-to-main flows passed with no runtime errors or horizontal overflow. Physical iOS/Android devices were not tested.
- Axe: zero tagged WCAG 2 A/AA, 2.1 AA and 2.2 AA violations for the cover and full English/Telugu landing page.
- Recorded desktop, 390 px and 320 px first-visit flows, and visually inspected the covered silk, curved moving edge, completed cover and main hero. Reports found five main chapters, no runtime errors and no overflow at each size.
- Screenshot comparisons confirmed changes in the foliage region while the central paper/text remained stationary; the pause test confirms identical artwork frames after pausing.
- Resources are capped at two million pixels per canvas; observers, shaders, buffers and frame loops are released when their scene closes. Hidden tabs pause animation. These implementation limits are not an FPS benchmark or a guarantee on every device.

Local evidence: artifacts/motion-review.json, artifacts/motion-cross-browser.json, artifacts/saree-*.png, artifacts/living-cover-*.png and artifacts/motion-video/*.webm. The in-app browser connection remained unavailable; the existing separate Playwright browsers provided verification. No production guest data was submitted.

## Invitation cover on every reload — October 31, 2026

The session flag now remembers only the first saree reveal. Every full reload shows the Open invitation cover again, including reloads with a section anchor such as #rsvp. Reaching the cover marks the saree as seen, so reloading before pressing Open invitation also returns directly to the cover. Fresh direct section links retain their existing behavior.

Targeted browser validation: 12 tests passed, covering first arrival, repeated reloads before/after entry, reloads from a section URL at desktop and mobile widths, keyboard focus, reopening all five chapters, and English/Telugu layouts from 320 to 1440 px. This supersedes earlier notes that reloads bypass the cover.

## Split pancha and saree opening — October 31, 2026

The opening is now half ivory pancha on the left and half red saree on the right, with one synchronized outward reveal. The first paint uses the same split while the application loads. Fabric sampling preserves motif proportions and the center-facing gold borders on phones. The invitation cover still returns on every reload.

- Cover suite: 18 scenarios exercised, including bilingual widths from 320 to 1440 px, repeated reloads, five chapters, focus, reduced motion, pause, unavailable textures, missing WebGL and context loss. All five affected graphics/first-paint/fallback regressions passed again after the final portrait-crop and shader precision correction.
- Final Firefox and Playwright WebKit checks: all four desktop/mobile flows passed with both cloth meshes active, no runtime errors, no horizontal overflow, five chapters and the returning cover after reload.
- Final recorded Edge flows at 1440 × 900, 390 × 844 and 320 × 568: two active cloth meshes, no runtime errors, no overflow and five chapters. Inspected closed, parting and completed-cover screenshots; the pancha travels left and the saree travels right.
- Both cloth canvases together are capped at two million pixels. Independent fallbacks preserve the remaining cloth if one graphics context fails. Hidden tabs pause the shared timeline and frame loop.
- New original: asset-sources/pancha-silk-original.png. Delivery: public/art/pancha-silk.webp (131,642 bytes). Built-in Imagegen provenance and the exact final prompt are in COVER-ASSETS.md.

Local QA evidence: artifacts/split-cloth-review.json, artifacts/split-cloth-cross-browser.json, artifacts/split-*.png and artifacts/split-cloth-video/*.webm. The in-app browser remained unavailable because of its environment metadata error; separate Playwright browsers supplied these checks. Physical devices and real-device frame rates were not measured. No production guest data was submitted.

## Connected wedding knot and anchored motion — October 31, 2026

The latest attached reference supersedes the split panels: a connected ivory-pancha and burgundy-saree knot settles and gradually disappears before the invitation's staggered entrance. Lamps use driven, damped pendulums around fixed suspension points. Leaves bend from their stems; the standing brass lamp is excluded from banana-leaf motion. Flame brightness changes independently. Text and button effects use transforms and opacity. Cover shaders are prepared behind the cloth to avoid compiling them as the text first appears.

- Full Edge browser suite: 35 passed. This includes English/Telugu layouts, the first-paint knot, fallback and missing images, context loss, actual frozen artwork while paused, returning cover after reload, five chapters, keyboard focus, accessibility checks, sound, gallery, sharing and RSVP persistence/retry.
- Three simulation/performance unit checks passed: matching pendulum trajectories at 30/60/120 Hz, bounded pause/late-frame behavior, and bounded adaptive raster quality.
- After the final shader precision and preparation changes, four affected opening/pause/fallback/mobile regressions passed again. Production TypeScript/Vite/Worker build passed.
- Final production Firefox and Playwright WebKit checks: four desktop/mobile flows passed with active knot and cover graphics, five chapters, focus restoration, reload cover, no runtime errors and no horizontal overflow.
- Inspected the connected knot, partial fade, completed cover and main page at desktop and phone sizes. Final asset paths and the exact built-in Imagegen prompt are recorded in COVER-ASSETS.md.
- The optional wedding-song link uses the label-provided YouTube recording. Telugu copy, destination and absence of an autoplay player were checked. No MP3 was downloaded or bundled.
- Removed the single synthetic local RSVP created by this run using its exact receipt, creation timestamp and test email. No production guest data was submitted.

Production frame-callback timing was sampled in headless Edge at 1440 × 900 / DPR 1 and 390 × 844 / DPR 2, without video capture or concurrent browser checks. Each scene's first 500 ms is excluded from the steady-state sample:

| Viewport | Scene | Callback samples | Median | P95 | Intervals over 25 ms |
| --- | --- | ---: | ---: | ---: | ---: |
| 1440 × 900 | Knot | 469 | 6.1 ms | 6.2 ms | 0 |
| 1440 × 900 | Cover | 1177 | 6.1 ms | 6.2 ms | 0 |
| 1440 × 900 | Main entrance | 468 | 6.1 ms | 6.2 ms | 0 |
| 390 × 844 | Knot | 450 | 6.1 ms | 6.2 ms | 0 |
| 390 × 844 | Cover | 1161 | 6.1 ms | 6.2 ms | 1 |
| 390 × 844 | Main entrance | 472 | 6.1 ms | 6.2 ms | 0 |

These are requestAnimationFrame intervals following this machine's approximately 165 Hz clock, not GPU presentation measurements or a physical-phone FPS guarantee. Initial loading still included main-thread work up to 245 ms while the first-paint cloth was present; a 54 ms task was also recorded at main-page mounting. The mobile cover sample contained one interval above 25 ms. Physical devices, thermal throttling and slow-network behavior were not benchmarked. No universal 60/120 FPS claim is made.

Evidence: artifacts/physics-frame-timing.json, artifacts/physics-cross-browser.json, artifacts/knot-visual-review.json, artifacts/knot-*.png and artifacts/physics-cover-*.png. The in-app browser connection remained unavailable due to environment metadata; separate Playwright browsers provided verification.

## Letter-paced name reveal — October 31, 2026

Sathvik and Harika now reveal letter by letter on the invitation cover and main hero. The existing fonts remain intact: a moving ink mask follows measured grapheme boundaries, preserving cursive joins and Telugu shaping. This is a writing-style reveal, not a traced pen-path animation. The cover introduces Sathvik, the ampersand, then Harika before the divider, month and invitation button. Whole-word layout space stays reserved throughout. Reduced motion shows the complete names immediately, including when the preference changes during a letter; the names also remain visible while the cover fades away.

- TypeScript, production Vite/Worker build, ESLint and whitespace validation passed.
- Twenty targeted Edge checks passed: eight bilingual cover widths, eight bilingual main-page widths, first arrival, five sections, repeated reloads and dialog accessibility.
- Five final production writing flows passed in Edge (desktop, phone and Telugu), Firefox (phone) and Playwright WebKit (Telugu phone). Verified sequential names, stable title bounds, completed lettering without residual clipping, button readiness, focus, reload replay and reduced-motion changes during writing. No runtime errors or horizontal overflow were observed.
- Visually inspected partial and completed writing screenshots, plus the main hero, at desktop and phone sizes. Existing artwork and connected-cloth opening are preserved.

Evidence: artifacts/name-writing-review.json, artifacts/name-writing-review.mjs and artifacts/name-writing-*.png (ignored local QA files). The in-app browser still reported its sandbox metadata error; separate Playwright browsers supplied verification. Physical phones and presentation frame rates were not measured for this change. No guest data was submitted.

## Typewriter lettering — October 31, 2026

The requested After Effects-style typewriter now supersedes the moving ink mask. Each complete character appears at a discrete, evenly spaced moment, with a fine gold cursor that blinks gently and fades after each name. Complete-name layout space remains reserved. The visible prefix uses the original script font and native text shaping; Telugu combining marks appear together. The accessible name stays complete throughout. Interrupting either cover or hero animation with reduced motion restores the full text and removes the cursor.

Production TypeScript/Vite/Worker build and whitespace checks passed. Four production browser flows passed in Edge (1440 px English and 390 px Telugu), Firefox (390 px English) and Playwright WebKit (390 px Telugu). Captured and checked every typed prefix against the expected grapheme sequence, stable heading bounds, cursor completion, five sections, reload replay and mid-animation motion changes. No runtime errors or horizontal overflow were observed. Desktop and phone partial/completed screenshots were inspected. Evidence is in artifacts/typewriter-review.json and artifacts/typewriter-*.png. The in-app browser connection remains unavailable; these checks used separate Playwright browsers. No guest data was submitted.

## Handwritten pen strokes — October 31, 2026

The user's clarification replaces the typewriter completely. English Sathvik and Harika now use actual curved pen trajectories through the Great Vibes letterforms. SVG stroke masks draw loops and downstrokes continuously, with separate pen lifts for crossbars and the i dot. There is no typing cursor, prefix replacement or horizontal wipe. Both the cover and main hero use the same calligraphy. The slower sequence finishes the names before introducing the button. Telugu retains native text shaping with a gentle whole-name fade; it does not use the English pen paths.

- Production TypeScript/Vite/Worker build passed; whitespace checks passed.
- Seventeen targeted Edge tests passed: eight bilingual cover widths, eight bilingual main-page widths, and first arrival through all five sections. The opening assertion now allows the longer handwriting sequence.
- Four final local drawing flows passed: Edge desktop and phone, Firefox phone and Playwright WebKit phone. Verified a partially drawn curved stroke with later letters still hidden, stationary heading bounds, completed paths, cursor removal, reload replay, five sections, and reduced-motion interruption on both cover and hero. No runtime errors or horizontal overflow were observed.
- Inspected partial S and H strokes, finished cover lettering and the main hero at desktop and phone sizes. Adjusted main-page lettering to retain room for flourishes; all visible glyph bounds fit within the tested page widths.
- Font outlines and hand-traced pen paths are in src/lib/animation/handwritingPaths.ts. The Great Vibes SIL Open Font License is distributed at public/art/lettering/GreatVibes-OFL.txt. A full-stroke coverage comparison exposed at least 99.5% of every original glyph before the final mask is removed to show the exact complete letterform.

Evidence: artifacts/handwriting-review.json, artifacts/handwriting-*.png and the ignored lettering preparation scripts. The in-app browser still reported the sandbox metadata error; separate Playwright browsers provided verification. Physical devices and presentation FPS were not measured. No guest data was submitted.

## Downloaded wedding-song playback — October 31, 2026

The invitation now plays the original MP3 downloaded from TTD's official free-download catalogue: Pidikita Talambrala, Vani Jairam, Annamayya Sankeertana Vahini, track 12. Full provenance, the official download announcement, and the unchanged file checksum are in [MUSIC.md](MUSIC.md). TTD's recording replaces the synthetic chimes and external song link; the unsuccessful YouTube experiment has been removed.

Open invitation requests playback directly within the guest's click handler, then gently raises volume to 35% over 1.4 seconds where supported. A single looping audio element serves the floating pause/resume control and footer song button. Reload restores the cover and waits for another click. Playback errors and browser restrictions display a usable retry action without claiming music is playing. Local production serves audio/mpeg with byte ranges; the Worker and local server share a self-origin media policy without third-party player scripts.

- Production TypeScript/Vite/Worker build and whitespace check passed.
- Five music tests passed: real MP3 playback, volume fade, pause/resume, looping and reload at 390px and 1440px, recovery from browser playback rejection, retry after an unavailable audio response, and cancellation of a slow download. Only failure conditions are simulated; successful playback uses the actual MP3.
- Three affected cover, reload and invitation/navigation tests passed using the actual MP3, including Telugu song labels and source credit.
- Four production-page flows passed in Edge desktop with the full opening animation, Edge phone, Firefox phone and Playwright WebKit phone. All advanced beyond two seconds unmuted at volume 0.35, with a duration of approximately 300.93 seconds, and successfully paused/resumed. No runtime errors, CSP violations or horizontal overflow were observed.
- Edge desktop and phone Web Audio analyser measurements confirmed a nonzero decoded audio signal (peak approximately 0.204), beyond merely checking the control's label or elapsed time.
- Local production audio range checks passed: first 100 bytes and suffix 100 bytes returned 206 and correct Content-Range; an out-of-bounds range returned 416. The MP3 retains its original 4,814,810 bytes.
- Visually inspected the phone view with the compact music control and preserved invitation artwork.

Evidence: artifacts/native-song-review.json, artifacts/native-song-review.mjs and artifacts/native-song-*.png. The in-app browser connection still failed with its sandbox metadata error; separate Playwright browsers supplied these checks. Physical phones and speakers were not tested. No production guest data was submitted.

## Two-fabric opening and knot transition — October 31, 2026

Restored the earlier two-panel cloth opening from source revision cce264c: cream panche on the left and red saree on the right, revealing the invitation cover outward from the center. The static first paint uses the same two fabrics, so the knot no longer appears while the app bundle loads. The session key is now v8, allowing returning visitors to see the restored opening once; subsequent reloads still show the invitation cover.

Pressing Open invitation starts the song and mounts the knot transition. Its paper veil fades over the cover before the cover disappears; the joined cloth then settles and fades into the main page. Main-page handwriting begins only after the transition finishes, with focus transferred to its heading. A repeated click cannot start duplicate transitions. Reduced motion skips the fabric animations, including when enabled during a transition; Escape can finish each stage. Missing textures and lost WebGL contexts retain working CSS/image fallbacks.

- Production TypeScript/Vite/Worker build and whitespace check passed.
- Eight targeted flow tests passed: correct fabric/knot order, no-WebGL fallback, failed knot plus motion-preference change, missing knot recovery, correct pre-bundle paint, context loss in each transition, missing fabric recovery with repeated clicks, and keyboard completion/reload.
- Three further checks passed: repeated reloads including section URLs at 390px and 1440px, and the decorated invitation dialog's accessibility scan.
- Three production flows passed: Edge desktop, Edge phone and Playwright WebKit phone. Both fabrics occupy exactly half the viewport. The knot appears only after the button click; the hero remains hidden until completion. All five chapters, focus, playback through the transition, and cover restoration after reload were verified. No runtime errors, failed resources, CSP violations or horizontal overflow occurred.
- Visually inspected the restored fabric opening and phone knot transition. The existing silk textures and original knot asset are reused; the restored renderer adds the existing adaptive raster-quality control.

Evidence: artifacts/reveal-order-review.json, artifacts/reveal-order-review.mjs and artifacts/reveal-*.png. The in-app browser connection remained unavailable, so separate Playwright browsers provided QA. Physical devices and 60–120 FPS presentation were not measured. No production guest data was submitted.
