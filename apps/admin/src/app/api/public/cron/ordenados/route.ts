import { cronHandler } from "@/lib/cron-route";

export const dynamic = "force-dynamic";

export const POST = cronHandler("ordenados", async () => {
  const { executarResumoOrdenados } = await import("@/lib/ordenados.server");
  return executarResumoOrdenados();
});
