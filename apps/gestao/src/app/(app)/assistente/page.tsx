import type { Metadata } from "next";

import PageClient from "./page-client";

export const metadata: Metadata = {
  title: "Assistente · Samuel Soares Academy",
  description:
    "Assistente interna da Samuel Soares Academy para criar lembretes enviados por email à hora combinada.",
};

export default function Page() {
  return <PageClient />;
}
