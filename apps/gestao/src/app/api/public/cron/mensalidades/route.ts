import { cronHandler } from "@/lib/cron-route";

export const dynamic = "force-dynamic";

export const POST = cronHandler("mensalidades", async () => {
  const { executarResumoMensalidades } = await import("@/lib/mensalidades.server");
  return executarResumoMensalidades();
});
