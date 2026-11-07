import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import type { JSX, ReactNode } from "react";
import { Provider } from "@/components/providers/provider";
import {
  BRAND_DESCRIPTION,
  BRAND_NAME,
  CONTACT_INFO,
  SITE_URL,
} from "@/globals/constants";
import { JsonLd } from "@/lib/json-ld";
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
    <>
      <JsonLd
        code={{
          "@context": "https://schema.org",
          "@type": "SportsActivityLocation",
          address: {
            "@type": "PostalAddress",
            addressCountry: "PT",
            addressLocality: "Porto",
            streetAddress: CONTACT_INFO.address,
          },
          description: BRAND_DESCRIPTION,
          email: CONTACT_INFO.email,
          logo: `${SITE_URL}/icon.svg`,
          name: BRAND_NAME,
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              closes: "20:00",
              dayOfWeek: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
              ],
              opens: "09:00",
            },
            {
              "@type": "OpeningHoursSpecification",
              closes: "13:00",
              dayOfWeek: ["Saturday"],
              opens: "09:00",
            },
          ],
          telephone: CONTACT_INFO.phone,
          url: SITE_URL,
        }}
      />
      <Provider>
        <a
          className="focus:bg-background focus:text-foreground focus:border-border sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:m-4 focus:rounded-md focus:border focus:px-4 focus:py-2"
          href="#main-content"
        >
          Saltar para o conteúdo
        </a>
        {children}
      </Provider>
    </>
  );
}
