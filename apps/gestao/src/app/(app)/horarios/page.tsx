import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Horários Disponíveis | Samuel Soares Academy",
  description:
    "Disponibilidade semanal de cada treinador para marcação de treinos na Samuel Soares Academy.",
};

export default function Page() {
  return <PageClient />;
}
