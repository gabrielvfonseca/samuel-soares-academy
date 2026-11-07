import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  description:
    "Gestão dos alunos guarda-redes: escalão, contacto do EE e notas técnicas.",
  title: "Alunos | Samuel Soares Academy",
};

export default function Page() {
  return <PageClient />;
}
