import { getEnv } from "@ssa/cloudflare";

/**
 * Environment variables for the site app on Cloudflare Workers.
 *
 * All variables are declared as text bindings in cloudflare.config.ts and
 * typed via the generated `.cloudflare/types/index.d.ts`.
 */
const cfEnv = getEnv();

export const env = {
  CONTACT_EMAIL_FROM: cfEnv.CONTACT_EMAIL_FROM,
  CONTACT_EMAIL_TO: cfEnv.CONTACT_EMAIL_TO,
  KV: cfEnv.KV,
  NEXT_PUBLIC_APP_URL: cfEnv.NEXT_PUBLIC_APP_URL ?? "http://localhost:9000",
  NEXT_PUBLIC_GA_MEASUREMENT_ID: cfEnv.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  NODE_ENV: (process.env.NODE_ENV ?? "development") as
    | "development"
    | "production"
    | "test",
  RESEND_API_KEY: cfEnv.RESEND_API_KEY,
  WHATSAPP_PHONE: cfEnv.WHATSAPP_PHONE,
};
