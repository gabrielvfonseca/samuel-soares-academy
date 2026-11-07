import "server-only";

import { envelopeEmail, estiloTabela, estiloTd, estiloTh } from "@repo/email/layout";

type Row = Record<string, unknown>;

const EMAIL_PRINCIPAL = "ruijmorgadomarques@gmail.com";
const EMAIL_ESCOLA = "geral@samuelsoares.academy";

export type ResultadoFaturas = {
  enviado: boolean;
  mes: string;
  total: number;
  linhas: number;
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

export async function executarResumoFaturas(): Promise<ResultadoFaturas> {
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
  const fimData = new Date(`${mes}-01T00:00:00.000Z`);
  fimData.setUTCMonth(fimData.getUTCMonth() + 1);

  const { data: treinos, error } = await supabaseAdmin
    .from("treinos")
    .select("id, nif, data_hora_inicio, alunos(nome)")
    .eq("tipo", "Individual")
    .eq("estado_pagamento", "Pago")
    .eq("fatura", "Com fatura")
    .gte("data_hora_inicio", inicio)
    .lt("data_hora_inicio", fimData.toISOString());
  if (error) throw new Error(error.message);

  const { data: mensalidades, error: mErr } = await supabaseAdmin
    .from("mensalidades")
    .select("id, nif, mes_referencia, alunos(nome)")
    .eq("estado_pagamento", "Pago")
    .eq("fatura", "Com fatura")
    .gte("mes_referencia", `${mes}-01`)
    .lt("mes_referencia", fimData.toISOString().slice(0, 10));
  if (mErr) throw new Error(mErr.message);

  type Agregado = { nome: string; nif: string; quantidade: number };
  const mapa = new Map<string, Agregado>();
  const juntar = (nome: string, nif: string | null) => {
    const chave = `${nome}|${nif ?? ""}`;
    const atual = mapa.get(chave);
    if (atual) atual.quantidade += 1;
    else mapa.set(chave, { nome, nif: nif ?? "NIF em falta", quantidade: 1 });
  };

  for (const t of (treinos ?? []) as Row[]) {
    juntar(
      ((t["alunos"] as Row | null)?.["nome"] as string) ?? "Aluno sem nome",
      t["nif"] as string | null,
    );
  }
  for (const m of (mensalidades ?? []) as Row[]) {
    juntar(
      ((m["alunos"] as Row | null)?.["nome"] as string) ?? "Aluno sem nome",
      m["nif"] as string | null,
    );
  }

  const linhas = [...mapa.values()].sort((a, b) => a.nome.localeCompare(b.nome));
  const total = linhas.reduce((acc, l) => acc + l.quantidade, 0);
  const mesLegivel = new Date(`${mes}-01T12:00:00`).toLocaleDateString("pt-PT", {
    month: "long",
    year: "numeric",
  });

  const corpo = linhas.length
    ? `<table role="presentation" style="${estiloTabela}">
        <thead><tr>
          <th style="${estiloTh}">Nome</th><th style="${estiloTh}">NIF</th><th style="${estiloTh}">Faturas</th>
        </tr></thead>
        <tbody>${linhas
          .map(
            (l) =>
              `<tr><td style="${estiloTd}">${l.nome}</td><td style="${estiloTd}">${l.nif}</td><td style="${estiloTd}">${l.quantidade}</td></tr>`,
          )
          .join("")}</tbody>
      </table>`
    : `<p style="margin:0">Não há faturas por emitir neste mês.</p>`;

  const html = envelopeEmail(
    `Faturas a emitir · ${mesLegivel}`,
    `<p style="margin:0 0 16px">Total de faturas a emitir: <strong>${total}</strong></p>${corpo}`,
  );

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: remetente,
      to: [EMAIL_PRINCIPAL],
      cc: [EMAIL_ESCOLA],
      subject: `Faturas a emitir · ${mesLegivel}`,
      html,
      headers: { "X-Entity-Ref-ID": crypto.randomUUID() },
    }),
  });
  if (!res.ok) throw new Error(`Resend [${res.status}]: ${await res.text()}`);

  return { enviado: true, mes, total, linhas: linhas.length };
}
