# Samuel Soares Academy

Turborepo monorepo: public website, management app and a single Cloudflare D1 (SQLite) database.

```
apps/
  site/      @ssa/site     Next.js 16 marketing site (pt/en)
  admin/     @ssa/admin   Next.js management app (Better Auth + D1 data)
packages/
  ui/                @ssa/ui                shadcn/ui components, hooks, `cn`
  database/          @ssa/database               Drizzle schema, client, drizzle-kit (source of truth)
  email/             @ssa/email             React Email templates, email layout, Resend client
  validation/        @ssa/validation        shared zod schemas
  typescript-config/ @ssa/typescript-config shared tsconfigs
```

## Getting started

```bash
corepack enable            # or: npm i -g pnpm@12
pnpm install
cp apps/site/.env.example apps/site/.env.local
cp apps/admin/.env.example apps/admin/.env
cp .env.example .env

pnpm dev                   # both apps
pnpm dev:site              # http://localhost:9000
pnpm dev:admin             # http://localhost:9001
```

## Common tasks

| Command                        | What it does                           |
| ------------------------------ | -------------------------------------- |
| `pnpm build`                   | Build everything (cached by Turborepo) |
| `pnpm check` / `pnpm fix`      | Biome + Ultracite lint/format check / auto-fix    |
| `pnpm check-types`             | Type-check every workspace                        |
| `pnpm --filter @ssa/ui add x` | Add a dependency to one workspace      |
| `pnpm changeset`               | Record a change for versioning         |

Site builds need `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY`, `WHATSAPP_PHONE`,
`CONTACT_EMAIL_FROM`, `CONTACT_EMAIL_TO` (see `apps/site/.env.example`).

## Database (single D1 DB)

`packages/database` owns the schema (`src/schema/*`). Migrations are emitted into
`packages/database/src/drizzle` (timestamp-prefixed) by drizzle-kit.

```bash
pnpm db:local              # apply migrations to the local D1 (wrangler, --local)
pnpm db:generate           # schema change -> new migration in src/drizzle
pnpm db:deploy             # apply migrations to the remote D1 (wrangler)
pnpm db:check              # snapshot consistency
pnpm db:studio
```

Notes:

- The database is a single Cloudflare D1 (`ssa-db`) bound as `DB` in both apps'
  `cloudflare.config.ts`. The schema is modelled in Drizzle (`@ssa/database`).
- `apps/admin` talks to the database through a Supabase-shaped query chain
  (`@/integrations/data/client`) that POSTs to `/api/pg`; server code uses
  `@ssa/database` (`createDb()`, server-side only) directly.
- Always diff the Drizzle schema against the real database before the first
  production migration (`pnpm db:check`).
