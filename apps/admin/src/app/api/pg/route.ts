import { env } from "cloudflare:workers";
import { createDb } from "@ssa/database/client";
// biome-ignore lint/performance/noNamespaceImport: dynamic table access requires a namespace import
import * as schema from "@ssa/database/schema";
import { and, asc, desc, eq, gte, inArray } from "drizzle-orm";
import { requireAuth } from "@/integrations/auth/server";

/**
 * Post-processing for the `students` table: the old Postgres schema had a
 * `uuid[]` column `group_ids` that no longer exists in D1. Membership is now
 * stored in the `student_groups` join table. This helper hydrates `group_ids`
 * on select results and strips it from insert/update payloads (the join rows
 * are written separately).
 */
async function resolveStudentGroups(
  db: ReturnType<typeof createDb>,
  studentIds: string[]
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (studentIds.length === 0) {
    return map;
  }
  const rows = (await db
    .select({
      groupId: schema.studentGroups.groupId,
      studentId: schema.studentGroups.studentId,
    })
    .from(schema.studentGroups)
    .where(inArray(schema.studentGroups.studentId, studentIds))) as {
    studentId: string;
    groupId: string;
  }[];
  for (const r of rows) {
    const arr = map.get(r.studentId) ?? [];
    arr.push(r.groupId);
    map.set(r.studentId, arr);
  }
  return map;
}

interface Filter {
  column: string;
  type: "eq" | "gte" | "in";
  value: unknown;
}

interface Order {
  ascending: boolean;
  column: string;
}

interface QueryState {
  cols?: string;
  filters: Filter[];
  limit?: number;
  op: "delete" | "insert" | "select" | "update" | "upsert";
  order: Order[];
  payload?: unknown;
  single?: boolean;
  table: string;
  upsertOptions?: { onConflict?: string };
}

/**
 * Map logical (snake_case) table names to Drizzle table objects. The values are
 * typed `unknown` because this route is a generic translation layer that must
 * be able to address any table/column at runtime — type safety is deliberately
 * relaxed here (the schema objects are still the source of truth for SQL).
 */
const tables: Record<string, unknown> = {
  availability: schema.availability,
  club_sessions: schema.clubSessions,
  clubs: schema.clubs,
  coaches: schema.coaches,
  field_availability: schema.fieldAvailability,
  fields: schema.fields,
  groups: schema.groups,
  monthly_fees: schema.monthlyFees,
  notification_settings: schema.notificationSettings,
  personal_reminders: schema.personalReminders,
  reminder_history: schema.reminderHistory,
  student_groups: schema.studentGroups,
  students: schema.students,
  trainings: schema.trainings,
  transactions: schema.transactions,
};

/**
 * Look up a physical (snake_case) column on a Drizzle table object. Drizzle
 * exposes each column under its physical name, so this returns the real column
 * object (correct SQL generation, injection-safe).
 */
// biome-ignore lint/suspicious/noExplicitAny: column objects are passed to drizzle-orm operators that require AnyColumn
function col(table: unknown, name: string): any {
  const c = (table as Record<string, unknown>)[name];
  if (typeof c !== "object" || c === null) {
    throw new Error(`Unknown column: ${name}`);
  }
  return c;
}

function buildWhere(table: unknown, filters: Filter[]) {
  if (filters.length === 0) {
    return;
  }
  const conds = filters.map((f) => {
    const c = col(table, f.column);
    if (f.type === "eq") {
      return eq(c, f.value as never);
    }
    if (f.type === "in") {
      return inArray(c, f.value as unknown[]);
    }
    if (f.type === "gte") {
      return gte(c, f.value as never);
    }
    throw new Error(`Unsupported filter type: ${f.type}`);
  });
  // biome-ignore lint/suspicious/noExplicitAny: and() spread needs the raw condition type
  return conds.length === 1 ? conds[0] : (and(...conds) as any);
}

function parseCols(table: unknown, cols?: string) {
  if (!cols || cols.trim() === "*") {
    return;
  }
  return cols
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)
    .map((c) => col(table, c));
}

function json(data: unknown, status = 200) {
  return Response.json({ data }, { status });
}

/**
 * Bidirectional key maps for a table:
 *   - camelToSnake: Drizzle row key (camelCase) → physical column (snake_case)
 *   - snakeToCamel: physical column (snake_case) → Drizzle row key (camelCase)
 *
 * Translates rows returned by Drizzle (camelCase) into the snake_case shape the
 * old PostgREST client returned, and translates snake_case client payloads into
 * camelCase for Drizzle inserts/updates.
 */
function keyMap(table: unknown) {
  const camelToSnake: Record<string, string> = {};
  const snakeToCamel: Record<string, string> = {};
  for (const [key, colObj] of Object.entries(
    table as Record<string, unknown>
  )) {
    const c = colObj as { name?: string };
    if (c && typeof c.name === "string") {
      camelToSnake[key] = c.name;
      snakeToCamel[c.name] = key;
    }
  }
  return { camelToSnake, snakeToCamel };
}

/** Drizzle row (camelCase) → PostgREST shape (snake_case). */
function toSnake(row: Record<string, unknown>, map: Record<string, string>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    out[map[k] ?? k] = v;
  }
  return out;
}

/** Client payload (snake_case) → Drizzle key shape (camelCase). */
function toCamel(row: Record<string, unknown>, map: Record<string, string>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    out[map[k] ?? k] = v;
  }
  return out;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: generic translation layer for 5 CRUD ops × N tables
export async function POST(request: Request) {
  // Every data route requires an authenticated admin session.
  await requireAuth(request);

  const state = (await request.json()) as QueryState;
  const table = tables[state.table];
  if (!table) {
    return json(`Unknown table: ${state.table}`, 400);
  }
  const { camelToSnake, snakeToCamel } = keyMap(table);

  const db = createDb(env.DB);
  const now = new Date().toISOString();

  try {
    switch (state.op) {
      case "select": {
        const cols = parseCols(table, state.cols);
        const where = buildWhere(table, state.filters);
        // biome-ignore lint/suspicious/noExplicitAny: dynamic table/column selection at runtime
        let q: any = cols
          ? // biome-ignore lint/suspicious/noExplicitAny: dynamic table
            db.select(cols as never).from(table as any)
          : // biome-ignore lint/suspicious/noExplicitAny: dynamic table
            db.select().from(table as any);
        if (where) {
          q = q.where(where);
        }
        if (state.order.length) {
          q = q.orderBy(
            ...state.order.map((o) =>
              o.ascending
                ? asc(col(table, o.column))
                : desc(col(table, o.column))
            )
          );
        }
        if (state.limit) {
          q = q.limit(state.limit);
        }
        const rows = (await q) as Record<string, unknown>[];
        let data: unknown;
        if (state.single) {
          data = rows[0] ? toSnake(rows[0], camelToSnake) : null;
        } else {
          data = rows.map((r) => toSnake(r, camelToSnake));
        }
        // Hydrate group_ids from the student_groups join table for selects on
        // the students table (parity with the old Postgres uuid[] column).
        if (state.table === "students" && !state.cols) {
          const arr = Array.isArray(data) ? data : [data];
          const ids = arr
            .filter(
              (r): r is Record<string, unknown> =>
                typeof r === "object" && r !== null
            )
            .map((r) => r.id as string);
          const groupsMap = await resolveStudentGroups(db, ids);
          for (const r of arr) {
            if (r) {
              r.group_ids = groupsMap.get(r.id as string) ?? null;
            }
          }
          if (state.single) {
            data = arr[0] ?? null;
          }
        }
        return json(data);
      }

      case "insert": {
        const rawRows = Array.isArray(state.payload)
          ? (state.payload as object[])
          : [state.payload as object];
        // For students, extract group_ids into student_groups join rows.
        let joinRows: { studentId: string; groupId: string }[] | null = null;
        const rows = rawRows.map((r) => {
          const row = r as Record<string, unknown>;
          let id = row.id as string | undefined;
          if (state.table === "students" && Array.isArray(row.group_ids)) {
            id ??= crypto.randomUUID();
            row.id = id;
            if (!joinRows) {
              joinRows = [];
            }
            for (const t of row.group_ids as string[]) {
              joinRows.push({ groupId: t, studentId: id });
            }
          }
          row.group_ids = undefined;
          const camel = toCamel(row, snakeToCamel) as {
            createdAt?: string;
            updatedAt?: string;
          };
          return {
            ...camel,
            createdAt: camel.createdAt ?? now,
            updatedAt: camel.updatedAt ?? now,
          };
        });
        const result = (await db
          // biome-ignore lint/suspicious/noExplicitAny: dynamic table value
          .insert(table as any)
          .values(rows)
          .returning()) as Record<string, unknown>[];
        if (joinRows) {
          await db.insert(schema.studentGroups).values(joinRows);
        }
        const data = state.single
          ? result[0]
            ? toSnake(result[0], camelToSnake)
            : null
          : result.map((r) => toSnake(r, camelToSnake));
        return json(data);
      }

      case "update": {
        const where = buildWhere(table, state.filters);
        if (!where) {
          return json("UPDATE needs a filter", 400);
        }
        const setObj = toCamel(
          state.payload as Record<string, unknown>,
          snakeToCamel
        );
        // For students, sync the student_groups join table when group_ids is set.
        if (state.table === "students" && "group_ids" in setObj) {
          const groupIds = setObj.group_ids as string[] | null;
          const studentId = state.filters.find((f) => f.column === "id")
            ?.value as string | undefined;
          if (studentId) {
            await db
              .delete(schema.studentGroups)
              .where(eq(schema.studentGroups.studentId, studentId));
            if (Array.isArray(groupIds)) {
              const newRows = groupIds.map((t) => ({
                groupId: t,
                studentId,
              }));
              if (newRows.length) {
                await db.insert(schema.studentGroups).values(newRows);
              }
            }
          }
        }
        setObj.group_ids = undefined;
        const result = (await db
          // biome-ignore lint/suspicious/noExplicitAny: dynamic table value
          .update(table as any)
          .set({ ...setObj, updatedAt: now })
          .where(where)
          .returning()) as Record<string, unknown>[];
        return json(result.map((r) => toSnake(r, camelToSnake)));
      }

      case "upsert": {
        const raw = state.payload as Record<string, unknown>;
        const onConflict = state.upsertOptions?.onConflict;
        if (!onConflict) {
          return json("upsert needs onConflict", 400);
        }
        const row = toCamel(raw, snakeToCamel);
        // biome-ignore lint/suspicious/noExplicitAny: drizzle onConflict target requires typed column refs
        const target: any[] = onConflict
          .split(",")
          .map((c) => c.trim())
          .map((c) => col(table, c));
        const result = (await db
          // biome-ignore lint/suspicious/noExplicitAny: dynamic table value
          .insert(table as any)
          .values({ ...row, updatedAt: now })
          .onConflictDoUpdate({ set: row, target })
          .returning()) as Record<string, unknown>[];
        return json(result.map((r) => toSnake(r, camelToSnake)));
      }

      case "delete": {
        const where = buildWhere(table, state.filters);
        if (!where) {
          return json("DELETE needs a filter", 400);
        }
        const result = (await db
          // biome-ignore lint/suspicious/noExplicitAny: dynamic table value
          .delete(table as any)
          .where(where)
          .returning()) as Record<string, unknown>[];
        // For students, remove their student_groups join rows.
        if (state.table === "students" && result.length) {
          const ids = result.map((r) => r.id as string);
          await db
            .delete(schema.studentGroups)
            .where(inArray(schema.studentGroups.studentId, ids));
        }
        return json(result.map((r) => toSnake(r, camelToSnake)));
      }

      default:
        return json("Unknown operation", 400);
    }
  } catch (e) {
    return json(e instanceof Error ? e.message : String(e), 400);
  }
}
