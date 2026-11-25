import "server-only";

import { createDb, getEnv } from "@ssa/cloudflare";

/**
 * Server-side D1 Drizzle client. Replaces the old Supabase service-role
 * client — all queries go through Drizzle against the Cloudflare D1 binding.
 */
export function getDb() {
  return createDb(getEnv().DB);
}

export type Database = ReturnType<typeof getDb>;
