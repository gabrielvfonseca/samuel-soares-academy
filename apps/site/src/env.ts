import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().startsWith("G-").optional(),
  },
  emptyStringAsUndefined: true,
  runtimeEnv: {
    ARCJET_KEY: process.env.ARCJET_KEY,
    CONTACT_EMAIL_FROM: process.env.CONTACT_EMAIL_FROM,
    CONTACT_EMAIL_TO: process.env.CONTACT_EMAIL_TO,
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ??
      (process.env.NODE_ENV === "production"
        ? undefined
        : "http://localhost:3000"),
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NODE_ENV: process.env.NODE_ENV ?? "development",
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    WHATSAPP_BUSINESS_PHONE: process.env.WHATSAPP_BUSINESS_PHONE,
  },
  server: {
    ARCJET_KEY: z.string().startsWith("ajkey_").optional(),
    CONTACT_EMAIL_FROM: z.string().email(),
    CONTACT_EMAIL_TO: z.string().email(),
    RESEND_API_KEY: z.string().min(1),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    WHATSAPP_BUSINESS_PHONE: z.string().min(1),
  },
  shared: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
});
