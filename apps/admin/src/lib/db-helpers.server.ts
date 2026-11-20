import "server-only";

import {
  notificationSettings as configTable,
  now,
} from "@repo/database/schema";
import { eq } from "drizzle-orm";
import { getDb } from "@/integrations/db/client.server";

/**
 * Shared server-side data access for the `*.server.ts` business modules.
 * All money values are returned as integer cents (D1 storage format);
 * callers format them via `eurosCents()` before rendering.
 */

type Row = Record<string, unknown>;

const CONFIG_ID = "notification-settings";

/** Integer cents → euros number for display/formatting. */
export function eurosDeCents(cents: number | null | undefined): number {
  return (cents ?? 0) / 100;
}

/** Integer cents → formatted euro string (pt-PT). */
export function eurosCents(cents: number | null | undefined): string {
  return new Intl.NumberFormat("pt-PT", {
    currency: "EUR",
    style: "currency",
  }).format(eurosDeCents(cents));
}

export function mesNoFuso(tz: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: tz,
    year: "numeric",
  })
    .format(new Date())
    .slice(0, 7);
}

/** Data (YYYY-MM-DD) no fuso indicado, deslocada por `offsetDias`. */
export function dataNoFuso(tz: string, offsetDias = 0): string {
  const base = new Date(Date.now() + offsetDias * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: tz,
    year: "numeric",
  }).format(base);
}

export type Config = typeof configTable.$inferSelect | null;

/**
 * Read the single `notification_settings` row. The single-row guarantee
 * lives in app code: `upsertConfig` always upserts with the same fixed id.
 * `null` means no configuration exists yet.
 */
export async function getConfig(): Promise<Config> {
  const db = getDb();
  const rows = await db
    .select()
    .from(configTable)
    .where(eq(configTable.id, CONFIG_ID))
    .limit(1);
  return rows[0] ?? null;
}

/** Upsert the single configuration row (fixed id). */
export async function upsertConfig(
  patch: Partial<typeof configTable.$inferInsert>
): Promise<void> {
  const db = getDb();
  await db
    .insert(configTable)
    .values({ ...patch, id: CONFIG_ID, updatedAt: now() } as never)
    .onConflictDoUpdate({
      set: { ...patch, updatedAt: now() } as never,
      target: configTable.id,
    });
}

export type { Row };
