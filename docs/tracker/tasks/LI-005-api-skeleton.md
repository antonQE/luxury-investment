# LI-005: API skeleton

- Epic: EPIC-01
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-002, LI-003

## Description

Create `apps/api` with the structure every domain module will follow (ADR-0002), without any domain yet.

## Acceptance criteria

- [x] Express 5, TypeScript strict, ESM; dev server with reload; production build and start scripts.
- [x] Environment config validated with zod at startup; the process exits with a clear message on invalid config; read only through one config module.
- [x] Structured logger; request logging without auth headers or bodies.
- [x] Error hierarchy with stable error codes and one error-handling middleware returning `{ error: { code, message, details? } }` (reference: `Newscore_Backend/src/errors/`).
- [x] zod request validation middleware for params, query and body.
- [x] Folder layout documented in `apps/api/README.md`: `modules/<context>/{domain,repo,app,handlers,serializers}`, `infrastructure/`, `config/`, `errors/`, `utils/`.
- [x] `GET /health` returns status and version; CORS limited to configured origins; security headers enabled.
- [x] Vitest + supertest: tests for `/health`, the error format and a validation failure.
- [x] Imports `@luxury-investment/shared` in dev and in the production start without a build step for the package (Node type stripping, see `packages/shared/README.md`).

## Out of scope

- Database (LI-006); authentication (EPIC-02).

## Implementation notes

- Runs on Node 26 without a build step or `tsx`: `node src/main.ts` (types stripped natively); dev uses `node --watch --env-file-if-exists=../../.env` piped to `pino-pretty`.
- Same TypeScript rules as `packages/shared` (`erasableSyntaxOnly`, `.ts` import extensions, `NodeNext`).
- `withValidation(schemas, handler)` validates params, query and body with zod and passes the parsed values to the handler; Express 5 makes `req.query` read-only, so parsed values are not written back. All issues from all parts are returned together in `details`.
- Error handling: `AppError` with stable codes; malformed JSON becomes `VALIDATION_FAILED`; anything unexpected becomes `INTERNAL` with a generic message and is logged.
- `/health` reports the package version and pluggable component checks (database added in LI-006); 503 when a check fails.
- `/v1/public/meta` returns the supported locales from `@luxury-investment/shared` (needed by the web language switcher; proves the package loads at runtime).
- helmet security headers, CORS limited to configured origins with credentials, `x-powered-by` off, JSON body limit 1 MB, pino with redacted `authorization` / `cookie`.
- npm did not save runtime dependencies on the first `npm install -w` into a brand-new workspace; re-running with `--save` fixed it (same as in LI-003).

## Result

- Added `apps/api` (package, tsconfig, README, `src/` as documented, `test/app.test.ts`).
- Verified: 8 tests pass (health ok/degraded, NOT_FOUND, INTERNAL hides details, malformed JSON, validation success with coercion, validation issues from params/query/body, meta from the shared package); type check, lint and format pass; a real `node src/main.ts` start serves `/health` and `/v1/public/meta` and sends helmet headers; SIGTERM shuts down cleanly.
