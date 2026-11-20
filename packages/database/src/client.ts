import type {
  D1Database,
  D1PreparedStatement,
  D1Response,
} from "@cloudflare/workers-types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

const emptyMeta = {
  size: 0,
  size_after: 0,
  changed_db: false,
  duration: 0,
  changes: 0,
  last_row_id: 0,
  rows_read: 0,
  rows_written: 0,
} as const;

const emptyResults = { results: [], success: true, meta: emptyMeta } as const;

function makeD1TransactionSafe(d1: D1Database): D1Database {
  return new Proxy(d1, {
    get(target: D1Database, prop: string | symbol, receiver: unknown) {
      const value = Reflect.get(target, prop, receiver);
      if (prop === "prepare") {
        return (sql: string): D1PreparedStatement => {
          const trimmed = sql.trim().toLowerCase();
          if (
            trimmed === "begin" ||
            trimmed === "begin transaction" ||
            trimmed === "begin deferred" ||
            trimmed === "begin immediate" ||
            trimmed === "begin exclusive" ||
            trimmed === "commit" ||
            trimmed === "end" ||
            trimmed === "rollback" ||
            trimmed.startsWith("savepoint")
          ) {
            return {
              bind: () => ({
                run: async (): Promise<D1Response> => ({ ...emptyResults }),
                all: async () => ({ ...emptyResults }),
                first: async (): Promise<unknown> => null,
                firstRow: async (): Promise<unknown> => null,
                raw: async (): Promise<unknown[]> => [],
                then: (resolve: (value: unknown) => void) =>
                  resolve({ ...emptyResults }),
              }),
              run: async (): Promise<D1Response> => ({ ...emptyResults }),
              all: async () => ({ ...emptyResults }),
              first: async (): Promise<unknown> => null,
              firstRow: async (): Promise<unknown> => null,
              raw: async (): Promise<unknown[]> => [],
            } as unknown as D1PreparedStatement;
          }
          return target.prepare(sql);
        };
      }
      return value;
    },
  });
}

/**
 * Create a Drizzle client over a Cloudflare D1 binding. Server-side only
 * (never import in browser bundles). The binding comes from
 * `import { env } from "cloudflare:workers"` in the worker runtime.
 */
export function createDb(d1: D1Database) {
  return drizzle(makeD1TransactionSafe(d1), { schema });
}

export type Database = ReturnType<typeof createDb>;
