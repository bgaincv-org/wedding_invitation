# SaHa — Sai Sathvik & Harika

A frontend-only wedding invitation built with React, TypeScript and Vite. The silk opening, couple scene, countdown, invitation letter, wedding journey, venue, SaHa gallery and blessings run entirely in the browser. Sharing and calendar downloads work without an API or database. Music is temporarily disabled; its implementation is retained.

## Run locally

Use Node.js 24 and Yarn 1.22.22 (recorded in `package.json`). From this directory:

```sh
yarn install --frozen-lockfile
yarn dev
```

Open `http://127.0.0.1:3010`. No environment variables, database or backend process are required.

```sh
yarn build
yarn preview
```

The build creates `dist/index.html` and its static assets. Preview serves that production build at `http://127.0.0.1:3010`.

## Deploy to Vercel

Import the repository and select the directory containing this `package.json` and `vercel.json` as the **Root Directory**. This checkout is its own Git repository, so that is normally the repository root (`./`). If you place it inside a larger repository, select `wedding_invitation` instead.

The committed `vercel.json` supplies:

| Setting | Value |
| --- | --- |
| Framework | Vite |
| Install command | `yarn install --frozen-lockfile` |
| Build command | `yarn build` |
| Output directory | `dist` |
| Node.js | 24.x, declared in `package.json` |

Push these changes to the branch connected to Vercel and deploy that commit. No API, database, server command or environment secrets are needed. See [deployment instructions](docs/DEPLOYMENT.md) for fixing an existing project's root/output settings.

## Content and assets

Edit [`shared/wedding.ts`](shared/wedding.ts) for names, dates, hosts, ceremony details and venue links. The reception is 19 December 2026 at 7:00 PM IST onwards; the Muhurtham is 20 December at 3:40 AM IST. Calendar exports preserve these times across timezones.

The gallery currently uses the original SaHa wax seal and Hindi monogram in its existing frames. Authorized photographs can be supplied through `wedding.gallery` later. Runtime artwork and fonts live in `public/`; original source artwork remains in `asset-sources/`. Update `index.html` metadata and its JavaScript-free invitation when event details change.

The current invitation has no RSVP form. The unused RSVP service, database migrations, backend projects and Worker build have been removed. Local ignored data is not included in the deployment.

See [project structure](docs/PROJECT-STRUCTURE.md), [confirmed invitation details](docs/INVITATION-DETAILS.md) and [SaHa artwork](docs/SAHA-ASSETS.md).

## Verification

```sh
yarn test
yarn test:deploy
```

`test:deploy` automatically builds and serves the production frontend on port 5173, then checks desktop/mobile opening, section links, refreshes, asset loading and the absence of backend requests. Browser tests use installed Microsoft Edge. Additional current UI checks:

```sh
yarn test:e2e tests/browser/gallery.spec.ts tests/browser/invitation-details.spec.ts
```

Older review scripts and browser cases include previous designs and should be updated before using them as checks for the current invitation.
