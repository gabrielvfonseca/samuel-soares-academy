import { createAuthClient } from "better-auth/react";

/**
 * Browser-side Better Auth client. Reads the first-party session cookie.
 * Replaces the old Supabase browser client.
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
});

export const { signIn, signOut, useSession } = authClient;
