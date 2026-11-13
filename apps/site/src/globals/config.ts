import { env } from "@/env";
import { SITE_URL } from "./constants";

export const config = {
  googleAnalyticsId: env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  isProduction: env.NODE_ENV === "production",
  metadataBase: env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    ? new URL(SITE_URL)
    : undefined,
  siteUrl: SITE_URL,
} as const;
