"use server";

import { requireAuth } from "@/integrations/auth/server";

export async function enviarLembretesAgora() {
  await requireAuth();
  const { executarLembretes } = await import("../lembretes.server");
  return executarLembretes(true);
}
