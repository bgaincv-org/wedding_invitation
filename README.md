# SaHa — Sai Sathvik & Harika

A Telugu/English wedding invitation using strict TypeScript, React, Vite, GSAP, ScrollTrigger and Lenis. The illustrated cover opens into the couple scene, Muhurtham countdown, family invitation, seven ceremony moments, venue details with an interactive map, gallery and divine blessings. Two ceremonies have confirmed dates and times; the other ritual timings remain open. Original SaHa artwork, parchment, maroon and gold connect the sections. Portraits and gallery photos remain placeholders until authorized photos are configured. Sound is optional. See [confirmed invitation details](docs/INVITATION-DETAILS.md) and [ceremony artwork and motion](docs/CEREMONY-ASSETS.md).
RSVP uses React Hook Form, Zod, TanStack Query and a centralized API client. A production NestJS/Mongoose/MongoDB service is included in [`backend/`](backend/README.md). The published Sites build retains a working D1 compatibility adapter because Sites runs Workers rather than Node/MongoDB.

## Source organization

Start with [`src/App.tsx`](src/App.tsx), which composes [`Pages/OpenInvitation`](src/Pages/OpenInvitation/OpenInvitation.tsx), [`Pages/Home`](src/Pages/Home/Home.tsx), shared dialogs and the footer. Home sections own their components, styles and local helpers; reusable audio, decorations and layout live in `src/Components`. Use `@/` and `@shared/` imports for cross-feature dependencies. See the complete [folder guide and editing map](docs/PROJECT-STRUCTURE.md).

## Run locally

Requires Node.js 24+ (native SQLite) and Yarn 1.22.

```sh
yarn install --frozen-lockfile
yarn dev
```

Open `http://127.0.0.1:5173`. Vite proxies `/api` to the SQLite-backed API on `127.0.0.1:3001`. If a Vite session is already using this project on port 5173, keep it and start only `yarn tsx server/local.ts`. Do not stop unrelated servers. The default API binds only to loopback.

```sh
yarn build
yarn preview
```

The production preview serves the compiled site and API together at `http://127.0.0.1:3001`. Stop the development API first if it occupies that port, or set `API_PORT` to another port.

## Family configuration

Edit [`shared/wedding.ts`](shared/wedding.ts). The family confirmed **Sai Sathvik & Harika**, the **19–20 December 2026** celebrations, hosts and blessings, and **The Environ Convention** with its full address and Maps search link. The source is the supplied `Slides (1).pdf` and the user's accompanying wording.

- Reception: Saturday, 19 December, 7:00 PM IST onwards, followed by dinner.
- Wedding Muhurtham: Sunday, 20 December, 3:40 AM IST, after Saturday's reception, followed by breakfast. The countdown targets this instant.
- Event timestamps include `+05:30`. Calendar files use UTC. End times were not supplied, so downloads contain a confirmed start without an invented end.
- Date labels always use `Asia/Kolkata`, regardless of the guest's timezone.
- Family names retain the exact supplied Latin spelling in both locale versions; the supplied Telugu blessing names and welcome line are reproduced verbatim.
- Add authorized family portraits and gallery photographs with localized alt text/captions. Original illustrations remain the fallback. The other project's couple photos are not used.
- The RSVP components/API remain available but the form is not part of the current visible page. `rsvpEvents` enables event selection if the form is restored. Set `rsvpEnabled` to `false` to close submissions.
- Static metadata and the JavaScript-free invitation in `index.html` should be updated alongside any future shared-data changes.
## RSVP storage and privacy

Both runtimes accept `POST /api/v1/rsvp`; the SQLite/D1 adapter also retains the original `/api/rsvp` alias. For the NestJS service, follow [`backend/README.md`](backend/README.md), start it on port 3002, then set `RSVP_API_TARGET=http://127.0.0.1:3002` before running Vite. PowerShell: `$env:RSVP_API_TARGET='http://127.0.0.1:3002'; yarn vite`. Do not run the SQLite API for this mode. A full browser-to-Nest-to-Mongo flow is verified by `node backend/scripts/verify-browser.mjs` after building the backend.

Replies are persisted, not just stored in a browser. Local data lives at `data/rsvp.sqlite` (Git-ignored). The Cloudflare Worker uses a D1 binding named `DB`. Browser and server validation share a strict Zod schema. The API enforces same-origin JSON, an 8 KB body limit, explicit consent, a honeypot, a maximum party size, atomic rate limiting and idempotency. SQLite/D1 statements are parameterized. No guest data is logged or served publicly. Declines count zero guests.

The screen shows success only after the database returns a receipt. On failure it retains input and offers retry. Each successful reply is a new response; existing replies are not overwritten by email. Use the reference for corrections/deletion. The form does not automatically send email, and never claims it does.

Local organizer commands:

```sh
yarn rsvps export
yarn rsvps delete REFERENCE
```

Treat exports as private. Back up the SQLite database with appropriate access controls. Set a retention date after the wedding; delete guest records when no longer needed. Restrict the database file to the server account in production.

Optional hosted administration uses `GET /api/admin/rsvps` and `DELETE /api/admin/rsvps/REFERENCE`, with `Authorization: Bearer <ADMIN_TOKEN>`. The secret must be at least 32 characters and is server-only. Both endpoints fail closed until configured. Use the Sites environment-variable tools to set it; never add it to source or `VITE_*` variables. Owner-private Sites also require the Sites authentication boundary. For public deployment, retain the admin token check. No admin password is embedded in the site.

`.env.example` documents environment keys. Set them in the host environment, or use Node's `--env-file=.env` when launching the API. `PUBLIC_ORIGIN` is the exact HTTPS origin for a reverse-proxy Node deployment. Do not trust arbitrary forwarded IP headers; the local server intentionally uses its socket address. The Worker uses Cloudflare's trusted connecting-IP header. Rate-limit identifiers are window-specific hashes and old buckets are removed.

## Deployment

The project supports Sites and a conventional Node host. [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) covers the artifact layout, database migration, secrets, HTTPS, backup and launch verification. New Sites publication is owner-private by default; audience changes are a separate deliberate action before sharing with guests.

## Verification

```sh
yarn test
yarn test:e2e
node scripts/visual-review.mjs
node scripts/accessibility-review.mjs
yarn build
```

Browser tests use installed Microsoft Edge and the running local site. They cover opening/skip/focus, tabs, optional audio, gallery keys/swipe, closing reveal, share failure recovery, real RSVP, direct links, retained values after errors, Telugu persistence and 320/360/375/390/430/768/1024/1440 pixel reflow. `scripts/cross-browser-review.mjs` also checks Firefox and WebKit against the production preview on port 3003. Tests use clearly identified local QA records, never production guests. `artifacts/` and test output are Git-ignored.

The in-app Browser connection was unavailable in this session; a separate headless Edge browser was used. Native OS share-sheet delivery cannot be automated; its clipboard fallback is exercised. See [`docs/VERIFICATION.md`](docs/VERIFICATION.md) for actual results and boundaries.

## Assets and design

[`docs/DESIGN.md`](docs/DESIGN.md) records the concept, cultural sources and artwork prompts. [`docs/COVER-ASSETS.md`](docs/COVER-ASSETS.md) describes the nine separate cover assets and their generation briefs. Original PNGs are in `asset-sources/`; optimized WebP delivery images are in `public/art/`. Run `node scripts/optimize-cover.mjs` to rebuild cover delivery images. Fonts are self-hosted. No generated people are represented as the actual couple, and the imagined architectural artwork is not a venue photograph.
