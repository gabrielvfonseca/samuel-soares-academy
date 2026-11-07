import "server-only";

import { envelopeEmail } from "@repo/email/layout";

const TZ = "Europe/Lisbon";
const EMAIL_DESTINO = "ruijmorgadomarques@gmail.com";
const EMAIL_ESCOLA = "geral@samuelsoares.academy";

type Row = Record<string, unknown>;

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function agoraLisboa() {
  return new Date().toLocaleString("sv-SE", { timeZone: TZ }).replace(" ", "T");
}

function formatarQuando(iso: string) {
  return new Date(iso).toLocaleString("pt-PT", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  });
}

/** Converte "2026-09-08T09:00" (hora de Lisboa) para um instante absoluto. */
function deHoraLisboa(local: string): string {
  const limpo = local.trim().replace(" ", "T").slice(0, 16);
  const base = new Date(`${limpo}:00Z`);
  const tzOffset =
    new Date(base.toLocaleString("en-US", { timeZone: "UTC" })).getTime() -
    new Date(base.toLocaleString("en-US", { timeZone: TZ })).getTime();
  return new Date(base.getTime() + tzOffset).toISOString();
}

async function criarLembrete(args: { texto: string; quando: string }) {
  const db = await admin();
  const iso = deHoraLisboa(args.quando);
  const { error } = await db
    .from("lembretes_pessoais")
    .insert({ texto: args.texto, quando: iso, email: EMAIL_DESTINO } as never);
  if (error) return { ok: false, erro: error.message };
  return { ok: true, texto: args.texto, quando: formatarQuando(iso) };
}

async function listarLembretes() {
  const db = await admin();
  const { data, error } = await db
    .from("lembretes_pessoais")
    .select("id, texto, quando, enviado")
    .order("quando");
  if (error) return { ok: false, erro: error.message };
  return {
    ok: true,
    lembretes: (data ?? []).map((l) => {
      const r = l as Row;
      return {
        id: r["id"],
        texto: r["texto"],
        quando: formatarQuando(r["quando"] as string),
        enviado: r["enviado"],
      };
    }),
  };
}

async function apagarLembrete(args: { id: string }) {
  const db = await admin();
  const { error } = await db.from("lembretes_pessoais").delete().eq("id", args.id);
  return error ? { ok: false, erro: error.message } : { ok: true };
}

const TOOLS = [
  {
    type: "function",
    function: {
      name: "criar_lembrete",
      description: "Cria um lembrete que será enviado por email na data/hora indicada.",
      parameters: {
        type: "object",
        properties: {
          texto: { type: "string", description: "O que deve ser lembrado." },
          quando: {
            type: "string",
            description:
              "Data e hora local de Lisboa no formato YYYY-MM-DDTHH:MM (ex.: 2026-09-08T09:00).",
          },
        },
        required: ["texto", "quando"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "listar_lembretes",
      description: "Lista os lembretes existentes.",
      parameters: { type: "object", properties: {}, required: [], additionalProperties: false },
    },
  },
  {
    type: "function",
    function: {
      name: "apagar_lembrete",
      description: "Apaga um lembrete pelo seu id.",
      parameters: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
];

async function executarTool(nome: string, args: Record<string, unknown>) {
  if (nome === "criar_lembrete") return criarLembrete(args as { texto: string; quando: string });
  if (nome === "listar_lembretes") return listarLembretes();
  if (nome === "apagar_lembrete") return apagarLembrete(args as { id: string });
  return { ok: false, erro: `Ferramenta desconhecida: ${nome}` };
}

export type MensagemChat = { role: "user" | "assistant"; content: string };

export async function conversar(historico: MensagemChat[]) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Assistente indisponível: falta a configuração de IA.");

  const sistema = `És a assistente interna da Samuel Soares Academy. Falas português de Portugal, de forma breve e simpática.
A data e hora atuais em Lisboa são ${agoraLisboa()} (fuso ${TZ}).
Quando o utilizador pedir para ser lembrado de algo, usa a ferramenta criar_lembrete e converte expressões como "amanhã às 9" na data/hora exata.
Se faltar a hora, assume as 09:00 e diz que assumiste. Confirma sempre o que ficou agendado, com dia e hora.`;

  const messages: Row[] = [
    { role: "system", content: sistema },
    ...historico.map((m) => ({ role: m.role, content: m.content })),
  ];

  for (let i = 0; i < 5; i++) {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ model: "google/gemini-3.7-flash", messages, tools: TOOLS }),
    });

    if (res.status === 429) throw new Error("Demasiados pedidos à IA. Tenta daqui a pouco.");
    if (res.status === 402)
      throw new Error("Os créditos de IA acabaram. É preciso adicionar créditos na Lovable.");
    if (!res.ok) throw new Error(`Erro da IA [${res.status}]: ${await res.text()}`);

    const json = (await res.json()) as Row;
    const choice = ((json["choices"] as Row[]) ?? [])[0] as Row | undefined;
    const msg = (choice?.["message"] ?? {}) as Row;
    const calls = (msg["tool_calls"] as Row[] | undefined) ?? [];

    if (calls.length === 0) {
      return { resposta: (msg["content"] as string) || "Não consegui responder." };
    }

    messages.push(msg);
    for (const call of calls) {
      const fn = call["function"] as Row;
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse((fn["arguments"] as string) || "{}");
      } catch {
        args = {};
      }
      const resultado = await executarTool(fn["name"] as string, args);
      messages.push({
        role: "tool",
        tool_call_id: call["id"],
        content: JSON.stringify(resultado),
      });
    }
  }

  return { resposta: "Não consegui concluir o pedido. Tenta reformular." };
}

async function enviarEmail(
  apiKey: string,
  from: string,
  to: string,
  subject: string,
  html: string,
) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      cc: [EMAIL_ESCOLA],
      subject,
      html,
      headers: { "X-Entity-Ref-ID": crypto.randomUUID() },
    }),
  });
  if (!res.ok) throw new Error(`Resend [${res.status}]: ${await res.text()}`);
}

export async function enviarLembretesPessoais() {
  const db = await admin();

  const { data: cfg } = await db.from("configuracoes_notificacoes").select("*").limit(1).single();
  const config = (cfg ?? {}) as Row;
  const resendKey = config["chave_api_resend"] as string | null;
  const remetente = (config["email_remetente"] as string) || "onboarding@resend.dev";

  const { data, error } = await db
    .from("lembretes_pessoais")
    .select("*")
    .eq("enviado", false)
    .lte("quando", new Date().toISOString())
    .order("quando");
  if (error) throw new Error(error.message);

  const pendentes = (data ?? []) as Row[];
  let enviados = 0;
  let erros = 0;

  for (const l of pendentes) {
    try {
      if (!resendKey) throw new Error("Chave API Resend não configurada");
      const quando = formatarQuando(l["quando"] as string);
      await enviarEmail(
        resendKey,
        remetente,
        l["email"] as string,
        `Lembrete: ${String(l["texto"]).slice(0, 60)}`,
        envelopeEmail(
          "Lembrete",
          `<p style="margin:0 0 12px"><strong>${l["texto"]}</strong></p>
           <p style="margin:0;color:#6b7d75">Agendado para ${quando}.</p>`,
        ),
      );
      await db
        .from("lembretes_pessoais")
        .update({ enviado: true, enviado_em: new Date().toISOString(), erro: null } as never)
        .eq("id", l["id"] as string);
      enviados++;
    } catch (e) {
      erros++;
      await db
        .from("lembretes_pessoais")
        .update({ erro: e instanceof Error ? e.message : String(e) } as never)
        .eq("id", l["id"] as string);
    }
  }

  return { pendentes: pendentes.length, enviados, erros };
}
