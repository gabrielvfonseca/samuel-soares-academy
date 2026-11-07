"use server";

import { requireSupabaseAuth } from "@/integrations/supabase/auth.server";

export async function enviarResumoFaturasAgora(token: string) {
  await requireSupabaseAuth(token);
  const { executarResumoFaturas } = await import("../faturas.server");
  return executarResumoFaturas();
}
