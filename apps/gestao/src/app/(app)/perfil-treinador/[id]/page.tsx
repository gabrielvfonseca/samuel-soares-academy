import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Perfil do treinador | Samuel Soares Academy",
  description: "Ficha completa do treinador com dados pessoais, valores por hora e contratos.",
};

export default function Page() {
  return <PageClient />;
}
