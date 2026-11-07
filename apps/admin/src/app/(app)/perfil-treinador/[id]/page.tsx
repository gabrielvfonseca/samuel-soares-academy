import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  description:
    "Ficha completa do treinador com dados pessoais, valores por hora e contratos.",
  title: "Perfil do treinador | Samuel Soares Academy",
};

export default function Page() {
  return <PageClient />;
}
