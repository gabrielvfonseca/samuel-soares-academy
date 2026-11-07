import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Disponibilidade de treinadores | Samuel Soares Academy",
  description:
    "Treinadores da Samuel Soares Academy: indica os teus horários semanais disponíveis para dar treinos.",
};

export default function Page() {
  return <PageClient />;
}
