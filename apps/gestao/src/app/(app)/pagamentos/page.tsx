import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Painel de pagamentos | Samuel Soares Academy",
  description:
    "Controlo de pagamentos e faturas dos treinos individuais e das mensalidades dos atletas de grupo.",
};

export default function Page() {
  return <PageClient />;
}
