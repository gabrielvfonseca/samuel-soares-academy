import { defineConfig } from "drizzle-kit";

/**
 * Single source of truth for the database schema.
 * Migrations are emitted straight into the root `supabase/migrations` folder
 * (timestamp-prefixed, Supabase CLI compatible) so one folder serves both tools.
 */
export default defineConfig({
  dbCredentials: {
    // Local Supabase default: postgresql://postgres:postgres@127.0.0.1:54322/postgres
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  },
  dialect: "postgresql",
  migrations: { prefix: "supabase" },
  out: "../../supabase/migrations",
  schema: "./src/schema/index.ts",
  schemaFilter: ["public"],
});
