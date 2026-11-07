import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  description:
    "Disponibilidade semanal de cada treinador para marcação de treinos na Samuel Soares Academy.",
  title: "Horários Disponíveis | Samuel Soares Academy",
};

export default function Page() {
  return <PageClient />;
}
