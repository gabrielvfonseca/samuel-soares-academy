# Repository Guidelines

Turborepo + pnpm monorepo. See `README.md` for layout and commands.

- Apps live in `apps/*`, shared code in `packages/*` under the `@ssa/*` scope. Never import across
  workspaces with relative paths; declare `"@ssa/x": "workspace:*"` and import via its `exports`.
- Both apps are Next.js. Third-party UI libs (lucide, sonner, react-hook-form, next-themes, radix...) are
  dependencies of `@ssa/ui` only; apps import them through `@ssa/ui` re-exports.
- Packages are just-in-time (TypeScript source, no build step). Use subpath exports, no barrel files.
- UI primitives go in `packages/ui` (`@ssa/ui/components/<name>`); app-specific components stay in the app.
- Database schema changes: edit `packages/database/src/schema`, run `pnpm db:generate` (emits a
  migration into `packages/database/src/drizzle`), then apply with `pnpm db:local` (local D1) or
  `pnpm db:deploy` (remote D1).
- Dependency versions shared by several workspaces go in the `catalog:` of `pnpm-workspace.yaml`.
- Before committing run `pnpm check` and `pnpm check-types` (husky runs lint-staged -> `ultracite fix`, then type checks).
- Lint + format: Biome via Ultracite, one root `biome.jsonc` (presets core/react/next/drizzle). Use `pnpm check` / `pnpm fix`.
  Legacy-noise rules are downgraded to warnings there; do not add ESLint or Prettier. LF line endings.
