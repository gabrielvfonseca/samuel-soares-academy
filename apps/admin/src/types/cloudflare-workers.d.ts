/**
 * Type declarations for the Cloudflare Workers env bindings.
 *
 * Augments the `Cloudflare.Env` interface (generated in `.cloudflare/types`)
 * with the plain-string env vars that are set via the CF dashboard / `cf` CLI
 * rather than as typed bindings in `cloudflare.config.ts`.
 */
declare namespace Cloudflare {
  interface Env {
    /** Secret used by Better Auth to sign JWT session tokens. */
    BETTER_AUTH_SECRET: string;
    /** Public origin of this app, used by Better Auth for callbacks. */
    BETTER_AUTH_URL: string;
    /** R2 bucket for profile documents (PDFs / images). */
    BUCKET: import("@ssa/cloudflare/types").R2Bucket;
    /** Secret required by the cron trigger routes. */
    CRON_SECRET: string;
    /** D1 database binding (see `packages/database/wrangler.jsonc`). */
    DB: import("@ssa/cloudflare/types").D1Database;
    /** Shared secret required for the restricted internal login. */
    INTERNAL_ACCESS_CODE: string;
    /** Lovable AI gateway API key. */
    LOVABLE_API_KEY: string;
    /** Node environment. */
    NODE_ENV?: string;
    /** Resend API key. */
    RESEND_API_KEY: string;
  }
}
