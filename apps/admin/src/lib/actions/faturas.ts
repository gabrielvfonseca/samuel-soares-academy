"use server";

import { requireAuth } from "@/integrations/auth/server";

export async function enviarResumoFaturasAgora() {
  await requireAuth();
  const { executarResumoFaturas } = await import("../faturas.server");
  return executarResumoFaturas();
}
