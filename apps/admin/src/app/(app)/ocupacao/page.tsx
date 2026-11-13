import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  description:
    "Cruzamento entre a disponibilidade dos treinadores, a disponibilidade dos campos e os treinos já marcados, com sugestões automáticas de marcação.",
  title: "Vagas para marcação de treinos | Samuel Soares Academy",
};

export default function Page() {
  return <PageClient />;
}
