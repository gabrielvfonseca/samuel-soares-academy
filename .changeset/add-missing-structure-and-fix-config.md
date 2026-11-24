---
"@repo/database": patch
"@repo/validation": patch
---

Add missing repo structure and fix configuration gaps.

- Add `.editorconfig`, `.npmrc`, `.vscode/extensions.json`, `.vscode/settings.json`
- Add `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md`
- Add per-package READMEs (`database`, `ui`, `email`, `validation`, `typescript-config`)
- Add `packages/database/noop.js` (required `main` for `wrangler d1` commands)
- Fix `packages/database/wrangler.jsonc` `compatibility_date` to match the apps (`2026-11-02`)
- Rename the misnamed `db:studio` script (was running `SELECT 1`) to `db:smoke`; add a real `db:studio` via `drizzle-kit studio`
- Add Vitest + a real test suite for `@repo/validation` (`contact.test.ts`)
- Add the `test` task to `turbo.json` and the root `test` script
- Add the dead `next` catalog entry removal and a `vitest` catalog entry
- Add the missing env vars to `.env.example` (`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `BETTER_AUTH_TRUSTED_ORIGINS`)
- Remove the hardcoded `BETTER_AUTH_SECRET` from `apps/admin/cloudflare.config.ts` (now an empty placeholder — set in the CF dashboard)
- Add the Cron Triggers to `apps/admin/cloudflare.config.ts` (5 endpoints, previously undocumented as absent)
- Rewrite the stale `apps/site/AGENTS.md` (was referencing Next.js / @t3-oss/env-nextjs / Vercel — none apply)
