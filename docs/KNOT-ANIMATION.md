# Silk knot transition

The opening gesture lasts **4.35 seconds**, reduced from 9.2 seconds. Two separate silk surfaces approach, cross in depth, form an open loop, thread, tighten, and dissolve. The free hems continue a small damped follow-through into the dissolve.

## Motion and materials

- Continuous Hermite choreography carries velocity through the tying poses. Sampling the animation timestamp directly supports native 60, 120, 144 Hz and higher refresh rates; a slow frame does not create a simulation backlog.
- Each cloth has 145 length samples and 33 width samples. The GPU builds curved pleats, gathered shoulders, twisting hems, surface normals and perspective from 15 material control frames.
- The original `pancha-silk.webp` and `dharmavaram-silk.webp` supply the actual weave, motifs and gold zari. The material includes directional silk sheen and shadows cast between the cloths, using a 512px shadow map.
- This is procedural 3D cloth with guided tying and inertial hem motion. The choreography keeps the over/under motion repeatable without a runtime cloth solver.
- Portrait screens use a closer view of the knot and hanging hems. The outer lengths enter from the screen edges.

## Opening and lifecycle

`knotPreparation.ts` decodes the textures, compiles the shaders and warms both render passes while the cover is visible. The inactive invitation content also prepares during an idle period before the click. The music still starts with the guest's click.

The knot starts immediately. If preparation is unavailable, entry uses the existing reference image and the same dissolve; late assets cannot replace an already visible fallback. GPU loss and missing images also finish entry. Hidden tabs suspend the motion and fade together. Switching to reduced motion skips the transition and restores focus to the couple heading.

The drawing buffer has a pixel budget and can reduce raster resolution after sustained slow frames. All GPU resources and animation callbacks are released when the cover closes.

## Verification

```powershell
node --import tsx --test tests/tying.test.ts
npx playwright test tests/browser/tying.spec.ts
npm run build
```

The unit checks cover depth order, distinct tails, continuity, velocity through key poses, 30/60/120/144 Hz consistency, buffer reuse, delayed frames and the final dissolve. Browser checks cover 320px/390px/desktop layouts, the initial curtain-to-cover-to-knot flow, late and missing textures, GPU loss, hidden tabs, repeated clicks, reduced motion and focus restoration.

Visual captures and local performance measurements are under `verification/knot-rework/`. The isolated renderer measured about 6.1ms between frames on the local RTX 4060 laptop GPU (roughly 165 Hz). CPU submission p95 dropped from about 1.2ms to 0.1ms in the local comparison. These are measurements on this machine; refresh rate, GPU and browser load determine results on other devices.

The final full opening, measured without taking screenshots during playback at 390px and 1440px, finished in 4.41-4.42 seconds. Median/p95 frame intervals were 6.1/6.2ms, with no sampled interval above 25ms. See `final-flow-performance.json`. The production build, scoped ESLint checks, four motion unit tests and 23 targeted browser checks passed.
