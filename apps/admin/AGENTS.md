# @repo/admin

Internal management app (Next.js App Router + Supabase). Monorepo rules live in the root `AGENTS.md`.

- Pages: `src/app/**/page.tsx` is a thin server file exporting `metadata`; the UI is in `page-client.tsx`
  (`"use client"`). Authenticated pages live in the `(app)` route group, guarded client-side in
  `(app)/app-shell.tsx` (the Supabase session is stored in the browser).
- Server code: server actions in `src/lib/actions/*` take the user's access token as first argument and call
  `requireSupabaseAuth` (`integrations/supabase/auth.server.ts`). In client code wrap them with
  `useAuthedAction(action)`. Business logic is in `src/lib/*.server.ts` (`server-only`).
- Cron endpoints (`src/app/api/public/cron/*/route.ts`) are called by Postgres `pg_cron` via `net.http_post`;
  keep their paths stable and protected by `TREINOS_CRON_SECRET` (`src/lib/cron-route.ts`).
- Icons, toasts, form hooks and UI primitives come from `@repo/ui` (`@repo/ui/icons`,
  `@repo/ui/components/sonner`, ...); do not add those libraries to this app.
