# Backend verification

Completed October 27, 2026.

- `npm run build`: passed, with strict TypeScript and decorator metadata.
- `npm run lint`: passed.
- `npm test`: 9 integration tests passed against an actual isolated MongoDB 8.0.16 process.
- `node backend/scripts/verify-browser.mjs` from the project root: React form, real Vite proxy, Nest REST service and real isolated MongoDB storage completed successfully; the browser displayed the returned receipt.
- Docker production image: built successfully using Node 24 and production dependencies only.
- `node scripts/verify-container.mjs`: passed against a disposable Compose stack with authenticated MongoDB and a dedicated least-privilege application user.
- Container workflow: database health, real RSVP insert, MongoDB restart, persisted record retrieved through authenticated admin API, unauthenticated admin rejection.
- The test containers and their test-only named volume were removed after verification. No production guest database was connected or modified.

The 9 integration tests cover health/security headers; storage/idempotency/conflicting reuse; concurrent duplicate submissions; strict DTO, consent, honeypot and event validation; CORS/origin/content type/body limits; concurrent atomic rate limiting; declined guest normalization; protected admin export/deletion; and secret-safe environment validation. Rate-limit responses include `Retry-After`.

This is a Node/MongoDB deployment artifact, not a Cloudflare Worker. It has been run locally and in Docker, but has not been deployed to a public Node host. The current Sites invitation keeps its working D1 compatibility backend. Moving the invitation to this service requires a Node-capable host, persistent MongoDB, HTTPS, the documented secrets, and a frontend `/api/v1` route/proxy connection. No hosted credentials are invented or embedded.
