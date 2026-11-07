import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Treinadores | Samuel Soares Academy",
  description: "Gestão dos treinadores da escola: contactos, WhatsApp e estado de atividade.",
};

export default function Page() {
  return <PageClient />;
}
