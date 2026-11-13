import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  description:
    "Gestão dos treinadores da escola: contactos, WhatsApp e estado de atividade.",
  title: "Treinadores | Samuel Soares Academy",
};

export default function Page() {
  return <PageClient />;
}
