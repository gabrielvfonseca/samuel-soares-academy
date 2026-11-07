import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Alunos | Samuel Soares Academy",
  description: "Gestão dos alunos guarda-redes: escalão, contacto do EE e notas técnicas.",
};

export default function Page() {
  return <PageClient />;
}
