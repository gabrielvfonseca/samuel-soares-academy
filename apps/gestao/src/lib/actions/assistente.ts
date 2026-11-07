"use server";

import { requireSupabaseAuth } from "@/integrations/supabase/auth.server";

export type MensagemChat = { role: "user" | "assistant"; content: string };

export async function conversarAssistente(token: string, mensagens: MensagemChat[]) {
  await requireSupabaseAuth(token);
  const { conversar } = await import("../assistente.server");
  return conversar(mensagens);
}

export async function testarLembretesPessoais(token: string) {
  await requireSupabaseAuth(token);
  const { enviarLembretesPessoais } = await import("../assistente.server");
  return enviarLembretesPessoais();
}
