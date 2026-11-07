import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  description:
    "Calendário interativo de treinos por mês, semana e dia, com filtro por treinador.",
  title: "Calendário de treinos | Samuel Soares Academy",
};

export default function Page() {
  return <PageClient />;
}
