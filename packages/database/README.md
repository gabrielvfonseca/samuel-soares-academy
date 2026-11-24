# @repo/database

Single source of truth for the Cloudflare D1 (SQLite) schema, Drizzle client,
and migrations. Both apps (`@repo/site`, `@repo/admin`) bind to the same D1
database (`ssa-db`) at runtime.

## Layout

```
src/
  schema/      Drizzle table definitions (people, places, training, finance, system)
  client.ts    createDb() — build a Drizzle instance over a D1 binding
  index.ts     public entrypoint (re-exports schema + client)
  drizzle/     emitted migrations (SQLite dialect, timestamp-prefixed) + meta/
drizzle.config.ts
wrangler.jsonc     D1 binding for `wrangler d1 ...` commands
noop.js            no-op worker (wrangler needs a `main` to resolve)
```

## Commands

| Command              | What it does                                            |
| -------------------- | ------------------------------------------------------- |
| `pnpm db:generate`   | Schema change → new migration in `src/drizzle`          |
| `pnpm db:local`      | Apply migrations to the local D1 (wrangler, `--local`)  |
| `pnpm db:deploy`     | Apply migrations to the remote D1 (wrangler)            |
| `pnpm db:check`      | Snapshot consistency (drizzle-kit check)                |
| `pnpm db:studio`     | Open Drizzle Studio against the local D1                |
| `pnpm check-types`   | Type-check the package                                  |

## Changing the schema

1. Edit the tables in `src/schema/*`.
2. `pnpm db:generate` — emits a new migration.
3. `pnpm db:local` to apply locally, or `pnpm db:deploy` for the remote.
4. `pnpm db:check` to confirm the snapshot is in sync.

CI enforces that the schema and the migrations never drift — a PR that
changes `src/schema/*` without regenerating `src/drizzle/` will fail.

## Conventions

- Timestamps are stored as RFC 3339 `text` (D1 has no native `timestamptz`).
- Money is stored as integer **cents**.
- No triggers — every write path sets `updatedAt` explicitly.
