import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Contas da escola | Samuel Soares Academy",
  description:
    "Controlo mensal das entradas e saídas de dinheiro da escola: receitas dos treinos e pagamentos aos treinadores.",
};

export default function Page() {
  return <PageClient />;
}
