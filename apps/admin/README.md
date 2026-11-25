# @ssa/admin

Management app for Samuel Soares Academy (trainers, students, sessions, payments, reminders).

```bash
cp .env.example .env        # fill in the local dev values
pnpm --filter @ssa/admin dev   # http://localhost:9001
```

See `.env.example` for all variables. The database is the shared Cloudflare D1 project managed by `packages/database`.
