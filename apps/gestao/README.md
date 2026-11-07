# @repo/gestao

Management app for Samuel Soares Academy (trainers, students, sessions, payments, reminders).

```bash
cp .env.example .env.local   # fill in Supabase keys
pnpm --filter @repo/gestao dev   # http://localhost:3001
```

See `.env.example` for all variables. The database is the shared Supabase project managed by `packages/db`.
