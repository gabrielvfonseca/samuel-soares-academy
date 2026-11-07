import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Perfil do atleta | Samuel Soares Academy",
  description: "Ficha completa do atleta de grupo com dados pessoais, inscrição e documentos.",
};

export default function Page() {
  return <PageClient />;
}
