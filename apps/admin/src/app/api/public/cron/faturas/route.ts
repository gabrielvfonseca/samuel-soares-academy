import { cronHandler } from "@/lib/cron-route";

export const dynamic = "force-dynamic";

export const POST = cronHandler("faturas", async () => {
  const { executarResumoFaturas } = await import("@/lib/faturas.server");
  return executarResumoFaturas();
});
