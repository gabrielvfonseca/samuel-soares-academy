import { cronHandler } from "@/lib/cron-route";

export const dynamic = "force-dynamic";

export const POST = cronHandler("lembretes", async (request) => {
  const { executarLembretes } = await import("@/lib/lembretes.server");
  const url = new URL(request.url);
  return executarLembretes(url.searchParams.get("forcar") === "1");
});
