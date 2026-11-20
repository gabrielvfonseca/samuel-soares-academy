"use client";

/**
 * Browser data client with a Supabase-compatible query chain.
 *
 * Replaces the old `@supabase/supabase-js` browser client. Instead of talking
 * to PostgREST, every query is serialized into a small JSON descriptor and
 * POSTed to `/api/pg`, which executes it via Drizzle against the Cloudflare
 * D1 binding. The auth object talks to `/api/auth/*` (Better Auth, first-party
 * cookie) and the storage object to `/api/storage/*` (Cloudflare R2).
 *
 * Supported subset (the only one this app uses):
 *   .from(t).select(cols).eq/in/gte/limit/order().single()   (chained order ok)
 *   .from(t).insert(obj | rows).select().single()
 *   .from(t).update(obj).eq()
 *   .from(t).upsert(obj, { onConflict })
 *   .from(t).delete().eq()/in()
 *   .auth.getSession() / .getUser() / .signOut() / .setSession()
 *   .storage.from(b).list/upload/remove/download
 */

export interface PgResult<T> {
  data: T;
  error: { message: string } | null;
}

interface Filter {
  column: string;
  type: "eq" | "in" | "gte";
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

class QueryBuilder {
  private readonly state: QueryState;

  constructor(table: string) {
    this.state = { filters: [], op: "select", order: [], table };
  }

  select(cols = "*") {
    this.state.op = "select";
    this.state.cols = cols;
    return this;
  }

  insert(rows: unknown) {
    this.state.op = "insert";
    this.state.payload = rows;
    return this;
  }

  update(obj: unknown) {
    this.state.op = "update";
    this.state.payload = obj;
    return this;
  }

  upsert(obj: unknown, opts?: { onConflict?: string }) {
    this.state.op = "upsert";
    this.state.payload = obj;
    if (opts) {
      this.state.upsertOptions = opts;
    }
    return this;
  }

  delete() {
    this.state.op = "delete";
    return this;
  }

  eq(column: string, value: unknown) {
    this.state.filters.push({ column, type: "eq", value });
    return this;
  }

  in(column: string, values: unknown[]) {
    this.state.filters.push({ column, type: "in", value: values });
    return this;
  }

  gte(column: string, value: unknown) {
    this.state.filters.push({ column, type: "gte", value });
    return this;
  }

  order(column: string, opts?: { ascending?: boolean }) {
    this.state.order.push({
      ascending: opts?.ascending ?? true,
      column,
    });
    return this;
  }

  limit(n: number) {
    this.state.limit = n;
    return this;
  }

  single() {
    this.state.single = true;
    return this;
  }

  // biome-ignore lint/suspicious/noThenProperty: this class is intentionally thenable so it can be awaited directly.
  then<T = unknown>(
    resolve?: (value: PgResult<T>) => T,
    reject?: (err: Error) => unknown
  ) {
    return this.execute<T>().then(resolve, reject);
  }

  private async execute<T = unknown>(): Promise<PgResult<T>> {
    let res: Response;
    try {
      res = await fetch("/api/pg", {
        body: JSON.stringify(this.state),
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
    } catch (e) {
      return {
        data: null as T,
        error: { message: e instanceof Error ? e.message : "Network error" },
      };
    }

    const json = (await res.json().catch(() => ({}))) as {
      data?: T;
      error?: string;
    };
    if (!res.ok || json.error) {
      return {
        data: null as T,
        error: { message: json.error ?? res.statusText },
      };
    }
    return { data: json.data as T, error: null };
  }
}

// --- Auth (Better Auth, first-party cookie) ---

const auth = {
  async getSession() {
    const res = await fetch("/api/auth/session", {
      credentials: "same-origin",
    });
    if (!res.ok) {
      return { data: { session: null } };
    }
    const json = (await res.json()) as { session: unknown };
    return { data: { session: json.session } };
  },
  async getUser() {
    const res = await fetch("/api/auth/session", {
      credentials: "same-origin",
    });
    if (!res.ok) {
      return { data: { user: null }, error: null };
    }
    const json = (await res.json()) as { user: unknown };
    return { data: { user: json.user }, error: null };
  },
  // No-op: under the cookie model the session is created server-side by the
  // login action (Better Auth sets the first-party cookie in the response).
  async setSession(_opts: { access_token: string; refresh_token: string }) {
    return { data: null, error: null };
  },
  async signOut() {
    await fetch("/api/auth/sign-out", {
      credentials: "same-origin",
      method: "POST",
    });
  },
};

// --- Storage (Cloudflare R2, served through /api/storage/*) ---

function storageBucket(_bucket: string) {
  return {
    async download(path: string): Promise<{ data: Blob | null; error: null }> {
      const res = await fetch(
        `/api/storage/download?path=${encodeURIComponent(path)}`,
        { credentials: "same-origin" }
      );
      if (!res.ok) {
        return { data: null, error: null };
      }
      return { data: await res.blob(), error: null };
    },
    async list(
      prefix: string,
      _opts?: { sortBy?: { column: string; order: string } }
    ) {
      const res = await fetch(
        `/api/storage/list?prefix=${encodeURIComponent(prefix)}`,
        { credentials: "same-origin" }
      );
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        items?: unknown[];
      };
      if (!res.ok || json.error) {
        return { data: [], error: { message: json.error ?? "list failed" } };
      }
      return { data: json.items ?? [], error: null };
    },
    async remove(paths: string[]) {
      const res = await fetch("/api/storage/remove", {
        body: JSON.stringify({ paths }),
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok || json.error) {
        return {
          data: [],
          error: { message: json.error ?? "remove failed" },
        };
      }
      return { data: paths, error: null };
    },
    async upload(path: string, file: File, _opts?: { upsert?: boolean }) {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(
        `/api/storage/upload?path=${encodeURIComponent(path)}`,
        { body: form, credentials: "same-origin", method: "POST" }
      );
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok || json.error) {
        return {
          data: null,
          error: { message: json.error ?? "upload failed" },
        };
      }
      return { data: { path }, error: null };
    },
  };
}

const supabase = {
  auth,
  from(table: string) {
    return new QueryBuilder(table);
  },
  storage: {
    from(bucket: string) {
      return storageBucket(bucket);
    },
  },
};

export { supabase };
