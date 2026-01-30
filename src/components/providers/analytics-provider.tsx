import { GoogleAnalytics } from "@next/third-parties/google";
import type { JSX, ReactNode } from "react";
import { env } from "@/env";

interface AnalyticsProviderProps {
  readonly children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps): JSX.Element {
  return (
    <>
      {children}
      {env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics gaId={env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
    </>
  );
}
