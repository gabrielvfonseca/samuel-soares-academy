import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import type { JSX, ReactNode } from "react";
import { Provider } from "@/components/providers/provider";
import { BRAND_DESCRIPTION, BRAND_NAME, CONTACT_INFO, SITE_URL } from "@/globals/constants";
import { fonts } from "@/lib/fonts";
import { JsonLd } from "@/lib/json-ld";
import { createMetadata } from "@/lib/metadata";
import { createViewport } from "@/lib/viewport";

export const metadata: Metadata = createMetadata({
  title: `${BRAND_NAME} - Defende o teu futuro!`,
  description: BRAND_DESCRIPTION,
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
          name: BRAND_NAME,
          description: BRAND_DESCRIPTION,
          url: SITE_URL,
          logo: `${SITE_URL}/icon.svg`,
          address: {
            "@type": "PostalAddress",
            streetAddress: CONTACT_INFO.address,
            addressLocality: "Porto",
            addressCountry: "PT",
          },
          telephone: CONTACT_INFO.phone,
          email: CONTACT_INFO.email,
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              opens: "09:00",
              closes: "20:00",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Saturday"],
              opens: "09:00",
              closes: "13:00",
            },
          ],
        }}
      />
      <Provider>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:border-border focus:rounded-md focus:m-4"
        >
          Saltar para o conteúdo
        </a>
        {children}
      </Provider>
    </>
  );
}
