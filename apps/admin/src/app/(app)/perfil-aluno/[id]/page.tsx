import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  description:
    "Ficha completa do atleta de grupo com dados pessoais, inscrição e documentos.",
  title: "Perfil do atleta | Samuel Soares Academy",
};

export default function Page() {
  return <PageClient />;
}
