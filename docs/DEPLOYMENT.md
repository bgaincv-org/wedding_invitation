# Deployment and launch

## Sites

The selected project identity is persisted in `.openai/hosting.json`. Reuse it; do not register a second site. The source manifest declares `d1: "DB"` and no static mode because RSVP needs server execution.

`yarn build` produces:

```text
dist/client/                 Vite HTML, JS, CSS, fonts and artwork
dist/server/index.js         Bundled ESM Worker with fetch handler
dist/.openai/hosting.json    Hosting identity and D1 declaration
dist/.openai/drizzle/        Schema migration and journal
```

The Worker routes `/api/*` to the shared validated handler and other requests through the `ASSETS` binding. Sites provisions D1 and applies the schema migration before publication. The package is made from the exact Git source commit being pushed. Use the Sites source workflow and private deployment tools; retain returned version/deployment IDs across retries.

The private publication requires owner authentication. To distribute it to guests, deliberately choose the appropriate audience in Sites after the family approves the invitation. Do not expose the admin secret when changing the audience.

Set `ADMIN_TOKEN` through Sites runtime secret settings for organizer export/deletion. A strong random token of at least 32 characters is required; it is never included in browser code. All application assets and fonts are served from the same origin. The Worker adds CSP, MIME sniffing protection, a restrictive permissions policy and HTTPS HSTS headers. The frontend requires no third-party scripts, cookies, geolocation or analytics.

## Node host

### NestJS and MongoDB

[`backend/README.md`](../backend/README.md) is the complete Node/Mongo runbook. The authenticated Compose stack uses a private Mongo network, a persistent volume and a least-privilege database user. Place the built frontend behind an HTTPS reverse proxy and send `/api/v1/*` to NestJS on port 3002. Set the exact site origin, server-only admin and rate-limit secrets, approved event IDs, and only explicit trusted proxies. Never embed database or admin secrets in `VITE_*` variables. The browser API client uses the same contract as the Sites adapter.

The Nest service has been run, integration-tested, browser-tested and container-tested locally. It is not deployed on a public Node host. Sites currently continues using D1, with the new append-only `0001_rsvp_events` migration. A Node host and persistent Mongo deployment are needed to move production to NestJS. The implementation does not invent hosting credentials or disguise one database as another.

### Standalone SQLite compatibility preview

1. Install Node 24+ and run `yarn install --frozen-lockfile`, then `yarn build`.
2. Set `DATABASE_PATH` to a private persistent volume, `API_PORT`, `HOST` as appropriate, and `PUBLIC_ORIGIN` to the exact HTTPS origin.
3. Set a strong `ADMIN_TOKEN` only if the HTTP administration endpoints are needed. The local organizer CLI remains available to authorized server operators.
4. Run `yarn preview` under a process supervisor. Put it behind an HTTPS reverse proxy. Add CSP equivalent to `server/worker.ts` and HSTS at that proxy.
5. Never use ephemeral container storage for guest replies. Back up SQLite using its backup facilities, not an unsynchronized copy of a live WAL database. Limit filesystem access and restore-test backups.

The initial local schema is applied at startup; subsequent schema changes should use explicit, versioned migrations. Hosted Drizzle migration SQL/journal entries must be append-only once applied. Local and hosted databases are separate.

## Before sharing with guests

- Confirm the wedding year, day, Muhurtham, named venue, map pin, event list and Telugu name spellings with the family.
- Preview the calendar exports after adding exact event start and end times.
- Set the correct audience, verify the production page and `/api/health`, submit one clearly marked test reply, confirm the record privately and remove only that test record.
- Configure the organizer's private access and a data-retention date.
- Test the invitation on an actual iPhone/Android browser and test its native share sheet. Automated QA covers Edge, Firefox and Playwright WebKit at mobile/desktop viewports; WebKit emulation is not a physical iPhone test.
- Keep the October 31, 2026 website launch target separate from the wedding date.
