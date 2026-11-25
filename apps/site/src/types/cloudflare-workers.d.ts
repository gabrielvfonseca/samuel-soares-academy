/**
 * Type declarations for the Cloudflare Workers env bindings.
 *
 * Augments the `Cloudflare.Env` interface (generated in `.cloudflare/types`)
 * with the plain-string env vars that are set via the CF dashboard / `cf` CLI
 * rather than as typed bindings in `cloudflare.config.ts`.
 */
import type { ImagesBinding, KVNamespace } from "@ssa/cloudflare/types";

declare namespace Cloudflare {
  interface Env {
    /** Static assets binding. */
    ASSETS: unknown;
    /** Sender address for outgoing contact emails. */
    CONTACT_EMAIL_FROM: string;
    /** Recipient address for contact form notifications. */
    CONTACT_EMAIL_TO: string;
    /** Cloudflare Images binding. */
    IMAGES: ImagesBinding;
    /** KV namespace for caching and rate limiting. */
    KV: KVNamespace;
    /** Public origin of this app. */
    NEXT_PUBLIC_APP_URL: string;
    /** Google Analytics measurement ID. */
    NEXT_PUBLIC_GA_MEASUREMENT_ID: string;
    /** Node environment. */
    NODE_ENV?: string;
    /** Resend API key for sending emails. */
    RESEND_API_KEY: string;
    /** KV namespace used by vinext for its internal cache. */
    VINEXT_KV_CACHE: KVNamespace;
    /** WhatsApp Business phone number. */
    WHATSAPP_PHONE: string;
  }
}
