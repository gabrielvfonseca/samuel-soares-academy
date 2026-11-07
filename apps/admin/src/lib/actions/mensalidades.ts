"use server";

import { requireSupabaseAuth } from "@/integrations/supabase/auth.server";

export async function enviarResumoMensalidadesAgora(token: string) {
  await requireSupabaseAuth(token);
  const { executarResumoMensalidades } = await import("../mensalidades.server");
  return executarResumoMensalidades();
}
