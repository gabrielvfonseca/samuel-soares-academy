# Contributing to Samuel Soares Academy

Thanks for your interest in contributing. This is a [Turborepo](https://turbo.build/repo) + pnpm monorepo with two Next.js (vinext) apps on Cloudflare Workers and a single Cloudflare D1 (SQLite) database.

## Prerequisites

- **Node.js ≥ 22** (see `.nvmrc`)
- **pnpm 12** (see `packageManager` in `package.json`; `corepack enable` picks it up)

## Getting started

```bash
corepack enable            # or: npm i -g pnpm@12
pnpm install
cp .env.example .env
cp apps/site/.env.example apps/site/.env.local
cp apps/admin/.env.example apps/admin/.env

pnpm dev                   # both apps
# site  -> http://localhost:9000
# admin -> http://localhost:9001
```

## Project layout

```
apps/
  site/      @repo/site      Marketing site (pt/en)
  admin/     @repo/admin     Internal management app (Better Auth + D1)
packages/
  ui/                @repo/ui                shadcn/ui components, hooks, cn
  database/          @repo/database          Drizzle schema, client, migrations (source of truth)
  email/             @repo/email             React Email templates, Resend client
  validation/        @repo/validation        shared zod schemas
  typescript-config/ @repo/typescript-config shared tsconfigs
```

## Common commands

| Command              | What it does                              |
| -------------------- | ----------------------------------------- |
| `pnpm build`         | Build everything (cached by Turborepo)    |
| `pnpm check`         | Biome + Ultracite lint/format check       |
| `pnpm fix`           | Auto-fix style issues                     |
| `pnpm check-types`   | Type-check every workspace                |
| `pnpm test`          | Run the test suite (Vitest)               |
| `pnpm db:generate`   | Schema change → new migration             |
| `pnpm db:local`      | Apply migrations to the local D1          |
| `pnpm db:deploy`     | Apply migrations to the remote D1         |
| `pnpm db:check`      | Snapshot consistency                      |
| `pnpm changeset`     | Record a change for versioning            |

## Making a change

1. Fork / branch from `main`.
2. Make your change. Follow the conventions in [`AGENTS.md`](./AGENTS.md).
3. Run `pnpm check` and `pnpm check-types` — both must pass.
4. If you added a feature, bug fix, or any user-visible change, record a
   changeset: `pnpm changeset`.
5. Open a PR. CI runs lint, type-check, build, and a database-schema
   consistency check.

### Conventional commits

Commit messages follow the conventional format:

```
type(scope): short summary
```

where `type` is one of `feat`, `fix`, `chore`, `refactor`, `docs`, `style`,
`test`, or `perf`. The `scope` is usually the workspace (`site`, `admin`,
`ui`, `database`, `email`, `validation`) or a short component name.

Examples:

```
feat(site): add testimonials section
fix(admin): correct cron bearer-token comparison
chore(database): bump drizzle-orm to 0.46
test(validation): cover contactSubmitResultSchema
```

### Pull requests

- PR titles mirror the commit type.
- The description must reference the related issue (`#123`), summarize the
  changes, and include any migration steps.
- Include screenshots for UI changes.
- Wait for CI to go green.

## Database schema changes

The single source of truth is `packages/database/src/schema`. To change the
schema:

1. Edit the schema in `packages/database/src/schema/*`.
2. Run `pnpm db:generate` — this emits a new migration into
   `packages/database/src/drizzle` (SQLite dialect, timestamp-prefixed).
3. Apply locally with `pnpm db:local` (wrangler, `--local`).
4. Push to the remote D1 with `pnpm db:deploy` (wrangler, remote).
5. Run `pnpm db:check` to confirm the snapshot is consistent.

CI enforces that the Drizzle schema and the migrations are always in sync —
a PR that changes the schema without regenerating the migrations will fail.

## Versioning & releases

This repo uses [Changesets](https://github.com/changesets/changesets).

- Every user-visible change in a published package should include a changeset
  (`pnpm changeset`).
- The `Version Packages` PR is opened automatically by the `changesets/action`
  workflow when changesets are merged to `main`.
- Merging that PR bumps versions, updates the changelogs, and (for public
  packages) publishes to the registry.

All `@repo/*` packages are currently `private: true` and `version: 0.0.0`;
the tooling is wired so publishing can be enabled by flipping `private` to
`false` and setting an `access` in `.changeset/config.json`.

## Testing

Unit tests use [Vitest](https://vitest.dev/). Add a `*.test.ts` (or
`*.spec.ts`) file next to the source it tests, and run the suite with
`pnpm test`. The turbo `test` task is wired for all workspaces.

When adding tests:

- Name files `{module}.test.ts`.
- Keep tests focused — one behaviour per `it(...)`.
- Mock external services (Resend, Better Auth, D1) at the boundary; test the
  pure logic directly.

## Security

- **Never** commit `.env*` files (except `.env.example`).
- Secrets are set in the Cloudflare dashboard after deploy; the
  `bindings.text("placeholder")` values in each app's `cloudflare.config.ts`
  are local-dev only.
- Run `pnpm audit` periodically and address high-severity findings.

## Code of conduct

Please read [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md). We expect all
contributors to be respectful and professional.
