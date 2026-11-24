# @repo/site

Public marketing site (pt/en). Built with vinext (Next.js 16 on Vite) and
deployed to Cloudflare Workers. Monorepo rules live in the root `AGENTS.md`.

## Project Structure

```
src/
  app/               Routes: [locale]/ (pt, en), actions/, metadata, robots, sitemap
  components/        UI (sections, dialogs, forms, providers)
  lib/               Helpers (i18n, fonts, metadata, security, rate-limit, redis)
  models/            Typed content models (hero, about, coaches, pricing, ...)
  dictionaries/      pt.json, en.json (next-international)
  styles/            globals.css (Tailwind v4)
  utils/             contact-utils, whatsapp-message
  types/             cloudflare-workers.d.ts (typed env bindings)
  env.ts             typed env (reads from cloudflare:workers)
  proxy.ts           middleware (locale negotiation)
public/              Static assets (images, favicons, og images)
```

## Commands

| Command              | What it does                                  |
| -------------------- | --------------------------------------------- |
| `pnpm dev`           | Vite dev server on http://localhost:9000      |
| `pnpm build`         | Production build (vite build)                 |
| `pnpm start`         | Run the built app (vinext start, :9000)       |
| `pnpm check-types`   | Build + `tsc --noEmit`                        |
| `pnpm deploy`        | Deploy to Cloudflare (vinext-cloudflare)      |
| `pnpm check` (root)  | Biome + Ultracite lint/format                 |
| `pnpm fix` (root)    | Auto-fix style issues                         |

## Coding Style

- 2-space indent (Biome). Kebab-case filenames, PascalCase components,
  camelCase functions/variables.
- UI primitives come from `@repo/ui` — do not add UI libraries (lucide,
  sonner, radix, ...) directly to this app.
- Content is driven by the typed models in `src/models/` and the
  dictionaries in `src/dictionaries/`.

## Environment

- Env vars are typed in `src/types/cloudflare-workers.d.ts` and read from
  `cloudflare:workers` (the Cloudflare Workers runtime). The
  `bindings.text("placeholder")` values in `cloudflare.config.ts` are
  **local-dev only** — real values are set in the CF dashboard after deploy.
- Public origin (`NEXT_PUBLIC_APP_URL`) is inlined into the browser bundle at
  build time.
- See `src/env.ts` for the canonical typed env list and `.env.example` for
  the required vars.

## Conventions

- Server code is `"use server"`; client components are `"use client"`.
- Pages under `[locale]/` are locale-scoped; `proxy.ts` negotiates the locale.
- Run `pnpm check` and `pnpm check-types` before committing.
