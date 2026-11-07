import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  description:
    "Criação e gestão das turmas de treino de grupo, com treinador, campo, horário semanal e atletas atribuídos.",
  title: "Turmas | Samuel Soares Academy",
};

export default function Page() {
  return <PageClient />;
}
