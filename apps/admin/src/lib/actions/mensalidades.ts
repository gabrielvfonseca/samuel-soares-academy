"use server";

import { requireAuth } from "@/integrations/auth/server";

export async function enviarResumoMensalidadesAgora() {
  await requireAuth();
  const { executarResumoMensalidades } = await import("../mensalidades.server");
  return executarResumoMensalidades();
}
