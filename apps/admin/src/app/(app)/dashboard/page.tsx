import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  description:
    "Resumo dos treinos de hoje e das próximas sessões da escola de guarda-redes.",
  title: "Dashboard | Samuel Soares Academy",
};

export default function Page() {
  return <PageClient />;
}
