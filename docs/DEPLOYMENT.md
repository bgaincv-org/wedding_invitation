# Frontend deployment

This project deploys as static files. Vercel serves the compiled frontend; it does not need a Node server, Cloudflare Worker, D1, SQLite, MongoDB, Docker, API routes or environment secrets.

## Vercel settings

1. Select the Git repository and branch containing the updated invitation.
2. Set **Root Directory** to the folder containing `package.json`, `index.html` and `vercel.json`. This local checkout is itself the Git root, so use `./` for that repository. Only use `wedding_invitation` if your remote repository actually contains that subfolder.
3. Use **Vite** as the framework and **Node.js 24.x**.
4. The checked-in `vercel.json` sets install to `yarn install --frozen-lockfile`, build to `yarn build`, and output to `dist`. Remove any obsolete dashboard overrides such as `dist/client`, `public`, a backend command or a different root.
5. Push the changes and deploy the new commit. When retrying the previous failed setup, redeploy without the old build cache once.

The single-page-app rewrite sends page routes to `/index.html`; Vercel still serves existing JS, CSS, font and image files directly. Hash links such as `/#moments` retain their existing behavior.

Official references: [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), [build and root-directory settings](https://vercel.com/docs/builds/configure-a-build), and [file-based configuration](https://vercel.com/docs/project-configuration).

## Build output

```text
dist/
  index.html
  assets/          bundled JavaScript, CSS and fonts
  art/             invitation artwork and original SaHa logos
  audio/           retained song asset (playback is disabled)
  ...              favicon, manifest and other public assets
```

Deploy the contents of `dist`, not the repository root, `public`, or the old `dist/client` directory. `yarn preview` is only a local verification server; Vercel hosts the files itself.

`.vercelignore` excludes local data, original asset sources and development artifacts from CLI uploads. `.openai/hosting.json` retains the existing Site identity with a static `dist` target and no database binding; Vercel uses `vercel.json`.

## Before redeploying

```sh
yarn install --frozen-lockfile
yarn test
yarn test:deploy
```

Verify the cover, opening animation, main sections, gallery viewer, venue directions, sharing, calendar downloads and page refreshes. The song controls stay hidden. There are no RSVP requests or database-dependent interactions.

## If Vercel still returns 404

Confirm the deployment uses the new commit, its Root Directory contains this `vercel.json`, and the build logs show `dist/index.html`. Confirm the production domain is assigned to that successful deployment. A local build cannot verify Vercel account settings, domain assignment or which commit is deployed; inspect those in the Vercel dashboard.
