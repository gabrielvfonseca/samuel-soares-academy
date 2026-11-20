import { env } from "@/env";

/**
 * Cloudflare KV namespace for caching.
 *
 * Replaces the old Upstash Redis client. On Cloudflare Workers, the KV
 * namespace is accessed via the `KV` binding defined in cloudflare.config.ts.
 */
export const kv = env.KV;
