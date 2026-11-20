import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const id = () => text("id").primaryKey();

/**
 * SQLite stores timestamps as RFC3339 text (`mode: "string"`). App code must
 * always pass/compare strings — never Date objects — and must apply a UTC
 * offset for timezone-local queries (see `utcOffset`).
 */
export const createdAt = () =>
  text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString());

export const updatedAt = () =>
  text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString());

/**
 * Postgres triggers no longer exist on D1: every write path must set this
 * column itself. Pass `updatedAt: now()` in `insert` and `set` of every
 * `update` statement.
 */
export const now = () => new Date().toISOString();

/**
 * `created_at`/`updated_at` are RFC3339 strings. For timezone-local queries
 * (e.g. "reminders due at 20:00 in Europe/Lisbon") compare against an offset
 * ISO string computed in JS, e.g. `where(gte(table.enviadoEm, utcOffset("Europe/Lisbon")))`.
 */
export function utcOffset(timezone: string, date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone: timezone,
    year: "numeric",
  }).format(date);
}

// ---------------------------------------------------------------------------
// Better Auth tables — D1 cannot host the auth extension, so the tables live
// here. See https://better-auth.com/docs/adapters/d1
// ---------------------------------------------------------------------------

export const betterAuthAccount = sqliteTable(
  "account",
  {
    accessToken: text("access_token"),
    accessTokenExpiresAt: text("access_token_expires_at"),
    accountId: text("account_id").notNull(),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    id: text("id").primaryKey(),
    idToken: text("id_token"),
    password: text("password"),
    providerId: text("provider_id").notNull(),
    refreshToken: text("refresh_token"),
    refreshTokenExpiresAt: text("refresh_token_expires_at"),
    scope: text("scope"),
    updatedAt: text("updated_at")
      .notNull()
      .$onUpdate(() => new Date().toISOString()),
    userId: text("user_id")
      .notNull()
      .references(() => betterAuthUser.id, { onDelete: "cascade" }),
  },
  (table) => [index("idx_account_user_id").on(table.userId)]
);

export const betterAuthSession = sqliteTable("session", {
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  expiresAt: text("expires_at").notNull(),
  id: text("id").primaryKey(),
  impersonatedFrom: text("impersonated_from"),
  ipAddress: text("ip_address"),
  token: text("token").notNull().unique(),
  updatedAt: text("updated_at")
    .notNull()
    .$onUpdate(() => new Date().toISOString()),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => betterAuthUser.id, { onDelete: "cascade" }),
});

export const betterAuthUser = sqliteTable("user", {
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  id: text("id").primaryKey(),
  image: text("image"),
  name: text("name").notNull(),
  updatedAt: text("updated_at")
    .notNull()
    .$onUpdate(() => new Date().toISOString()),
});

export const betterAuthVerification = sqliteTable("verification", {
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  expiresAt: text("expires_at").notNull(),
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  updatedAt: text("updated_at")
    .notNull()
    .$onUpdate(() => new Date().toISOString()),
  value: text("value").notNull(),
});
