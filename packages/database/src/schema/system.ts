import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createdAt, id, updatedAt } from "./_columns";

// `notification_settings` is a single-row table (Postgres enforced it via
// a boolean PK + check constraint). D1 cannot express that, so the
// single-row guarantee is kept in app code: always upsert with a fixed id.
export const notificationSettings = sqliteTable("notification_settings", {
  createdAt: createdAt(),
  // `time` stored as `text` ("HH:MM") — SQLite has no time type.
  dailySendTime: text("daily_send_time").notNull().default("20:00"),
  fromEmail: text("from_email").default("onboarding@resend.dev"),
  id: id(),
  lastSentDate: text("last_sent_date"),
  preferredChannel: text("preferred_channel").notNull().default("Email"),
  resendApiKey: text("resend_api_key"),
  timezone: text("timezone").notNull().default("Europe/Lisbon"),
  updatedAt: updatedAt(),
  whatsappApiKey: text("whatsapp_api_key"),
  whatsappPhoneId: text("whatsapp_phone_id"),
});

export const personalReminders = sqliteTable("personal_reminders", {
  createdAt: createdAt(),
  email: text("email").notNull(),
  error: text("error"),
  id: id(),
  sent: integer("sent", { mode: "boolean" }).notNull().default(false),
  sentAt: text("sent_at"),
  text: text("text").notNull(),
  when: text("when").notNull(),
});
