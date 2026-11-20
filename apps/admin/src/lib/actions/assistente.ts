"use server";

import { requireAuth } from "@/integrations/auth/server";

export interface MensagemChat {
  content: string;
  role: "user" | "assistant";
}

export async function conversarAssistente(mensagens: MensagemChat[]) {
  await requireAuth();
  const { conversar } = await import("../assistente.server");
  return conversar(mensagens);
}

export async function testarLembretesPessoais() {
  await requireAuth();
  const { enviarLembretesPessoais } = await import("../assistente.server");
  return enviarLembretesPessoais();
}
