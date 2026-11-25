import "server-only";

import { createDb, getEnv } from "@ssa/cloudflare";
import {
  betterAuthAccount,
  betterAuthSession,
  betterAuthUser,
  betterAuthVerification,
} from "@ssa/database/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { headers } from "next/headers";

/**
 * Create the Better Auth instance for the admin app, backed by D1.
 * The D1 binding comes from the Cloudflare Workers runtime.
 * Better Auth is stateless — each request creates its own instance.
 */
export function getInstance() {
  const env = getEnv();
  const db = createDb(env.DB);
  return betterAuth({
    baseURL: env.BETTER_AUTH_URL ?? "http://localhost:9001",
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        account: betterAuthAccount,
        session: betterAuthSession,
        user: betterAuthUser,
        verification: betterAuthVerification,
      },
      transaction: true,
    }),
    emailAndPassword: { enabled: true },
    secret: env.BETTER_AUTH_SECRET,
    session: {
      cookieCache: { enabled: true, maxAge: 30 * 60 },
    },
    // Origins the browser may call from. The workers.dev URL is always allowed
    // (prod); local dev origins come from BETTER_AUTH_TRUSTED_ORIGINS (.env), so
    // `pnpm dev` on any port works without editing this file.
    trustedOrigins: [
      env.BETTER_AUTH_URL,
      ...(env.BETTER_AUTH_TRUSTED_ORIGINS
        ? env.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : []),
    ],
  });
}

export interface AuthSession {
  session: {
    id: string;
    expiresAt: string;
    token: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Verifies the caller's Better Auth session (from the first-party cookie) and
 * returns the authenticated session. Throws when the session is missing or
 * invalid.
 *
 * In route handlers pass the incoming `Request` so the cookie headers are
 * read directly. In server actions (no Request in scope) it falls back to
 * `next/headers`.
 */
export async function requireAuth(request?: Request): Promise<AuthSession> {
  const instance = getInstance();
  const headersObj =
    request?.headers ??
    new Headers(Object.fromEntries((await headers()).entries()));
  const session = await instance.api.getSession({ headers: headersObj });

  if (!session) {
    throw new Error("Unauthorized: Invalid or expired session");
  }

  return session as unknown as AuthSession;
}
