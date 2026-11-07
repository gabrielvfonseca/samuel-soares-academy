import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Dashboard | Samuel Soares Academy",
  description: "Resumo dos treinos de hoje e das próximas sessões da escola de guarda-redes.",
};

export default function Page() {
  return <PageClient />;
}
