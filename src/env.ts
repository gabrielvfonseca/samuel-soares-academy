import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    WHATSAPP_BUSINESS_PHONE: z.string().min(1),
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    ARCJET_KEY: z.string().startsWith("ajkey_").optional(),
  },
  client: {
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().startsWith("G-").optional(),
  },
  shared: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV ?? "development",
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ??
      (process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000"),
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    WHATSAPP_BUSINESS_PHONE: process.env.WHATSAPP_BUSINESS_PHONE,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    ARCJET_KEY: process.env.ARCJET_KEY,
  },
  emptyStringAsUndefined: true,
});
