import "server-only";

import { env } from "cloudflare:workers";
import { createDb } from "@repo/database/client";

/**
 * Server-side D1 Drizzle client. Replaces the old Supabase service-role
 * client — all queries go through Drizzle against the Cloudflare D1 binding.
 */
export function getDb() {
  return createDb(env.DB);
}

export type Database = ReturnType<typeof getDb>;
