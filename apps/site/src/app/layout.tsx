import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import type { JSX, ReactNode } from "react";
import { BRAND_DESCRIPTION, BRAND_NAME } from "@/globals/constants";
import { fonts } from "@/lib/fonts";
import { createMetadata } from "@/lib/metadata";
import { createViewport } from "@/lib/viewport";

export const metadata: Metadata = createMetadata({
  description: BRAND_DESCRIPTION,
  title: `${BRAND_NAME} - Defende o teu futuro!`,
});

export const viewport: Viewport = createViewport({
  themeColor: "#ffffff",
});

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className={fonts}>{children}</body>
    </html>
  );
}
