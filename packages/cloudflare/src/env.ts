import { env as cfEnv } from "cloudflare:workers";

/**
 * Typed access to the Cloudflare Workers env bindings.
 *
 * The `Cloudflare.Env` interface is augmented per-app via each app's
 * `src/types/cloudflare-workers.d.ts` (included through `.cloudflare/types`
 * in the app's tsconfig). At runtime this returns the same module-level
 * `env` object the Workers runtime injects — calling `getEnv()` multiple
 * times is zero-cost.
 */
export function getEnv() {
  return cfEnv;
}
