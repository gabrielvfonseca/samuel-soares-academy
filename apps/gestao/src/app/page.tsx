import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Samuel Soares Academy | Entrar na plataforma de guarda-redes",
  description:
    "Entre na plataforma interna da Samuel Soares Academy com o código de acesso da academia para gerir treinos, atletas e finanças.",
};

export default function Page() {
  return <PageClient />;
}
