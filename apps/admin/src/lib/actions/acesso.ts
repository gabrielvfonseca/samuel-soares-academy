"use server";

import { env } from "cloudflare:workers";
import { createDb } from "@ssa/database/client";
import { betterAuthUser } from "@ssa/database/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getInstance } from "@/integrations/auth/server";

/**
 * Acesso restrito: a plataforma é interna e a única forma de entrar é o
 * código de acesso da academia (secret INTERNAL_ACCESS_CODE).
 * O código é validado no servidor e a sessão da conta interna é gravada
 * num cookie first-party (Better Auth), lido de volta em cada pedido.
 */
const EMAIL_INTERNO = "equipa@samuelsoaresacademy.internal";

interface Resultado {
  erro?: string;
  ok: boolean;
}

interface CookieOpts {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: "lax" | "none" | "strict";
  secure?: boolean;
}

/**
 * Parse a `Set-Cookie` header value into name, value and attributes so it
 * can be re-emitted via `cookies().set()` (the robust way to set cookies
 * from a Next.js server action).
 */
function parseSetCookie(header: string): {
  name: string;
  opts: CookieOpts;
  value: string;
} | null {
  const [pair, ...attrs] = header.split(";").map((s) => s.trim());
  if (!pair) {
    return null;
  }
  const eqIdx = pair.indexOf("=");
  const name = pair.slice(0, eqIdx);
  const value = pair.slice(eqIdx + 1);

  const lookup = (key: string): string | null => {
    for (const a of attrs) {
      const lower = a.toLowerCase();
      if (lower === key) {
        return "true";
      }
      const prefix = `${key}=`;
      if (lower.startsWith(prefix)) {
        return a.slice(prefix.length);
      }
    }
    return null;
  };

  const opts: CookieOpts = {
    httpOnly: lookup("httponly") !== null,
    path: lookup("path") ?? "/",
    secure: lookup("secure") !== null,
  };

  const domain = lookup("domain");
  if (domain !== null) {
    opts.domain = domain;
  }

  const maxAgeRaw = lookup("max-age");
  if (maxAgeRaw !== null) {
    opts.maxAge = Number(maxAgeRaw);
  }

  const expiresRaw = lookup("expires");
  if (expiresRaw !== null) {
    opts.expires = new Date(expiresRaw);
  }

  const sameSiteRaw = lookup("samesite");
  if (sameSiteRaw !== null) {
    opts.sameSite = sameSiteRaw.toLowerCase() as "lax" | "none" | "strict";
  }

  return { name, opts, value };
}

export async function entrarComCodigo(input: {
  codigo: string;
}): Promise<Resultado> {
  const codigo = String(input?.codigo ?? "").trim();
  if (!codigo) {
    return { erro: "Código de acesso em falta", ok: false };
  }

  const esperado = env.INTERNAL_ACCESS_CODE;
  if (!esperado) {
    throw new Error("Código de acesso não configurado");
  }
  if (codigo !== esperado) {
    return { erro: "Código de acesso inválido", ok: false };
  }

  const auth = getInstance();
  const db = createDb(env.DB);

  // Ensure the internal user exists (idempotent, by email).
  const [existente] = await db
    .select()
    .from(betterAuthUser)
    .where(eq(betterAuthUser.email, EMAIL_INTERNO))
    .limit(1);

  const password = `interno::${esperado}`;
  if (!existente) {
    await auth.api.signUpEmail({
      body: { email: EMAIL_INTERNO, name: "Equipa Interna", password },
    });
  }

  // Sign in through Better Auth's request handler. The handler produces a
  // Response whose `Set-Cookie` carries the signed session token.
  const res = await auth.handler(
    new Request(`${env.BETTER_AUTH_URL}/api/auth/sign-in/email`, {
      body: JSON.stringify({
        email: EMAIL_INTERNO,
        password,
        rememberMe: true,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    })
  );

  if (!res.ok) {
    return { erro: "Não foi possível iniciar sessão", ok: false };
  }

  // Re-emit the signed cookie through the Next.js cookie store so the
  // browser receives it on this response (server-action-safe).
  const setCookieHeader = res.headers.get("Set-Cookie");
  if (setCookieHeader) {
    const parsed = parseSetCookie(setCookieHeader);
    if (parsed) {
      (await cookies()).set(parsed.name, parsed.value, parsed.opts);
    }
  }

  return { ok: true };
}
