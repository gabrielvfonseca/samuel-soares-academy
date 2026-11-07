import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  description:
    "Treinadores da Samuel Soares Academy: indica os teus horários semanais disponíveis para dar treinos.",
  title: "Disponibilidade de treinadores | Samuel Soares Academy",
};

export default function Page() {
  return <PageClient />;
}
