import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

/** Bearer-token check shared by every `/api/public/cron/*` handler (secret: TREINOS_CRON_SECRET). */
function authenticate(request: Request): Response | null {
  const secret = process.env["TREINOS_CRON_SECRET"];
  if (!secret) return new Response("Server configuration error", { status: 500 });
  const match = /^Bearer ([^\s,]+)$/.exec(request.headers.get("authorization") ?? "");
  const token = match?.[1];
  if (!token) return new Response("Unauthorized", { status: 401 });

  const digest = (v: string) => createHash("sha256").update(v, "utf8").digest();
  if (!timingSafeEqual(digest(token), digest(secret))) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}

/** Build a POST route handler that authenticates, runs the job and serialises the result. */
export function cronHandler(name: string, run: (request: Request) => Promise<unknown>) {
  return async function POST(request: Request): Promise<Response> {
    const denied = authenticate(request);
    if (denied) return denied;
    try {
      return Response.json(await run(request));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`cron ${name}:`, msg);
      return Response.json({ erro: msg }, { status: 500 });
    }
  };
}
