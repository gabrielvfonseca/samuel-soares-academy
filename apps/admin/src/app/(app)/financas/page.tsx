import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  description:
    "Controlo mensal das entradas e saídas de dinheiro da escola: receitas dos treinos e pagamentos aos treinadores.",
  title: "Contas da escola | Samuel Soares Academy",
};

export default function Page() {
  return <PageClient />;
}
