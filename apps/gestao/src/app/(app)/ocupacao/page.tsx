import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Vagas para marcação de treinos | Samuel Soares Academy",
  description:
    "Cruzamento entre a disponibilidade dos treinadores, a disponibilidade dos campos e os treinos já marcados, com sugestões automáticas de marcação.",
};

export default function Page() {
  return <PageClient />;
}
