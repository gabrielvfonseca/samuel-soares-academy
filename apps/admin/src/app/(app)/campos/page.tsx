import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  description:
    "Registo dos campos de treino da Samuel Soares Academy e das horas em que cada campo está livre.",
  title: "Campos e disponibilidade | Samuel Soares Academy",
};

export default function Page() {
  return <PageClient />;
}
