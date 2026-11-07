import { timestamp, uuid } from "drizzle-orm/pg-core";

export const id = () => uuid("id").primaryKey().defaultRandom();

/** `mode: "string"` keeps parity with the values supabase-js returns today. */
export const createdAt = () =>
  timestamp("created_at", { mode: "string", withTimezone: true })
    .notNull()
    .defaultNow();

export const updatedAt = () =>
  timestamp("updated_at", { mode: "string", withTimezone: true })
    .notNull()
    .defaultNow();
