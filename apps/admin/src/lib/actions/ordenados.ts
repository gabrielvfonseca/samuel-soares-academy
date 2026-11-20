"use server";

import { requireAuth } from "@/integrations/auth/server";

export async function enviarResumoOrdenadosAgora() {
  await requireAuth();
  const { executarResumoOrdenados } = await import("../ordenados.server");
  return executarResumoOrdenados();
}
