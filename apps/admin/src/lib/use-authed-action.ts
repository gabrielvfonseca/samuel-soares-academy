"use client";

import { useCallback } from "react";

/**
 * Wraps a server action that authenticates via the Better Auth session cookie.
 * The cookie is sent automatically with the request — no token needed.
 * This hook is kept for API compatibility; it simply forwards args.
 */
export function useAuthedAction<A extends unknown[], R>(
  action: (...args: A) => Promise<R>
) {
  return useCallback(
    async (...args: A): Promise<R> => action(...args),
    [action]
  );
}
