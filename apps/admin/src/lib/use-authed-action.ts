"use client";

import { useCallback } from "react";

import { supabase } from "@/integrations/supabase/client";

/**
 * Binds the current Supabase access token as the first argument of a server action,
 * replacing the old TanStack `attachSupabaseAuth` function middleware.
 */
export function useAuthedAction<A extends unknown[], R>(
  action: (token: string, ...args: A) => Promise<R>
) {
  return useCallback(
    async (...args: A): Promise<R> => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        throw new Error("Unauthorized: sessão em falta");
      }
      return action(token, ...args);
    },
    [action]
  );
}
