import { ThemeProvider } from "next-themes";
import type { JSX, ReactNode } from "react";
import { AnalyticsProvider } from "./analytics-provider";

interface ProviderProps {
  readonly children: ReactNode;
}

export function Provider({ children }: ProviderProps): JSX.Element {
  return (
    <AnalyticsProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </AnalyticsProvider>
  );
}
