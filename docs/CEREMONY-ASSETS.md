# Seven celebrations and venue map

The visible wedding journey now contains seven requested moments, in order:

1. Mehendi
2. Pellikoduku & Pellikuthuru
3. Reception
4. Ganesh Puja
5. Kanyadanam
6. Wedding Muhurtham
7. Mangalya Dharanam

`shared/journey.ts` supplies this sequence and the bilingual descriptions. Reception and Muhurtham reference the confirmed records in `shared/wedding.ts`; the other rituals have no invented date, clock time or venue. Mangalya Dharanam is shown after Muhurtham. The venue schedule, countdown, sharing and calendar downloads continue to use the two confirmed events.

## Artwork

Created with the built-in imagegen tool as seven separate transparent illustrations. They are symbolic ceremony still lifes, not photos of this couple or the actual venue. Each has been inspected and uses the invitation's maroon, antique gold, ivory and green palette.

- Originals: `asset-sources/journey-ceremonies/{id}.png`
- Full generation prompt set and provenance: `asset-sources/journey-ceremonies/prompts.json`
- Delivery assets: `public/art/journey/ceremonies/{id}.webp` (512px) and `{id}-small.webp` (256px)
- Rebuild exports: `node scripts/prepare-ceremony-art.mjs`

Exports retain alpha and use responsive sources, lazy loading and async decoding. Original PNGs are not requested by the website. Art has larger, unframed presentation in the timeline. The event navigation links focus the relevant caption; hover/focus movement is limited to transforms.

## Toranam and motion

The gallery toranam previously rendered a 148px-tall background inside a 100px box. It now scales by explicit image height, with extra container space below the complete leaves and hanging flowers. A subtle sway shares the gallery's existing pause, offscreen, visibility and reduced-motion controls.

Footprints still use the queued per-step animation. The seven-event route reserves enough space for both languages and completes every landing after a fast fling. Geometry tests now exercise seven stops. No scroll-linked state updates or extra continuous JavaScript render loop were added.

## Venue

The compact Google map embeds the supplied full venue search and shows The Environ Convention's pin. The highlighted Open venue button retains the exact family-supplied Google Maps search URL. The preview activates for pan/zoom on request and can be locked again so it does not capture ordinary page scrolling.

The button's continuous border pulse and arrow movement animate only opacity and transforms. They pause outside the viewport, in hidden tabs, on request and under reduced motion. The preview has reserved dimensions, lazy loading, a loading label and a direct directions link that remains usable if the external provider is unavailable.

The shared production/Worker content-security policy permits only `https://www.google.com` for embedded frames. Other external frame origins remain blocked.

## Checks

Production build, scoped lint and all 36 unit tests pass. Twenty focused browser cases cover bilingual layouts at 320–1440px, accessibility scans, the full seven-event fling, chapter keyboard navigation, map activation, animation pause/resume, gallery opening and the complete first-visit opening flow. The live provider and the production policy are checked separately from deterministic map-control tests. Screenshots and measured scroll frame timings are in `verification/seven-events/`.

The local production scroll sample recorded 1,913 animation frames over 12 seconds: median 6.1ms, 95th percentile 6.2ms and 99th percentile 12ms, with three intervals above 33ms and a maximum of 90.9ms. This is a headless Edge measurement on this machine, not proof of visible frame delivery on other devices. No runtime errors were recorded; the direct-home test produced expected unused-preload warnings for the opening cloth textures.

Rendering follows the device's display cadence; 120fps cannot be guaranteed across devices, browsers and external map/network activity.
