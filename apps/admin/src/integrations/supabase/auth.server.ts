import "server-only";

import { createClient } from "@supabase/supabase-js";

import { createSupabaseFetch } from "./fetch";
import type { Database } from "./types";

/**
 * Verifies the caller's Supabase access token (sent explicitly by the browser) and returns a
 * user-scoped client. Throws when the token is missing or invalid.
 */
export async function requireSupabaseAuth(token: string | undefined | null) {
  const SUPABASE_URL =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY)) {
    const message =
      "Missing Supabase environment variable(s): SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY.";
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }

  if (!token) {
    throw new Error("Unauthorized: No token provided");
  }
  if (token.split(".").length !== 3) {
    throw new Error("Unauthorized: Invalid token");
  }

  const supabase = createClient<Database>(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY),
        headers: { Authorization: `Bearer ${token}` },
      },
    }
  );

  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims) {
    throw new Error("Unauthorized: Invalid token");
  }
  if (!data.claims.sub) {
    throw new Error("Unauthorized: No user ID found in token");
  }

  return { claims: data.claims, supabase, userId: data.claims.sub };
}
