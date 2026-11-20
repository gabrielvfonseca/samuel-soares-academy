import { env } from "@/env";

/**
 * Cloudflare KV-based rate limiter.
 *
 * Replaces the old Upstash Ratelimit. Uses a simple sliding-window
 * implementation backed by the Cloudflare KV namespace.
 */

const kv = env.KV;

export interface RateLimiterOptions {
  limit: number;
  prefix?: string;
  windowSeconds: number;
}

export async function checkRateLimit(
  key: string,
  options: RateLimiterOptions
): Promise<{ success: boolean; remaining: number }> {
  const { limit, windowSeconds, prefix = "samuel-soares-academy" } = options;
  const fullKey = `${prefix}:${key}`;
  const now = Date.now();

  try {
    const raw = await kv.get(fullKey);
    const data = raw
      ? (JSON.parse(raw) as { count: number; resetAt: number })
      : { count: 0, resetAt: now + windowSeconds * 1000 };

    // Reset if window has expired
    if (now > data.resetAt) {
      data.count = 0;
      data.resetAt = now + windowSeconds * 1000;
    }

    if (data.count >= limit) {
      return { remaining: 0, success: false };
    }

    data.count += 1;
    await kv.put(fullKey, JSON.stringify(data), {
      expirationTtl: windowSeconds,
    });

    return { remaining: limit - data.count, success: true };
  } catch {
    // Fail open on KV errors
    return { remaining: limit, success: true };
  }
}

export const slidingWindow = (limit: number, window: string) => ({
  limit,
  window,
});
