# Samuel Soares Academy

Turborepo monorepo: public website, management app and a single Supabase/Postgres database.

```
apps/
  site/      @repo/site     Next.js 16 marketing site (pt/en)
  gestao/    @repo/gestao   Next.js management app (Supabase auth + data)
packages/
  ui/                @repo/ui                shadcn/ui components, hooks, `cn`
  db/                @repo/db                Drizzle schema, client, drizzle-kit (source of truth)
  email/             @repo/email             React Email templates, email layout, Resend client
  validation/        @repo/validation        shared zod schemas
  typescript-config/ @repo/typescript-config shared tsconfigs
  lint-config/       @repo/lint-config       shared Prettier + ESLint config
supabase/            Supabase CLI project (config.toml, migrations)
```

## Getting started

```bash
corepack enable            # or: npm i -g pnpm@12
pnpm install
cp apps/site/.env.example apps/site/.env.local
cp apps/gestao/.env.example apps/gestao/.env
cp .env.example .env

pnpm dev                   # both apps
pnpm dev:site              # http://localhost:3000
pnpm dev:gestao             # http://localhost:3001
```

## Common tasks

| Command                        | What it does                           |
| ------------------------------ | -------------------------------------- |
| `pnpm build`                   | Build everything (cached by Turborepo) |
| `pnpm lint` / `check-types`    | Lint / type-check every workspace      |
| `pnpm format`                  | Prettier over the repo                 |
| `pnpm --filter @repo/ui add x` | Add a dependency to one workspace      |
| `pnpm changeset`               | Record a change for versioning         |

Site builds need `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY`, `WHATSAPP_BUSINESS_PHONE`,
`CONTACT_EMAIL_FROM`, `CONTACT_EMAIL_TO` (see `apps/site/.env.example`).

## Database (single DB)

`packages/db` owns the schema (`src/schema/*`). Migrations are emitted into
`supabase/migrations` (timestamp-prefixed) so the Supabase CLI and drizzle-kit share one folder.

```bash
supabase start                 # local Postgres on :54322
pnpm db:generate               # schema change -> new migration in supabase/migrations
pnpm db:migrate                # apply with drizzle-kit   (or: supabase db reset / db push)
pnpm db:check                  # snapshot consistency
pnpm db:studio
```

Notes:

- `*_baseline.sql` is intentionally empty: the original tables come from the earlier Supabase
  migrations; the baseline only anchors the Drizzle snapshot in `supabase/migrations/meta`.
- Row Level Security policies, grants, functions and triggers are **not** modelled in Drizzle.
  Add them as hand-written SQL migrations (`supabase migration new <name>`).
- `apps/gestao` still talks to the database through `@supabase/supabase-js` (auth, RLS-scoped
  access). Use `@repo/db` (`createDb()`, server-side only) for new direct queries.
- Always diff the Drizzle schema against the real database (`pnpm db:pull` into a scratch dir)
  before the first production migration.
