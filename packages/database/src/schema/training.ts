import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createdAt, id, updatedAt } from "./_columns";
import { coaches, students } from "./people";
import { clubs, groups } from "./places";

// NOTE: datetime values are stored as `text` RFC3339 strings (SQLite has no
// timestamp type). App code must pass/compare strings, never Date objects.

export const trainings = sqliteTable("trainings", {
  clubId: text("club_id").references(() => clubs.id, {
    onDelete: "set null",
  }),
  coachId: text("coach_id").references(() => coaches.id, {
    onDelete: "set null",
  }),
  createdAt: createdAt(),
  endDate: text("end_date").notNull(),
  field: text("field"),
  groupId: text("group_id").references(() => groups.id, {
    onDelete: "set null",
  }),
  id: id(),
  invoice: text("invoice"),
  notes: text("notes"),
  paymentStatus: text("payment_status").notNull().default("Pending"),
  seriesId: text("series_id"),
  startDate: text("start_date").notNull(),
  status: text("status").notNull().default("Scheduled"),
  studentId: text("student_id").references(() => students.id, {
    onDelete: "set null",
  }),
  taxId: text("tax_id"),
  type: text("type").notNull().default("Individual"),
  updatedAt: updatedAt(),
});

export const reminderHistory = sqliteTable("reminder_history", {
  channel: text("channel").notNull(),
  coachId: text("coach_id").references(() => coaches.id, {
    onDelete: "set null",
  }),
  detail: text("detail"),
  id: id(),
  sentAt: text("sent_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  status: text("status").notNull(),
  trainingId: text("training_id").references(() => trainings.id, {
    onDelete: "set null",
  }),
});
