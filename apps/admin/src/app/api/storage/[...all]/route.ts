import { env } from "cloudflare:workers";
import { requireAuth } from "@/integrations/auth/server";

/**
 * Cloudflare R2 storage routes. These replace the old Supabase Storage API
 * for the `documentos` bucket (PDFs / images attached to aluno & treinador
 * profiles). Every request is authenticated through the Better Auth cookie.
 *
 * The R2 binding is `env.BUCKET` (an R2Bucket, configured in
 * cloudflare.config.ts for the admin app).
 */

interface R2Object {
  arrayBuffer: () => Promise<ArrayBuffer>;
  httpEtag: string;
  key: string;
  size: number;
  uploaded: Date;
}

interface R2Bucket {
  delete: (keys: string[]) => Promise<void>;
  get: (key: string) => Promise<R2Object | null>;
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
    value: BodyInit,
    opts?: {
      httpMetadata?: Record<string, string>;
    }
  ) => Promise<R2Object | null>;
}

const bucket = () => env.BUCKET as unknown as R2Bucket;

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
    await bucket().put(path, file, {
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
