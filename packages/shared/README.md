# @luxury-investment/shared

zod schemas, types and constants used by more than one app (`apps/api`, `apps/web`, `apps/admin`). Add something here only when a second app needs it.

## How apps consume it

The package ships **TypeScript source only** (`exports` points to `src/index.ts`); there is no build or watch step. Each consumer compiles it:

| Consumer | How |
|---|---|
| `apps/api` (Node 26) | Node strips the types natively at runtime; the workspace symlink resolves outside `node_modules`, where type stripping is allowed |
| `apps/web` (Next.js) | `transpilePackages: ['@luxury-investment/shared']` in `next.config.ts` |
| `apps/admin` (Vite) | Works as is: Vite compiles linked workspace sources |
| Tests (Vitest) | Works as is |

Add it to an app with `"@luxury-investment/shared": "*"` in that app's `dependencies`.

## Rules for code in this package

These keep the source runnable by Node's type stripping and by every bundler (enforced by `tsconfig.json`):

- Relative imports use the `.ts` extension: `import { x } from './locales.ts'`.
- Only erasable TypeScript syntax (`erasableSyntaxOnly`): no `enum`, `namespace` or constructor parameter properties. Use `as const` objects or zod enums instead.
- Type-only imports and exports use `import type` / `export type` (`verbatimModuleSyntax`).
- No runtime dependencies other than zod, and nothing Node- or browser-specific.

## Scripts

`npm run typecheck`, `npm test` (also run from the repository root for all workspaces).
