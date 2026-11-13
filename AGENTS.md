# Repository Guidelines

Turborepo + pnpm monorepo. See `README.md` for layout and commands.

- Apps live in `apps/*`, shared code in `packages/*` under the `@repo/*` scope. Never import across
  workspaces with relative paths; declare `"@repo/x": "workspace:*"` and import via its `exports`.
- Both apps are Next.js. Third-party UI libs (lucide, sonner, react-hook-form, next-themes, radix...) are
  dependencies of `@repo/ui` only; apps import them through `@repo/ui` re-exports.
- Packages are just-in-time (TypeScript source, no build step). Use subpath exports, no barrel files.
- UI primitives go in `packages/ui` (`@repo/ui/components/<name>`); app-specific components stay in the app.
- Database schema changes: edit `packages/database/src/schema`, run `pnpm db:generate`, commit the migration
  from `supabase/migrations`. RLS/functions/triggers are hand-written SQL migrations.
- Dependency versions shared by several workspaces go in the `catalog:` of `pnpm-workspace.yaml`.
- Before committing run `pnpm check` and `pnpm check-types` (husky runs lint-staged -> `ultracite fix`, then type checks).
- Lint + format: Biome via Ultracite, one root `biome.jsonc` (presets core/react/next/drizzle). Use `pnpm check` / `pnpm fix`.
  Legacy-noise rules are downgraded to warnings there; do not add ESLint or Prettier. LF line endings.
