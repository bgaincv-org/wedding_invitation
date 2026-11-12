# Scroll-driven footsteps

`journeyWalk.ts` queues every footprint reached by the scroll position. It never
marks offscreen prints complete or jumps the walker ahead during a fling. Each
print receives its own 480ms swing and heel-to-toe contact. The normal launch
interval is 300ms; scroll velocity and queued distance smoothly increase the
cadence to catch up, with up to fifteen overlapping strides at the fastest pace.
Each stride retains its full duration.

`WeddingJourney.tsx` coalesces scroll updates into one layout read and one render
per animation frame. Moving prints use transforms and opacity; landing prints
use opacity and a small heel-origin scale. There are no per-frame SVG clipping
changes or animated drop-shadow filters. Buffers are reused between frames and
the animation loop stops after the queue is planted. Hidden tabs pause the clock;
reduced motion displays the complete static trail.

Scrolling upward cancels future strides and removes the prints beyond the new
scroll destination. Scrolling down again animates those steps in order. A long
main-thread stall does not consume an entire landing in one update.

Validation:

- `node --import tsx --test tests/journey.test.ts`: ordered completion, contact
  frames for every step, reverse/replay, cadence, and 30/60/120/144Hz timing.
- `npx playwright test tests/browser/journey.spec.ts --grep "full-route fling|foot swings|fast mobile scroll|both feet point"`:
  real browser scrolling, every footprint's intermediate poses, visible landings
  during a sustained mobile fling, direction changes, and reduced motion.

Rendering follows the display refresh rate. Actual frame rate depends on the
device, browser, display, and other work on the page.
