"use server";

import { requireSupabaseAuth } from "@/integrations/supabase/auth.server";

export async function enviarResumoOrdenadosAgora(token: string) {
  await requireSupabaseAuth(token);
  const { executarResumoOrdenados } = await import("../ordenados.server");
  return executarResumoOrdenados();
}
