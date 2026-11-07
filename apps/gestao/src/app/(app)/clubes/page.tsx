import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Clubes B2B | Samuel Soares Academy",
  description:
    "Gestão dos clubes com prestação de serviços: valor mensal, treinador atribuído, campo e horário semanal.",
};

export default function Page() {
  return <PageClient />;
}
