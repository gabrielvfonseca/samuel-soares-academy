import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { createdAt, id, updatedAt } from "./_columns";
import { coaches, students } from "./people";
import { clubs } from "./places";
import { trainings } from "./training";

export const monthlyFees = sqliteTable(
  "monthly_fees",
  {
    // Money as integer cents (Postgres `numeric(10,2)` → `integer` cents).
    amount: integer("amount"),
    clubId: text("club_id").references(() => clubs.id, {
      onDelete: "cascade",
    }),
    createdAt: createdAt(),
    id: id(),
    invoice: text("invoice"),
    month: text("month").notNull(),
    notes: text("notes"),
    paymentStatus: text("payment_status").notNull().default("Pending"),
    studentId: text("student_id").references(() => students.id, {
      onDelete: "cascade",
    }),
    taxId: text("tax_id"),
    updatedAt: updatedAt(),
  },
  (t) => [unique("monthly_fees_unique").on(t.studentId, t.month)]
);

export const transactions = sqliteTable("transactions", {
  // Money as integer cents (Postgres `numeric(10,2)` → `integer` cents).
  amount: integer("amount").notNull().default(0),
  automatic: integer("automatic", { mode: "boolean" }).notNull().default(false),
  category: text("category").notNull().default("Other"),
  coachId: text("coach_id").references(() => coaches.id, {
    onDelete: "set null",
  }),
  createdAt: createdAt(),
  date: text("date").notNull(),
  description: text("description"),
  id: id(),
  monthlyFeeId: text("monthly_fee_id").references(() => monthlyFees.id, {
    onDelete: "cascade",
  }),
  trainingId: text("training_id").references(() => trainings.id, {
    onDelete: "cascade",
  }),
  type: text("type").notNull(),
  updatedAt: updatedAt(),
});
