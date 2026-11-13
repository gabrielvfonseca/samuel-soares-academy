import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  description:
    "Configurar a hora dos lembretes diários automáticos, canais de envio e ver o histórico de envios.",
  title: "Automações e definições | Samuel Soares Academy",
};

export default function Page() {
  return <PageClient />;
}
