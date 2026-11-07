import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  description:
    "Controlo de pagamentos e faturas dos treinos individuais e das mensalidades dos atletas de grupo.",
  title: "Painel de pagamentos | Samuel Soares Academy",
};

export default function Page() {
  return <PageClient />;
}
