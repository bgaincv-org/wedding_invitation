# Project structure

The frontend is organized by page and feature. `App.tsx` composes the experience; opening choreography belongs to `OpenInvitation`, and the invitation sections belong to `Home`. These are page components within the existing single-page invitation, so section links and the opening transition keep their existing behavior.

```text
src/
  App.tsx                         # Composes pages, footer, dialogs and toast
  main.tsx                        # React entry point and global styles
  Pages/
    OpenInvitation/
      OpenInvitation.tsx          # Cover and opening-phase lifecycle
      OpenInvitation.css
      Components/                 # SilkCurtain, LivingCover, KnotTransition
      animation/                  # Cover, silk and knot renderers/cloth model
    Home/
      Home.tsx                    # Section order and progressive mounting
      hooks/useExperience.ts      # Main-page scroll/reveal lifecycle
      Components/
        Couple/                   # Portraits, toran and local renderer
        Countdown/                # Timer, frames and clock calculations
        Journey/                  # Ceremony trail and footprint geometry
        Invitation/               # Invitation letter
        Family/                   # Family portraits
        Story/                    # Woven journey
        Traditions/               # Ceremony tabs
        Details/                  # Venue, travel and guest information
        Gallery/                  # Lazy gallery and lightbox styles
        RSVP/                     # Section, lazy loader and connected form
        Closing/                  # Closing note and share actions
  Components/
    Audio/                        # WeddingMusic, WeddingSong and audio styles
    Decorations/                  # Shared ornaments and name lettering
    Dialogs/                      # Invitation and sharing dialogs
    Layout/                       # WeddingFooter and FooterArtwork
  hooks/useWeddingInvitation.ts   # Cross-page state, preferences and actions
  services/rsvp.ts                # Browser API client and API error handling
  lib/
    content.ts                    # Localization, safe URLs and welcome rules
    calendar.ts                   # Calendar export, also tested by the server suite
    animation/                    # Shared wind, image mesh and lettering helpers
  styles/
    globals.css                   # Fonts, tokens, reset and base elements
    invitation.css                # Shared invitation styles
    scenes.css                    # Shared scene and chapter styles
    responsive.css                # Final mobile and landscape overrides
  assets/                         # Assets imported into frontend source

shared/                           # Wedding data and shared RSVP validation
server/                           # Local SQLite API and deployed Worker/D1 adapter
backend/                          # Separate NestJS/MongoDB deployment option
public/                           # Stable public URLs for artwork, fonts and audio
asset-sources/                    # Original artwork, reference files and provenance
drizzle/                          # Hosted database migrations
tests/                            # Pure unit/API checks and browser interaction tests
scripts/                          # Build, asset, review and organizer utilities
docs/                             # Configuration, architecture and verification guides
```

## Where to make changes

| Change | Location |
| --- | --- |
| Cover and Open invitation behavior | `src/Pages/OpenInvitation/OpenInvitation.tsx` |
| Main section order | `src/Pages/Home/Home.tsx` |
| A section's UI, CSS or local calculation | Its directory under `src/Pages/Home/Components/` |
| Wedding song playback | `src/Components/Audio/WeddingMusic.tsx` |
| Footer controls or final artwork | `src/Components/Layout/` |
| Language, opening state, sharing or calendar actions | `src/hooks/useWeddingInvitation.ts` |
| Wedding names, dates, events and content | `shared/wedding.ts` |
| RSVP form | `src/Pages/Home/Components/RSVP/` |
| RSVP request/response handling in the browser | `src/services/rsvp.ts` |

## Conventions

- Match the exact directory casing: `Pages`, `Components`, `Home`, `OpenInvitation`.
- Use `@/` for imports from `src/` and `@shared/` for shared contracts. The paths are declared in `tsconfig.paths.json` and mirrored in `vite.config.ts`. Keep server-side imports relative so both server runtimes remain independent of Vite.
- Use relative imports within a feature folder. Keep a component's dedicated CSS and calculation/rendering helpers beside it.
- Put code in shared `Components` or `lib/animation` only when multiple features use it. Page-specific code stays in its page folder.
- Preserve lazy imports for the gallery and RSVP form. Avoid a central barrel that eagerly imports every feature.
- Global styles load in order: globals, component/page styles, invitation styles, scene styles, then responsive overrides. The shared stylesheet boundaries preserve the existing cascade; moving selectors between them requires visual checks.
- Public asset URLs are independent of source paths. Keep originals in `asset-sources` and runtime assets in `public`.
- `backend` and `server` are intentional alternatives, not duplicate frontend folders. See the deployment documentation before changing either runtime.
- Generated `dist`, test output, `artifacts`, dependencies, local database files and environment secrets stay ignored. Preserve local source artwork even when it is not yet referenced.

## Checks

`yarn test` runs all unit/API tests, including countdown, footprint geometry and motion models. `yarn lint` and `yarn build` check the source and production bundles. Browser checks require the running local app; `yarn test:e2e --grep-invert "RSVP validates, persists"` exercises the UI without writing the real-browser RSVP test record. The persistence behavior is also tested against an isolated in-memory database in the unit suite.
