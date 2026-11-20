import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

import { createdAt, id, updatedAt } from "./_columns";
import { groups } from "./places";

export const coaches = sqliteTable("coaches", {
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  address: text("address"),
  birthDate: text("birth_date"),
  createdAt: createdAt(),
  email: text("email").notNull(),
  // Money as integer cents (Postgres `numeric(10,2)` → `integer` cents).
  groupRate: integer("group_rate").notNull().default(0),
  id: id(),
  individualRate: integer("individual_rate").notNull().default(0),
  name: text("name").notNull(),
  notes: text("notes"),
  taxId: text("tax_id"),
  updatedAt: updatedAt(),
  whatsappPhone: text("whatsapp_phone"),
});

export const students = sqliteTable("students", {
  athleteType: text("athlete_type").notNull().default("Individual"),
  birthDate: text("birth_date"),
  createdAt: createdAt(),
  enrollDate: text("enroll_date"),
  enrollmentType: text("enrollment_type"),
  // Single "primary" group FK (parity with Postgres `group_id`).
  groupId: text("group_id").references(() => groups.id, {
    onDelete: "set null",
  }),
  id: id(),
  level: text("level"),
  name: text("name").notNull(),
  notes: text("notes"),
  parentContact: text("parent_contact"),
  parentEmail: text("parent_email"),
  parentName: text("parent_name"),
  technicalNotes: text("technical_notes"),
  updatedAt: updatedAt(),
});

/**
 * Replaces Postgres `uuid[]` `students.group_ids` (a table cannot hold arrays
 * on SQLite). One row per (student, group) membership.
 */
export const studentGroups = sqliteTable(
  "student_groups",
  {
    groupId: text("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    studentId: text("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
  },
  (t) => [unique("student_groups_unique").on(t.studentId, t.groupId)]
);
