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
    BUCKET: import("@cloudflare/workers-types").R2Bucket;
    /** Shared secret required for the restricted internal login. */
    CODIGO_ACESSO_INTERNO: string;
    /** D1 database binding (see `packages/database/wrangler.jsonc`). */
    DB: import("@cloudflare/workers-types").D1Database;
    /** Lovable AI gateway API key. */
    LOVABLE_API_KEY: string;
    /** Node environment. */
    NODE_ENV?: string;
    /** Resend API key. */
    RESEND_API_KEY: string;
    /** Secret required by the cron trigger routes. */
    TREINOS_CRON_SECRET: string;
  }
}
