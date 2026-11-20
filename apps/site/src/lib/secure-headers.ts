/**
 * Security headers for the site app.
 *
 * These headers were previously set by Nosecone (a Vercel-only library).
 * They are now applied by `src/proxy.ts` on every non-static response,
 * replacing Nosecone on Cloudflare Workers.
 */
export const secureHeaders: Record<string, string> = {
  "Referrer-Policy": "origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
};
