import "server-only";

import { personalReminders } from "@ssa/database/schema";
import { envelopeEmail } from "@ssa/email/layout";
import { and, asc, eq, lte } from "drizzle-orm";
import { getDb } from "@/integrations/db/client.server";
import { getConfig } from "./db-helpers.server";

const TZ = "Europe/Lisbon";
const EMAIL_DESTINO = "ruijmorgadomarques@gmail.com";
const EMAIL_ESCOLA = "geral@samuelsoares.academy";

type Row = Record<string, unknown>;

function agoraLisboa() {
  return new Date().toLocaleString("sv-SE", { timeZone: TZ }).replace(" ", "T");
}

function formatarQuando(iso: string) {
  return new Date(iso).toLocaleString("pt-PT", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "long",
    timeZone: TZ,
    weekday: "long",
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
  const db = getDb();
  const iso = deHoraLisboa(args.quando);
  await db.insert(personalReminders).values({
    email: EMAIL_DESTINO,
    id: crypto.randomUUID(),
    text: args.texto,
    when: iso,
  });
  return { ok: true, quando: formatarQuando(iso), texto: args.texto };
}

async function listarLembretes() {
  const db = getDb();
  const data = await db
    .select({
      id: personalReminders.id,
      sent: personalReminders.sent,
      text: personalReminders.text,
      when: personalReminders.when,
    })
    .from(personalReminders)
    .orderBy(asc(personalReminders.when));
  return {
    lembretes: data.map((l) => ({
      enviado: l.sent,
      id: l.id,
      quando: formatarQuando(l.when),
      texto: l.text,
    })),
    ok: true,
  };
}

async function apagarLembrete(args: { id: string }) {
  const db = getDb();
  await db.delete(personalReminders).where(eq(personalReminders.id, args.id));
  return { ok: true };
}

const TOOLS = [
  {
    function: {
      description:
        "Cria um lembrete que será enviado por email na data/hora indicada.",
      name: "criar_lembrete",
      parameters: {
        additionalProperties: false,
        properties: {
          quando: {
            description:
              "Data e hora local de Lisboa no formato YYYY-MM-DDTHH:MM (ex.: 2026-09-08T09:00).",
            type: "string",
          },
          texto: { description: "O que deve ser lembrado.", type: "string" },
        },
        required: ["texto", "quando"],
        type: "object",
      },
    },
    type: "function",
  },
  {
    function: {
      description: "Lista os lembretes existentes.",
      name: "listar_lembretes",
      parameters: {
        additionalProperties: false,
        properties: {},
        required: [],
        type: "object",
      },
    },
    type: "function",
  },
  {
    function: {
      description: "Apaga um lembrete pelo seu id.",
      name: "apagar_lembrete",
      parameters: {
        additionalProperties: false,
        properties: { id: { type: "string" } },
        required: ["id"],
        type: "object",
      },
    },
    type: "function",
  },
];

async function executarTool(nome: string, args: Record<string, unknown>) {
  if (nome === "criar_lembrete") {
    return criarLembrete(args as { texto: string; quando: string });
  }
  if (nome === "listar_lembretes") {
    return listarLembretes();
  }
  if (nome === "apagar_lembrete") {
    return apagarLembrete(args as { id: string });
  }
  return { erro: `Ferramenta desconhecida: ${nome}`, ok: false };
}

export interface MensagemChat {
  content: string;
  role: "user" | "assistant";
}

export async function conversar(historico: MensagemChat[]) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) {
    throw new Error("Assistente indisponível: falta a configuração de IA.");
  }

  const sistema = `És a assistente interna da Samuel Soares Academy. Falas português de Portugal, de forma breve e simpática.
A data e hora atuais em Lisboa são ${agoraLisboa()} (fuso ${TZ}).
Quando o utilizador pedir para ser lembrado de algo, usa a ferramenta criar_lembrete e converte expressões como "amanhã às 9" na data/hora exata.
Se faltar a hora, assume as 09:00 e diz que assumiste. Confirma sempre o que ficou agendado, com dia e hora.`;

  const messages: Row[] = [
    { content: sistema, role: "system" },
    ...historico.map((m) => ({ content: m.content, role: m.role })),
  ];

  for (let i = 0; i < 5; i++) {
    const res = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        body: JSON.stringify({
          messages,
          model: "google/gemini-3.7-flash",
          tools: TOOLS,
        }),
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      }
    );

    if (res.status === 429) {
      throw new Error("Demasiados pedidos à IA. Tenta daqui a pouco.");
    }
    if (res.status === 402) {
      throw new Error(
        "Os créditos de IA acabaram. É preciso adicionar créditos na Lovable."
      );
    }
    if (!res.ok) {
      throw new Error(`Erro da IA [${res.status}]: ${await res.text()}`);
    }

    const json = (await res.json()) as Row;
    const choice = ((json.choices as Row[]) ?? [])[0] as Row | undefined;
    const msg = (choice?.message ?? {}) as Row;
    const calls = (msg.tool_calls as Row[] | undefined) ?? [];

    if (calls.length === 0) {
      return {
        resposta: (msg.content as string) || "Não consegui responder.",
      };
    }

    messages.push(msg);
    for (const call of calls) {
      const fn = call.function as Row;
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse((fn.arguments as string) || "{}");
      } catch {
        args = {};
      }
      const resultado = await executarTool(fn.name as string, args);
      messages.push({
        content: JSON.stringify(resultado),
        role: "tool",
        tool_call_id: call.id,
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
  html: string
) {
  const res = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      cc: [EMAIL_ESCOLA],
      from,
      headers: { "X-Entity-Ref-ID": crypto.randomUUID() },
      html,
      subject,
      to: [to],
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(`Resend [${res.status}]: ${await res.text()}`);
  }
}

export async function enviarLembretesPessoais() {
  const db = getDb();

  const config = await getConfig();
  const resendKey = config?.resendApiKey ?? null;
  const remetente = config?.fromEmail || "onboarding@resend.dev";

  const agora = new Date().toISOString();
  const pendentes = await db
    .select()
    .from(personalReminders)
    .where(
      and(eq(personalReminders.sent, false), lte(personalReminders.when, agora))
    )
    .orderBy(asc(personalReminders.when));

  let enviados = 0;
  let erros = 0;

  for (const l of pendentes) {
    try {
      if (!resendKey) {
        throw new Error("Chave API Resend não configurada");
      }
      const quando = formatarQuando(l.when);
      await enviarEmail(
        resendKey,
        remetente,
        l.email,
        `Lembrete: ${String(l.text).slice(0, 60)}`,
        envelopeEmail(
          "Lembrete",
          `<p style="margin:0 0 12px"><strong>${l.text}</strong></p>
           <p style="margin:0;color:#6b7d75">Agendado para ${quando}.</p>`
        )
      );
      await db
        .update(personalReminders)
        .set({
          error: null,
          sent: true,
          sentAt: new Date().toISOString(),
        })
        .where(eq(personalReminders.id, l.id));
      enviados++;
    } catch (e) {
      erros++;
      await db
        .update(personalReminders)
        .set({ error: e instanceof Error ? e.message : String(e) })
        .where(eq(personalReminders.id, l.id));
    }
  }

  return { enviados, erros, pendentes: pendentes.length };
}
