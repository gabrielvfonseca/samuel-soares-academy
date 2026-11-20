import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createdAt, id, updatedAt } from "./_columns";
import { coaches } from "./people";

// NOTE: `time` columns are stored as `text` ("HH:MM"). SQLite has no time
// type; the "HH:MM" string keeps lexicographic comparison correct and
// matches the values the UI already sends and renders.

export const fields = sqliteTable("fields", {
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  address: text("address"),
  createdAt: createdAt(),
  id: id(),
  name: text("name").notNull(),
  notes: text("notes"),
  updatedAt: updatedAt(),
});

export const availability = sqliteTable("availability", {
  coachId: text("coach_id")
    .notNull()
    .references(() => coaches.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
  dayOfWeek: integer("day_of_week").notNull(),
  endTime: text("end_time").notNull(),
  id: id(),
  notes: text("notes"),
  startTime: text("start_time").notNull(),
  updatedAt: updatedAt(),
});

export const fieldAvailability = sqliteTable("field_availability", {
  createdAt: createdAt(),
  dayOfWeek: integer("day_of_week").notNull(),
  endTime: text("end_time").notNull(),
  fieldId: text("field_id")
    .notNull()
    .references(() => fields.id, { onDelete: "cascade" }),
  id: id(),
  notes: text("notes"),
  startTime: text("start_time").notNull(),
  updatedAt: updatedAt(),
});

export const groups = sqliteTable("groups", {
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  coachId: text("coach_id").references(() => coaches.id, {
    onDelete: "set null",
  }),
  createdAt: createdAt(),
  dayOfWeek: integer("day_of_week"),
  endTime: text("end_time"),
  fieldId: text("field_id").references(() => fields.id, {
    onDelete: "set null",
  }),
  id: id(),
  level: text("level"),
  name: text("name").notNull(),
  notes: text("notes"),
  startTime: text("start_time"),
  updatedAt: updatedAt(),
});

export const clubs = sqliteTable("clubs", {
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  coachId: text("coach_id").references(() => coaches.id, {
    onDelete: "set null",
  }),
  contact: text("contact"),
  createdAt: createdAt(),
  dayOfWeek: integer("day_of_week"),
  email: text("email"),
  endTime: text("end_time"),
  fieldId: text("field_id").references(() => fields.id, {
    onDelete: "set null",
  }),
  id: id(),
  // Money as integer cents (Postgres `numeric(10,2)` → `integer` cents).
  monthlyFee: integer("monthly_fee").notNull().default(0),
  name: text("name").notNull(),
  notes: text("notes"),
  startTime: text("start_time"),
  taxId: text("tax_id"),
  updatedAt: updatedAt(),
});

export const clubSessions = sqliteTable("club_sessions", {
  clubId: text("club_id")
    .notNull()
    .references(() => clubs.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
  dayOfWeek: integer("day_of_week").notNull(),
  endTime: text("end_time").notNull(),
  id: id(),
  startTime: text("start_time").notNull(),
  updatedAt: updatedAt(),
});
