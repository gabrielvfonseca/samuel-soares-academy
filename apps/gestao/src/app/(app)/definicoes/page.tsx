import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Automações e definições | Samuel Soares Academy",
  description:
    "Configurar a hora dos lembretes diários automáticos, canais de envio e ver o histórico de envios.",
};

export default function Page() {
  return <PageClient />;
}
