import { defineConfig } from "drizzle-kit";

/**
 * Single source of truth for the database schema (Cloudflare D1).
 * Migrations are emitted into `src/drizzle` — apply them with the D1 CLI:
 * `pnpm db:deploy` (wraps `wrangler d1 migrations apply`).
 */
export default defineConfig({
  dbCredentials: {
    // Local D1 via `wrangler d1` (no live URL needed for generate).
    url: "file:./local.db",
  },
  dialect: "sqlite",
  out: "./src/drizzle",
  schema: "./src/schema/index.ts",
  strict: true,
  verbose: true,
});
