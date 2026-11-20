# @repo/admin

Internal management app (vinext on Cloudflare Workers + D1). Monorepo rules live in the root `AGENTS.md`.

- Pages: `src/app/**/page.tsx` is a thin server file exporting `metadata`; the UI is in `page-client.tsx`
  (`"use client"`). Authenticated pages live in the `(app)` route group, guarded client-side in
  `(app)/app-shell.tsx` (the Better Auth session cookie is stored in the browser).
- Server code: server actions in `src/lib/actions/*` call `requireAuth`
  (`integrations/auth/server.ts`). In client code wrap them with `useAuthedAction(action)`.
  Business logic is in `src/lib/*.server.ts` (`server-only`).
- Cron endpoints (`src/app/api/public/cron/*/route.ts`) are HTTP routes protected by `TREINOS_CRON_SECRET`
  (`src/lib/cron-route.ts`). Cloudflare Cron Triggers POST to them on a schedule (see
  `cloudflare.config.ts`). Keep their paths stable.
- Icons, toasts, form hooks and UI primitives come from `@repo/ui` (`@repo/ui/icons`,
  `@repo/ui/components/sonner`, ...); do not add those libraries to this app.
