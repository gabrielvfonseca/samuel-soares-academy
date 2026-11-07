import { env } from "@/env";
import { SITE_URL } from "./constants";

export const config = {
  isProduction: env.NODE_ENV === "production",
  siteUrl: SITE_URL,
  googleAnalyticsId: env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  metadataBase: env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? new URL(SITE_URL) : undefined,
} as const;
