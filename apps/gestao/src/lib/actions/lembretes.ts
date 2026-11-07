"use server";

import { requireSupabaseAuth } from "@/integrations/supabase/auth.server";

export async function enviarLembretesAgora(token: string) {
  await requireSupabaseAuth(token);
  const { executarLembretes } = await import("../lembretes.server");
  return executarLembretes(true);
}
