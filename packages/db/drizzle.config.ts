import { defineConfig } from "drizzle-kit";

/**
 * Single source of truth for the database schema.
 * Migrations are emitted straight into the root `supabase/migrations` folder
 * (timestamp-prefixed, Supabase CLI compatible) so one folder serves both tools.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "../../supabase/migrations",
  schemaFilter: ["public"],
  migrations: { prefix: "supabase" },
  dbCredentials: {
    // Local Supabase default: postgresql://postgres:postgres@127.0.0.1:54322/postgres
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  },
});
