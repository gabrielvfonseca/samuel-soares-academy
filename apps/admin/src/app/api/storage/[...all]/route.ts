import { getEnv } from "@ssa/cloudflare";
import { requireAuth } from "@/integrations/auth/server";

/**
 * Cloudflare R2 storage routes. These replace the old Supabase Storage API
 * for the `documentos` bucket (PDFs / images attached to aluno & treinador
 * profiles). Every request is authenticated through the Better Auth cookie.
 *
 * The R2 binding is `env.BUCKET` (an R2Bucket, configured in
 * cloudflare.config.ts for the admin app).
 */

// Minimal structural surface of the R2 bucket we actually use. This is a
// *supertype* of the real R2 bucket (each method's parameter is `unknown`,
// its return a subtype), so `getEnv().BUCKET` is assignable to it. It is
// typed against the ambient globals the admin app actually uses (matching
// the generated `.cloudflare/types`), rather than the pinned
// `@cloudflare/workers-types` `R2Bucket` whose stream/`Blob` signatures are
// out of sync with this lib combo.
interface R2BucketLike {
  delete: (keys: string[]) => Promise<void>;
  get: (key: string) => Promise<{
    arrayBuffer: () => Promise<ArrayBuffer>;
    size: number;
  } | null>;
  list: (opts?: {
    delimiter?: string;
    limit?: number;
    prefix?: string;
  }) => Promise<{
    objects: {
      httpEtag: string;
      key: string;
      size: number;
      uploaded: Date;
    }[];
    truncated: boolean;
  }>;
  put: (
    key: string,
    value:
      | string
      | ArrayBuffer
      | ArrayBufferView
      | ReadableStream
      | Blob
      | null,
    opts?: { httpMetadata?: Record<string, string> }
  ) => Promise<unknown>;
}

// `getEnv().BUCKET` is typed by the pinned `@cloudflare/workers-types`
// `R2Bucket`, whose `put` references that package's own `Blob`/`ReadableStream`.
// Those are structurally out of sync with the global DOM lib this app uses
// (a `getReader` arity mismatch), so a direct structural assignment fails.
// The object *is* a real R2 bucket at runtime, so we cast once here.
const bucket = (): R2BucketLike => getEnv().BUCKET as unknown as R2BucketLike;

/** Strip the `documentos/`-style bucket prefix if present. R2 keys are
 * bucket-relative, so we store paths without the leading bucket name. */
function normalizeKey(path: string) {
  return path.replace(/^[/]+/u, "");
}

export async function GET(request: Request) {
  await requireAuth(request);
  const url = new URL(request.url);
  const op = url.pathname.split("/").pop() ?? "";

  if (op === "list") {
    const prefix = normalizeKey(url.searchParams.get("prefix") ?? "");
    const { objects } = await bucket().list({ limit: 1000, prefix });
    const items = objects.map((o) => ({
      created_at: o.uploaded.toISOString(),
      id: o.httpEtag,
      last_modified: o.uploaded.toISOString(),
      metadata: {},
      name: o.key.split("/").pop() ?? o.key,
      size: o.size,
      updated_at: o.uploaded.toISOString(),
    }));
    return Response.json({ items });
  }

  if (op === "download") {
    const path = normalizeKey(url.searchParams.get("path") ?? "");
    const obj = await bucket().get(path);
    if (!obj) {
      return Response.json({ error: "not found" }, { status: 404 });
    }
    const buf = await obj.arrayBuffer();
    return new Response(buf, {
      headers: {
        "Content-Length": String(obj.size),
        "Content-Type":
          url.searchParams.get("type") ?? "application/octet-stream",
      },
    });
  }

  return Response.json({ error: "unknown op" }, { status: 400 });
}

export async function POST(request: Request) {
  await requireAuth(request);
  const url = new URL(request.url);
  const op = url.pathname.split("/").pop() ?? "";

  if (op === "upload") {
    const path = normalizeKey(url.searchParams.get("path") ?? "");
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "no file" }, { status: 400 });
    }
    // R2's `put` accepts a `ReadableStream` (the most permissive overload),
    // which sidesteps the structural mismatch between the DOM `File`/`Blob`
    // and the workers-types `Blob`. Content type is carried via httpMetadata.
    await bucket().put(path, file.stream(), {
      httpMetadata: { "Content-Type": file.type },
    });
    return Response.json({ path });
  }

  if (op === "remove") {
    const body = (await request.json()) as { paths: string[] };
    const keys = (body.paths ?? []).map(normalizeKey);
    await bucket().delete(keys);
    return Response.json({ paths: keys });
  }

  return Response.json({ error: "unknown op" }, { status: 400 });
}
