# Cloudflare Shared Package — Migration Plan

> **Status: COMPLETE.** All checkboxes done; `pnpm check`, `pnpm check-types` and both
> dev servers verified. Where the implementation deviated from this plan, the note is
> inlined at the relevant step.

## Goal

Create a new `packages/cloudflare` (`@ssa/cloudflare`) package that exports **one shared
Cloudflare client and SDK**. Every app/package that currently touches Cloudflare will
import from the new package instead of setting up its own client, types, or local
interfaces. Duplicate and local client setup is removed.

---

## Part 1 — Complete Inventory of Current Cloudflare Usage

### 1.1 Services & Bindings in Use

| Service      | Binding(s)                | Declared In                          | Consumed By                                        |
| ------------ | ------------------------- | ------------------------------------ | -------------------------------------------------- |
| D1 Database  | `DB` → `ssa-db`           | `apps/admin/cloudflare.config.ts`    | admin (db client, auth, pg, acesso, cron)          |
| KV Namespace | `KV`, `VINEXT_KV_CACHE`   | `apps/site/cloudflare.config.ts`     | site (redis, rate-limit)                           |
| R2 Bucket    | `BUCKET` → `documentos`   | `apps/admin/cloudflare.config.ts`    | admin (storage route)                              |
| Images       | `IMAGES`                  | `apps/site/cloudflare.config.ts`     | (declared only — no runtime usage found)           |
| Assets       | `ASSETS`                  | both `cloudflare.config.ts`          | vinext internal                                    |

### 1.2 Every File That Imports Cloudflare

#### `cloudflare:workers` runtime imports (env access)

| # | File                                             | Import                    | Bindings Used                     |
|---|--------------------------------------------------|---------------------------|-----------------------------------|
| 1 | `apps/site/src/env.ts`                           | `env as cfEnv`            | all site text bindings + KV       |
| 2 | `apps/admin/src/lib/cron-route.ts`               | `env`                     | `CRON_SECRET`                     |
| 3 | `apps/admin/src/lib/actions/acesso.ts`           | `env`                     | `DB`, `INTERNAL_ACCESS_CODE`      |
| 4 | `apps/admin/src/app/api/pg/route.ts`             | `env`                     | `DB`                              |
| 5 | `apps/admin/src/app/api/storage/[...all]/route.ts` | `env`                   | `BUCKET`                          |
| 6 | `apps/admin/src/integrations/db/client.server.ts`| `env`                     | `DB`                              |
| 7 | `apps/admin/src/integrations/auth/server.ts`     | `env`                     | `DB`, `BETTER_AUTH_*`             |

#### `@cloudflare/workers-types` (type imports)

| # | File                                             | Import                        |
|---|--------------------------------------------------|-------------------------------|
| 1 | `packages/database/src/client.ts`                | `D1Database`, `D1PreparedStatement`, `D1Response` |
| 2 | `apps/site/src/types/cloudflare-workers.d.ts`    | `ImageBinding`, `KVNamespace` |
| 3 | `apps/admin/src/types/cloudflare-workers.d.ts`   | `R2Bucket`, `D1Database`      |

#### `@cloudflare/config` (worker config definition)

| # | File                                  | Import                                          |
|---|---------------------------------------|-------------------------------------------------|
| 1 | `apps/site/cloudflare.config.ts`      | `bindings`, `defineConfig`, `defineWorker`      |
| 2 | `apps/admin/cloudflare.config.ts`     | `bindings`, `defineConfig`, `defineWorker`      |

#### `@cloudflare/vite-plugin` (build tooling)

| # | File                          | Import          |
|---|-------------------------------|-----------------|
| 1 | `apps/site/vite.config.ts`    | `cloudflare`    |
| 2 | `apps/admin/vite.config.ts`   | `cloudflare`    |

### 1.3 D1 Client Factory (shared)

**`packages/database/src/client.ts`** — exports `createDb(d1: D1Database)` which wraps a
D1 binding in a transaction-safe proxy and returns a Drizzle instance. This is the **only
place** a Drizzle-over-D1 client is created. Imported by:

- `apps/admin/src/integrations/db/client.server.ts` → `createDb(env.DB)`
- `apps/admin/src/integrations/auth/server.ts` → `createDb(env.DB)`
- `apps/admin/src/lib/actions/acesso.ts` → `createDb(env.DB)`
- `apps/admin/src/app/api/pg/route.ts` → `createDb(env.DB)`

### 1.4 R2 Local Interface (duplicate — to be removed)

**`apps/admin/src/app/api/storage/[...all]/route.ts`** (lines 13–46) defines a **local**
`R2Object` + `R2Bucket` interface and casts `env.BUCKET as unknown as R2Bucket`. This is
a duplicate of the real `R2Bucket` type from `@cloudflare/workers-types`.

### 1.5 KV Access (site)

- **`apps/site/src/lib/redis.ts`** — `export const kv = env.KV;` (re-export of KV binding)
- **`apps/site/src/lib/rate-limit.ts`** — `const kv = env.KV;` (sliding-window rate limiter)

### 1.6 Env Augmentation (`.d.ts` files)

- **`apps/site/src/types/cloudflare-workers.d.ts`** — augments `Cloudflare.Env` with
  `ASSETS`, `CONTACT_EMAIL_FROM/TO`, `IMAGES`, `KV`, `NEXT_PUBLIC_*`, `NODE_ENV`,
  `RESEND_API_KEY`, `VINEXT_KV_CACHE`, `WHATSAPP_PHONE`.
- **`apps/admin/src/types/cloudflare-workers.d.ts`** — augments `Cloudflare.Env` with
  `BETTER_AUTH_SECRET/URL`, `BUCKET`, `CRON_SECRET`, `DB`, `INTERNAL_ACCESS_CODE`,
  `LOVABLE_API_KEY`, `NODE_ENV`, `RESEND_API_KEY`.

Both are included in their app's `tsconfig.json` via `.cloudflare/types/**/*.ts`.

### 1.7 Package.json Dependencies

| Package              | Deps / DevDeps with Cloudflare                          |
| -------------------- | -------------------------------------------------------- |
| `apps/site`          | `@cloudflare/config`, `@cloudflare/vite-plugin`, `@vinext/cloudflare`, `cf`, `vinext` |
| `apps/admin`         | `@cloudflare/config`, `@cloudflare/vite-plugin`, `@vinext/cloudflare`, `cf`, `vinext` |
| `packages/database`  | `@cloudflare/workers-types` (dev), `wrangler` (dev)      |

### 1.8 pnpm-workspace.yaml

- `catalog:` → `"@cloudflare/workers-types": "^4.20250109.0"` (line 31)
- `allowBuilds:` → `workerd: true` (line 43)

### 1.9 Wrangler / Tooling Config

- `packages/database/wrangler.jsonc` — D1 migration config (`main: noop.js`)
- `packages/database/noop.js` — no-op worker entrypoint for wrangler CLI
- `.vscode/extensions.json` — recommends `cloudflare.cloudflare`
- `.vscode/settings.json` — excludes `**/.cloudflare` from search

---

## Part 2 — New Package Design: `@ssa/cloudflare`

### 2.1 What It Exports

| Subpath                 | Exports                                                                 |
| ----------------------- | ----------------------------------------------------------------------- |
| `@ssa/cloudflare`       | `createDb(d1)`, `makeD1TransactionSafe(d1)`, `getEnv()`                 |
| `@ssa/cloudflare/types` | `D1Database`, `D1PreparedStatement`, `D1Response`, `R2Bucket`, `KVNamespace`, `ImagesBinding`, `Env` |

> Note: the original plan proposed `getDb()` / `getKv()` / `getBucket()` accessors and a
> `@ssa/cloudflare/client` + `/env` subpath. Both were dropped during implementation —
> `createDb` and `getEnv` are exported from the root, and `types` is the only subpath
> (so the app `.d.ts` files can import types without pulling in the runtime).

### 2.2 File Layout

```
packages/cloudflare/
  package.json
  tsconfig.json
  src/
    index.ts                 # re-export client + env (types is a separate subpath)
    client.ts                # createDb() + makeD1TransactionSafe() — MOVED from packages/database/src/client.ts
    env.ts                   # getEnv() — typed wrapper over `cloudflare:workers` env
    types.ts                 # re-export of @cloudflare/workers-types subset
    cloudflare-workers.d.ts  # minimal ambient `declare module "cloudflare:workers"` so the
                             #   package type-checks in isolation without app-generated types
```

### 2.3 Key Design Decisions

1. **`createDb` + `makeD1TransactionSafe` move from `@ssa/database` to `@ssa/cloudflare`.**
   `packages/database/src/client.ts` is **deleted entirely** (no re-export shim), so
   every call site imports directly from `@ssa/cloudflare`. This also removes the
   `@ssa/cloudflare` ↔ `@ssa/database` cyclic-dependency warning.

2. **`getEnv()` wraps `cloudflare:workers` env.**
   Every app file that did `import { env } from "cloudflare:workers"` now does
   `import { getEnv } from "@ssa/cloudflare"` and calls `getEnv()` at the point of use.
   The wrapper returns the same `Env` object typed by each app's `.cloudflare/types`
   augmentation, so no runtime change.

3. **No `getKv()` / `getBucket()` accessors.**
   Call sites use `getEnv().KV` / `getEnv().BUCKET` directly. The storage route keeps a
   small app-local `R2BucketLike` interface (see Step 3f) because the pinned
   `@cloudflare/workers-types` `R2Bucket` is structurally out of sync with the app's
   global DOM lib (its module-scoped `Blob`/`ReadableStream` differ from the global DOM
   versions in `getReader` arity), so a direct `R2Bucket` return type would reject the
   app's `File`/`Blob`/`stream()`.

4. **`types.ts` re-exports `@cloudflare/workers-types`.**
   Both apps' `.d.ts` files import from `@ssa/cloudflare/types` instead of
   `@cloudflare/workers-types` directly, so the dependency is declared once in the new
   package. The export name is `ImagesBinding` (the real name in the pinned version) —
   not `ImageBinding`, which does not exist there.

5. **`@cloudflare/workers-types` becomes a dependency of `@ssa/cloudflare` only.**
   Both apps and `packages/database` remove their direct dependency on it.

### 2.4 `package.json`

```jsonc
{
  "name": "@ssa/cloudflare",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/types.ts"
  },
  "scripts": {
    "check-types": "tsc-rs --noEmit"
  },
  "dependencies": {
    "drizzle-orm": "catalog:",
    "@cloudflare/workers-types": "catalog:"
  },
  "devDependencies": {
    "@ssa/typescript-config": "workspace:*",
    "@types/node": "catalog:",
    "tsc-rs": "catalog:",
    "typescript": "catalog:"
  }
}
```

> Note: `@cloudflare/workers-types` is listed as a **dependency** (not dev) because it is
> re-exported from `./types`. The catalog already has it at `^4.20250109.0`.

---

## Part 3 — Step-by-Step Migration

### Step 1 — Create `packages/cloudflare`

- [x] Create directory `packages/cloudflare/`
- [x] Write `package.json` (see 2.4)
- [x] Write `tsconfig.json` extending `@ssa/typescript-config/node-library.json`
- [x] Write `src/types.ts`:
  ```ts
  export type {
    D1Database,
    D1PreparedStatement,
    D1Response,
    R2Bucket,
    KVNamespace,
    ImageBinding,
  } from "@cloudflare/workers-types";
  ```
- [x] Write `src/env.ts`:
  ```ts
  import { env as cfEnv } from "cloudflare:workers";
  /**
   * Typed access to the Cloudflare Workers env bindings.
   * The `Env` type is augmented per-app via `.cloudflare/types`.
   */
  export function getEnv() {
    return cfEnv;
  }
  ```
- [x] Write `src/client.ts` — **move** `createDb` + `makeD1TransactionSafe` from
  `packages/database/src/client.ts`, importing types from `./types` instead of
  `@cloudflare/workers-types` directly.
- [x] Write `src/index.ts`:
  ```ts
  export { createDb, makeD1TransactionSafe } from "./client";
  export { getEnv } from "./env";
  // types is a separate subpath export (./types) so the app .d.ts files can import
  // types without pulling in the runtime
  ```
- [x] Write `src/cloudflare-workers.d.ts` — minimal ambient declaration:
  ```ts
  declare module "cloudflare:workers" {
    export const env: any;
  }
  ```
  > This lets the package type-check in isolation (its own `check-types` script) without
  > needing an app's `.cloudflare/types`. At build time the app's generated types take
  > precedence for the actual worker bundle.

### Step 2 — Update `packages/database`

- [x] **Delete** `src/client.ts` (the client moved to `@ssa/cloudflare`); remove the
  `./client` subpath from `exports` in `packages/database/package.json` and update
  `src/index.ts` to only re-export `./schema`. (Deviation from original plan, which kept
  a thin re-export: no file imports the `@ssa/database` root or `/client` subpath, so the
  export was removed cleanly.)
- [x] Remove `@cloudflare/workers-types` + `@cloudflare/vitest-pool-workers` from devDeps
- [x] No `@ssa/cloudflare` dependency added (database no longer re-exports the client,
  so no dep on it)
- [x] `src/schema/` untouched (schema has no CF types)

### Step 3 — Migrate `apps/admin`

#### 3a. `src/integrations/db/client.server.ts`

```diff
- import { env } from "cloudflare:workers";
- import { createDb } from "@ssa/database/client";
+ import { createDb, getEnv } from "@ssa/cloudflare";

 export function getDb() {
-  return createDb(env.DB);
+  return createDb(getEnv().DB);
 }
```

#### 3b. `src/integrations/auth/server.ts`

```diff
- import { env } from "cloudflare:workers";
- import { createDb } from "@ssa/database/client";
+ import { createDb, getEnv } from "@ssa/cloudflare";

 export function getInstance() {
-  const db = createDb(env.DB);
+  const env = getEnv();
+  const db = createDb(env.DB);
   return betterAuth({
-    baseURL: env.BETTER_AUTH_URL ?? "http://localhost:9001",
+    baseURL: env.BETTER_AUTH_URL ?? "http://localhost:9001",
     ...
-    secret: env.BETTER_AUTH_SECRET,
+    secret: env.BETTER_AUTH_SECRET,
     ...
-      env.BETTER_AUTH_URL,
+      env.BETTER_AUTH_URL,
-      ...(env.BETTER_AUTH_TRUSTED_ORIGINS
+      ...(env.BETTER_AUTH_TRUSTED_ORIGINS
     ...
   });
 }
```

> All `env.X` references in this file now come from `getEnv()` (local const) rather than
> the module-level `cloudflare:workers` import.

#### 3c. `src/lib/cron-route.ts`

```diff
- import { env } from "cloudflare:workers";
+ import { getEnv } from "@ssa/cloudflare";

 function authenticate(request: Request): Response | null {
-  const secret = env.CRON_SECRET;
+  const secret = getEnv().CRON_SECRET;
   ...
 }
```

#### 3d. `src/lib/actions/acesso.ts`

```diff
- import { env } from "cloudflare:workers";
- import { createDb } from "@ssa/database/client";
+ import { createDb, getEnv } from "@ssa/cloudflare";

   // inside the action:
-  const esperado = env.INTERNAL_ACCESS_CODE;
+  const env = getEnv();
+  const esperado = env.INTERNAL_ACCESS_CODE;
   ...
-  const db = createDb(env.DB);
+  const db = createDb(env.DB);  // env now from getEnv()
```

#### 3e. `src/app/api/pg/route.ts`

```diff
- import { env } from "cloudflare:workers";
- import { createDb } from "@ssa/database/client";
+ import { createDb, getEnv } from "@ssa/cloudflare";

   // inside the handler:
-  const db = createDb(env.DB);
+  const db = createDb(getEnv().DB);
```

#### 3f. `src/app/api/storage/[...all]/route.ts`

```diff
- import { env } from "cloudflare:workers";
+ import { getEnv } from "@ssa/cloudflare";

- interface R2Object { ... }
- interface R2Bucket { ... }
- const bucket = () => env.BUCKET as unknown as R2Bucket;
+ const bucket = () => getEnv().BUCKET as unknown as R2BucketLike;
```

> **Deviation from original plan.** The local `R2Object`/`R2Bucket` interfaces were
> replaced by a small app-local `R2BucketLike` interface (only the methods the route
> calls: `put`/`get`/`list`/`delete`/`head`) rather than the pinned
> `@cloudflare/workers-types` `R2Bucket`. The pinned `R2Bucket` is structurally out of
> sync with the app's global DOM lib: its module-scoped `Blob`/`ReadableStream`
> (referenced by `R2Bucket.put`) have a `getReader` signature that conflicts with the
> global DOM versions, so a direct `R2Bucket` return type rejects the app's
> `File`/`Blob`/`stream()`. A single `as unknown as R2BucketLike` cast bridges it.

#### 3g. `src/types/cloudflare-workers.d.ts`

```diff
-     IMAGES: import("@cloudflare/workers-types").ImageBinding;
+     IMAGES: import("@ssa/cloudflare/types").ImageBinding;
-     BUCKET: import("@cloudflare/workers-types").R2Bucket;
+     BUCKET: import("@ssa/cloudflare/types").R2Bucket;
-     DB: import("@cloudflare/workers-types").D1Database;
+     DB: import("@ssa/cloudflare/types").D1Database;
```

> The `.d.ts` file stays in the app (it augments the app-specific `Cloudflare.Env`), but
> the type imports now come from `@ssa/cloudflare/types`.

#### 3h. `package.json`

- [x] Add `"@ssa/cloudflare": "workspace:*"` to `dependencies`
- [x] Remove `"@cloudflare/workers-types"` if present (it is not a direct dep of admin,
  only via the `.d.ts` import which now points to `@ssa/cloudflare/types`)

### Step 4 — Migrate `apps/site`

#### 4a. `src/env.ts`

```diff
- import { env as cfEnv } from "cloudflare:workers";
+ import { getEnv } from "@ssa/cloudflare";
+ const cfEnv = getEnv();

 export const env = {
   CONTACT_EMAIL_FROM: cfEnv.CONTACT_EMAIL_FROM,
   ...
-  NODE_ENV: (cfEnv.NODE_ENV ?? "development") as ...
+  NODE_ENV: (process.env.NODE_ENV ?? "development") as ...
   ...
 };
```

> `@/env` is still exported so `redis.ts` and `rate-limit.ts` don't change their import
> source. The `cloudflare:workers` import is now internal to `@ssa/cloudflare`.
>
> **`NODE_ENV` reads from `process.env`**, not from `cfEnv` — the site's
> `cloudflare.config.ts` does not declare a `NODE_ENV` binding, so it is absent from the
> inferred `Cloudflare.Env`. In the worker runtime `process.env.NODE_ENV` is set by the
> platform.

#### 4b. `src/lib/redis.ts`

No change — still imports `env` from `@/env`. (The `cloudflare:workers` import is now
hidden inside `@/env` → `@ssa/cloudflare`.)

#### 4c. `src/lib/rate-limit.ts`

No change — still imports `env` from `@/env`.

#### 4d. `src/types/cloudflare-workers.d.ts`

```diff
-     IMAGES: import("@cloudflare/workers-types").ImageBinding;
+     IMAGES: import("@ssa/cloudflare/types").ImageBinding;
-     KV: import("@cloudflare/workers-types").KVNamespace;
+     KV: import("@ssa/cloudflare/types").KVNamespace;
-     VINEXT_KV_CACHE: import("@cloudflare/workers-types").KVNamespace;
+     VINEXT_KV_CACHE: import("@ssa/cloudflare/types").KVNamespace;
```

#### 4e. `package.json`

- [x] Add `"@ssa/cloudflare": "workspace:*"` to `dependencies`

### Step 5 — Update `pnpm-workspace.yaml`

- [x] `@cloudflare/workers-types` stays in `catalog:` (now consumed by
  `@ssa/cloudflare` as a real dependency)
- [x] No other changes needed

### Step 6 — Remove Duplicate / Local Setup

- [x] **`packages/database/src/client.ts`** — **deleted** (client moved to `@ssa/cloudflare`)
- [x] **`apps/admin/src/app/api/storage/[...all]/route.ts`** — local `R2Object`/`R2Bucket`
  interfaces deleted (replaced by app-local `R2BucketLike` + one cast)
- [x] **`apps/admin/src/integrations/db/client.server.ts`** — no longer creates its own
  env access; uses `@ssa/cloudflare`
- [x] Both apps no longer import `cloudflare:workers` directly (all routed through
  `@ssa/cloudflare`)

### Step 7 — Verify

- [x] `pnpm install` — new workspace resolved
- [x] `pnpm check` — Biome lint/format passes
- [x] `pnpm check-types` — all three workspaces type-check
- [x] `pnpm dev` in both apps — dev servers start
- [x] `pnpm build` in both apps — production build succeeds
- [x] Grep for `cloudflare:workers` — only `packages/cloudflare/src/{env.ts,cloudflare-workers.d.ts}` match
- [x] Grep for `@cloudflare/workers-types` — only `packages/cloudflare/src/types.ts` +
  two explanatory comments in the storage route
- [x] Grep for `createDb` — all call sites import from `@ssa/cloudflare` (database no longer re-exports)

---

## Part 4 — Files Changed Summary

| File                                                        | Change Type        |
| ----------------------------------------------------------- | ------------------ |
| `packages/cloudflare/package.json`                           | **new**            |
| `packages/cloudflare/tsconfig.json`                          | **new**            |
| `packages/cloudflare/src/index.ts`                           | **new**            |
| `packages/cloudflare/src/client.ts`                          | **new** (moved)    |
| `packages/cloudflare/src/env.ts`                             | **new**            |
| `packages/cloudflare/src/types.ts`                           | **new**            |
| `packages/database/package.json`                             | edit (dep change)  |
| `packages/database/src/client.ts`                            | **deleted**        |
| `packages/database/src/index.ts`                             | edit               |
| `apps/site/AGENTS.md`                                        | edit (docs)        |
| `apps/admin/src/integrations/db/client.server.ts`            | edit               |
| `apps/admin/src/integrations/auth/server.ts`                 | edit               |
| `apps/admin/src/lib/cron-route.ts`                           | edit               |
| `apps/admin/src/lib/actions/acesso.ts`                       | edit               |
| `apps/admin/src/app/api/pg/route.ts`                         | edit               |
| `apps/admin/src/app/api/storage/[...all]/route.ts`           | edit               |
| `apps/admin/src/types/cloudflare-workers.d.ts`               | edit               |
| `apps/admin/package.json`                                    | edit               |
| `apps/site/src/env.ts`                                       | edit               |
| `apps/site/src/types/cloudflare-workers.d.ts`                | edit               |
| `apps/site/package.json`                                     | edit               |
| `pnpm-workspace.yaml`                                        | no change          |

**Total: 6 new files, 15 edited files, 1 deleted file** (+ lockfile + this plan doc).

---

## Part 5 — Risks & Mitigations

| Risk                                                        | Mitigation                                                                 |
| ----------------------------------------------------------- | -------------------------------------------------------------------------- |
| `cloudflare:workers` is a virtual module — Vite plugin must resolve it in the new package too | The new package is just-in-time (TS source, no build). Vite's `cloudflare()` plugin resolves `cloudflare:workers` for any module in the build graph, including workspace deps. No config change needed. |
| `@cloudflare/workers-types` as a runtime dep (not dev) may pull in unexpected code | `@cloudflare/workers-types` is types-only (`.d.ts` + `types.d.ts`). It has no runtime JS. Safe as a dependency. |
| `createDb` import chain changes | All 5 admin call sites were updated to import `createDb` from `@ssa/cloudflare` directly; `packages/database/src/client.ts` was deleted (no remaining consumers). |
| App `.d.ts` files import from `@ssa/cloudflare/types` — circular? | No. `@ssa/cloudflare/types` re-exports from `@cloudflare/workers-types`. The app `.d.ts` augments `Cloudflare.Env` with those types. No circularity. |
| `getEnv()` called multiple times per request | `cloudflare:workers` `env` is a module-level singleton in the worker runtime. `getEnv()` returns the same object every call. Zero overhead. |
