"use client";

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps as NextThemesProviderProps,
} from "@repo/ui/lib/next-themes";
import type { JSX } from "react";

export function ThemeProvider({ children, ...props }: NextThemesProviderProps): JSX.Element {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
