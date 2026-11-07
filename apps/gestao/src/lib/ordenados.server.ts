import "server-only";

import { envelopeEmail, estiloTabela, estiloTd, estiloTh } from "@repo/email/layout";

type Row = Record<string, unknown>;

const EMAIL_PRINCIPAL = "ruijmorgadomarques@gmail.com";
const EMAIL_ESCOLA = "geral@samuelsoares.academy";

export type ResultadoOrdenados = {
  enviado: boolean;
  mes: string;
  total: number;
  treinadores: number;
};

function mesNoFuso(tz: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .slice(0, 7);
}

function euros(v: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v);
}

export async function executarResumoOrdenados(): Promise<ResultadoOrdenados> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: cfg } = await supabaseAdmin
    .from("configuracoes_notificacoes")
    .select("*")
    .limit(1)
    .single();
  const config = (cfg ?? {}) as Row;
  const tz = (config["fuso_horario"] as string) || "Europe/Lisbon";
  const resendKey = config["chave_api_resend"] as string | null;
  const remetente = (config["email_remetente"] as string) || "onboarding@resend.dev";
  if (!resendKey) throw new Error("Chave API Resend não configurada");

  const mes = mesNoFuso(tz);
  const inicio = `${mes}-01T00:00:00.000Z`;
  const fimData = new Date(inicio);
  fimData.setUTCMonth(fimData.getUTCMonth() + 1);

  const { data: treinadores, error: tErr } = await supabaseAdmin
    .from("treinadores")
    .select("id, nome, valor_hora_individual, valor_hora_grupo")
    .order("nome");
  if (tErr) throw new Error(tErr.message);

  const { data: treinos, error } = await supabaseAdmin
    .from("treinos")
    .select("treinador_id, tipo, estado, data_hora_inicio, data_hora_fim")
    .neq("estado", "Cancelado")
    .gte("data_hora_inicio", inicio)
    .lt("data_hora_inicio", fimData.toISOString())
    .lte("data_hora_fim", new Date().toISOString());
  if (error) throw new Error(error.message);

  type Linha = {
    nome: string;
    horasInd: number;
    horasGrupo: number;
    valorInd: number;
    valorGrupo: number;
  };
  const linhas = new Map<string, Linha>();
  for (const t of (treinadores ?? []) as Row[]) {
    linhas.set(t["id"] as string, {
      nome: t["nome"] as string,
      horasInd: 0,
      horasGrupo: 0,
      valorInd: Number(t["valor_hora_individual"] ?? 0),
      valorGrupo: Number(t["valor_hora_grupo"] ?? 0),
    });
  }

  for (const t of (treinos ?? []) as Row[]) {
    const linha = linhas.get(t["treinador_id"] as string);
    if (!linha) continue;
    const horas =
      (new Date(t["data_hora_fim"] as string).getTime() -
        new Date(t["data_hora_inicio"] as string).getTime()) /
      3600000;
    if (horas <= 0) continue;
    if ((t["tipo"] as string) === "Grupo") linha.horasGrupo += horas;
    else linha.horasInd += horas;
  }

  const resultado = [...linhas.values()]
    .map((l) => ({
      ...l,
      total: l.horasInd * l.valorInd + l.horasGrupo * l.valorGrupo,
    }))
    .filter((l) => l.horasInd > 0 || l.horasGrupo > 0);

  const total = resultado.reduce((acc, l) => acc + l.total, 0);
  const mesLegivel = new Date(`${mes}-01T12:00:00`).toLocaleDateString("pt-PT", {
    month: "long",
    year: "numeric",
  });

  const corpo = resultado.length
    ? `<table role="presentation" style="${estiloTabela}">
        <thead><tr>
          <th style="${estiloTh}">Treinador</th><th style="${estiloTh}">H. individuais</th><th style="${estiloTh}">H. grupo</th><th style="${estiloTh}">Ordenado</th>
        </tr></thead>
        <tbody>${resultado
          .map(
            (l) =>
              `<tr><td style="${estiloTd}">${l.nome}</td><td style="${estiloTd}">${l.horasInd.toFixed(1)}h</td><td style="${estiloTd}">${l.horasGrupo.toFixed(1)}h</td><td style="${estiloTd}">${euros(l.total)}</td></tr>`,
          )
          .join("")}</tbody>
      </table>`
    : `<p style="margin:0">Não há horas de treino registadas neste mês.</p>`;

  const html = envelopeEmail(
    `Ordenados dos treinadores · ${mesLegivel}`,
    `<p style="margin:0 0 16px">Total a pagar: <strong>${euros(total)}</strong></p>${corpo}`,
  );

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: remetente,
      to: [EMAIL_PRINCIPAL],
      cc: [EMAIL_ESCOLA],
      subject: `Ordenados dos treinadores · ${mesLegivel}`,
      html,
      headers: { "X-Entity-Ref-ID": crypto.randomUUID() },
    }),
  });
  if (!res.ok) throw new Error(`Resend [${res.status}]: ${await res.text()}`);

  return { enviado: true, mes, total, treinadores: resultado.length };
}
