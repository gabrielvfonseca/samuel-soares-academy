import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  description:
    "Plataforma de gestão de treinos, treinadores e alunos da Samuel Soares Academy, com lembretes diários automáticos.",
  icons: { icon: "/favicon.png" },
  openGraph: {
    description:
      "Agenda de treinos, gestão de treinadores e alunos e lembretes automáticos.",
    title: "Samuel Soares Academy | Gestão da escola de guarda-redes",
    type: "website",
  },
  title: "Samuel Soares Academy | Gestão da escola de guarda-redes",
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { initialScale: 1, width: "device-width" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt">
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link
          crossOrigin="anonymous"
          href="https://fonts.gstatic.com"
          rel="preconnect"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
