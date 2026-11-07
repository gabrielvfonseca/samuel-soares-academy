import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  description:
    "Entre na plataforma interna da Samuel Soares Academy com o código de acesso da academia para gerir treinos, atletas e finanças.",
  title: "Samuel Soares Academy | Entrar na plataforma de guarda-redes",
};

export default function Page() {
  return <PageClient />;
}
