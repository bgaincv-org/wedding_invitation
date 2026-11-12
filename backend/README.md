# Wedding RSVP API — NestJS / MongoDB

This is a complete, independently deployable Node backend. It uses NestJS, TypeScript strict mode, Mongoose and MongoDB with REST routes under `/api/v1`. It does not run inside Cloudflare Workers. The invitation's existing Sites preview uses its D1 compatibility service until this Node backend is hosted and routed to the frontend.

## Run

Requires Node.js 24+ and MongoDB 8+. No production credentials are included.

```sh
cd backend
npm ci
```

Copy `.env.example` to `.env`, set `MONGODB_URI`, and generate a unique `RATE_LIMIT_SECRET` of at least 32 characters. Leave `ADMIN_TOKEN` empty if you do not need admin access; a configured token must be at least 32 characters. Set the exact frontend origins in `ALLOWED_ORIGINS`, with no paths/trailing slashes.

```sh
npm run build
npm start
```

The API defaults to `http://127.0.0.1:3002`. Forward frontend `/api/v1` requests to that address in local Vite or your production reverse proxy. The browser should use relative `/api/v1/rsvp` routes where possible. If serving the API on a separate origin, configure its full API base URL in the frontend and add the invitation's exact origin to `ALLOWED_ORIGINS`. For development, `npm run dev` builds and watches compiled output; run `npm run build:watch` in a second terminal to continuously compile source changes. Compiling with TypeScript preserves Nest's required decorator metadata.

The API uses a startup-validated environment. It rejects unsafe origin configuration, short secrets and invalid MongoDB URIs. Production invitation origins must be HTTPS. A failed startup prints a generic error without leaking the URI, credentials or submitted guest details.

## Docker

Set `ALLOWED_ORIGINS` to the invitation's exact HTTPS origin in `.env`, and set distinct random hex values for `ADMIN_TOKEN`, `RATE_LIMIT_SECRET`, `MONGO_ROOT_PASSWORD` and `MONGO_APP_PASSWORD`. Hex avoids URI escaping mistakes in the Compose connection string.

```sh
docker compose up --build -d
docker compose ps
```

The API binds only to loopback on the host. MongoDB has no public port, authenticates the application with a dedicated `readWrite` database user, and stores records on the `wedding_mongo` volume. The root credential is not given to the API. Put an HTTPS reverse proxy in front of the API. Restrict networking and backups. Do not use `docker compose down -v` against guest data: that removes the data volume.

`TRUST_PROXY` is empty by default, so spoofed forwarded IP headers are ignored. If your proxy has a known stable IP/CIDR, configure only that address/range. Do not use a blanket trust setting. Without trusted proxy configuration, requests behind one proxy share a rate-limit bucket; configure the real proxy before public launch.

## API contract

`POST /api/v1/rsvp` requires `Content-Type: application/json` and an exact allowed `Origin`:

```json
{
  "name": "Guest name",
  "email": "guest@example.com",
  "attendance": "yes",
  "guests": 2,
  "note": "An optional message",
  "consent": true,
  "website": "",
  "requestId": "a client-generated UUID",
  "eventIds": ["wedding"]
}
```

Names are trimmed, email normalized, unknown fields rejected, and event IDs checked against `WEDDING_EVENT_IDS`. Attendance is `yes`, `no`, or `maybe`; guests is an integer from 1 through 6. Declines are stored with zero attendees and no selected functions. `website` is an empty honeypot. Note length is limited to 500 characters, and JSON bodies to 8 KB.

Success returns `{ "saved": true, "receipt": "16-CHAR-HEX" }` only after MongoDB confirms the insert. A matching repeated `requestId` returns the original receipt; reusing it with changed data returns 409. Concurrent retries cannot create duplicates because MongoDB has a unique request ID index. This is submit-and-confirm functionality, not a public guest-response lookup or update endpoint. The reference is not an authentication token.

`GET /api/v1/health` pings MongoDB. All responses are `no-store` and include a server-generated request ID. Logs contain only event names, request IDs, method, status and duration; no payloads, email, notes, origins, query strings, auth headers or stack traces.

RSVP throttling is an atomic MongoDB counter, shared across replicas: by default 10 new requests per IP per 10-minute bucket. Window-specific HMAC identifiers avoid storing raw IPs, and a TTL index removes old buckets. Matching idempotent retries are permitted without consuming another submission slot. Configure edge-level rate limits too for broad request-flood protection.

## Organizer access

`GET /api/v1/admin/rsvps` requires `Authorization: Bearer <ADMIN_TOKEN>`. It returns up to 100 records with `nextCursor`; pass that opaque cursor to the next `?cursor=...` request. It omits Mongo IDs, request IDs and payload hashes from records. It never exposes a guest lookup to unauthenticated visitors.

`DELETE /api/v1/admin/rsvps/:receipt` requires the same bearer secret. It performs an idempotent deletion. Admin endpoints also have a separate rate-limit bucket. They fail closed if `ADMIN_TOKEN` is absent, and comparisons use fixed-length cryptographic digests with timing-safe equality. Never embed this token in frontend code or `VITE_*` settings.

Set `RSVP_ENABLED=false` to stop new submissions. Keep `WEDDING_EVENT_IDS` synchronized with the family-approved frontend events. Keep daily encrypted backups, restore-test them, restrict organizer access, and agree a retention/deletion date with the family. No automatic email is sent or falsely promised.

## Validation

```sh
npm run build
npm run lint
npm test
npm run test:container
```

Integration tests start a real isolated MongoDB process using `mongodb-memory-server`, not an in-memory JS substitute. They never connect to the configured production database. The first run may download a MongoDB test binary. Tests exercise durable writes, duplicate/conflicting requests, concurrent retries, DTO checks, body/origin boundaries, rate limits, Mongo health, admin access and deletion. The temporary database is discarded on completion.

The optional container test requires Docker. It generates a uniquely named disposable Compose project and test-only credentials in memory, exercises persistence across a MongoDB restart, then removes only that test project's containers and volume. It does not use the real wedding database. See `VERIFICATION.md` for performed results and deployment boundaries.

Implementation follows [Nest validation](https://docs.nestjs.com/techniques/validation), [Nest MongoDB integration](https://docs.nestjs.com/techniques/mongodb), and [Nest rate-limiting/proxy guidance](https://docs.nestjs.com/security/rate-limiting). The limiter here uses MongoDB atomics rather than process-local counters so multiple Node replicas share limits.
