import { cronHandler } from "@/lib/cron-route";

export const dynamic = "force-dynamic";

export const POST = cronHandler("lembretes-pessoais", async () => {
  const { enviarLembretesPessoais } = await import("@/lib/assistente.server");
  return enviarLembretesPessoais();
});
