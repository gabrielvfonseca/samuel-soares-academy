import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Samuel Soares Academy | Gestão da escola de guarda-redes",
  description:
    "Plataforma de gestão de treinos, treinadores e alunos da Samuel Soares Academy, com lembretes diários automáticos.",
  icons: { icon: "/favicon.png" },
  openGraph: {
    title: "Samuel Soares Academy | Gestão da escola de guarda-redes",
    description: "Agenda de treinos, gestão de treinadores e alunos e lembretes automáticos.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
