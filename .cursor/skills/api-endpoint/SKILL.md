---
name: api-endpoint
description: >-
  Recipe for adding or changing an API endpoint in apps/api (Express 5, Drizzle,
  Postgres) with shared Zod schemas, migration, seed and integration test. Use when
  a web or admin feature needs new data, a new table/column, or a new public/admin route.
---

# Add an API endpoint

Project workflow (tracker, ADRs, commits): `.cursor/skills/luxury-investment-workflow/SKILL.md`.
Data-model changes that are costly to reverse need an ADR first.

Reference module: `apps/api/src/modules/analytics/` (schema, repo, public + admin handlers) and its test `apps/api/test/integration/site-analytics.test.ts`.

## Layout per module

```
apps/api/src/modules/<module>/
  repo/<module>.schema.ts    Drizzle tables
  repo/<module>-repo.ts      queries (only place that touches the db)
  app/<x>-service.ts         business logic when more than CRUD
  handlers/<module>-admin-handlers.ts   /v1/admin/...
  handlers/<module>-public-handlers.ts  /v1/public/...
```

## Checklist

```
- [ ] Zod schemas + exported types in packages/shared/src/<module>.ts, re-exported in index.ts
- [ ] Drizzle schema change -> npm run db:generate -> review the SQL -> npm run db:migrate
- [ ] New table exported from apps/api/src/infrastructure/db/schema.ts
- [ ] Idempotent seed module (seeds/<module>.ts, registered in seeds/index.ts) when the table needs demo data
- [ ] Repo methods; handler with withValidation; permission check for admin routes
- [ ] Router mounted in apps/api/src/main.ts (publicRouters or adminRouters)
- [ ] Integration test (happy path + one validation/permission case)
- [ ] Coverage gate still passes
```

## Shared schemas (packages/shared)

```ts
export const createWidgetSchema = z.object({
  name: z.string().trim().min(1).max(200),
  url: z.url().optional(),
}).refine((v) => v.name !== 'x', { error: 'name must not be x' }); // `error`, not deprecated `message`
export type CreateWidgetInput = z.infer<typeof createWidgetSchema>;
```

Export both schema and type from `packages/shared/src/index.ts`. Web and admin import from `@luxury-investment/shared`.

## Handler

```ts
router.post(
  '/widgets',
  withValidation({ body: createWidgetSchema }, async ({ body }, req, res) => {
    if (req.auth?.permissions.includes('properties:write') !== true) throw new AppError('FORBIDDEN');
    const row = await repo.create(body);
    res.status(201).json({ data: row });
  }),
);
```

- Responses are `{ data: ... }`; errors are thrown as `AppError(code)` (`apps/api/src/errors/app-error.ts`), never hand-written JSON.
- Reuse permission keys from `packages/shared/src/permissions.ts`. A new key also needs the role mapping in the users seed, and staff must log in again.
- Public write endpoints: rate limiter + honeypot `website` field (see `analytics-public-handlers.ts`, ADR-0008).
- Timestamps as ISO strings in responses; money as strings.

## Migration and seed

- Never edit an applied migration; generate a new one.
- Seeds use fictional data (`Demo` names, `example.com`, `+359 000`) and must be safe to run twice.

## Integration test

```ts
beforeEach(async () => {
  await resetDatabase(connection);
  for (const module of SEED_MODULES) await module.run(connection.db);
});

it('creates a widget', async () => {
  const agent = await loginAgent(); // POST /v1/admin/auth/login with DEMO_ADMIN_EMAIL
  const res = await agent.post('/v1/admin/widgets').send({ name: 'Demo' }).expect(201);
  expect((res.body as { data: { name: string } }).data.name).toBe('Demo');
});
```

Build the app in the test with only the routers you need (`createApp({ env, logger, adminRouters: [...] })`).

## Verify

```bash
npm run typecheck -w @luxury-investment/shared && npm run typecheck -w @luxury-investment/api
npm test -w @luxury-investment/api -- test/integration/<file>.test.ts
npm run test:coverage -w @luxury-investment/api
```
