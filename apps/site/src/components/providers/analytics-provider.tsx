import type { JSX, ReactNode } from "react";
import { env } from "@/env";

interface AnalyticsProviderProps {
  readonly children: ReactNode;
}

const gtagSnippet = (gaId: string) => `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${gaId}');
`;

export function AnalyticsProvider({
  children,
}: AnalyticsProviderProps): JSX.Element {
  const gaId = env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <>
      {children}
      {gaId && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          />
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static Google gtag snippet */}
          <script dangerouslySetInnerHTML={{ __html: gtagSnippet(gaId) }} />
        </>
      )}
    </>
  );
}
