import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { fonts } from "@/lib/fonts";
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
      <body className={fonts}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
