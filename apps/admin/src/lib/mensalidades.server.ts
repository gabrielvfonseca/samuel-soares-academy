import "server-only";

import {
  envelopeEmail,
  estiloTabela,
  estiloTd,
  estiloTh,
} from "@repo/email/layout";

type Row = Record<string, unknown>;

const EMAIL_PRINCIPAL = "ruijmorgadomarques@gmail.com";
const EMAIL_ESCOLA = "geral@samuelsoares.academy";

export interface ResultadoMensalidades {
  emAtraso: number;
  enviado: boolean;
  mes: string;
  valorEmFalta: number;
}

function mesNoFuso(tz: string) {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: tz,
    year: "numeric",
  })
    .format(new Date())
    .slice(0, 7);
}

function euros(v: number) {
  return new Intl.NumberFormat("pt-PT", {
    currency: "EUR",
    style: "currency",
  }).format(v);
}

function mesLegivel(mes: string) {
  return new Date(`${mes}-01T12:00:00`).toLocaleDateString("pt-PT", {
    month: "long",
    year: "numeric",
  });
}

export async function executarResumoMensalidades(): Promise<ResultadoMensalidades> {
  const { supabaseAdmin } = await import(
    "@/integrations/supabase/client.server"
  );

  const { data: cfg } = await supabaseAdmin
    .from("configuracoes_notificacoes")
    .select("*")
    .limit(1)
    .single();
  const config = (cfg ?? {}) as Row;
  const tz = (config.fuso_horario as string) || "Europe/Lisbon";
  const resendKey = config.chave_api_resend as string | null;
  const remetente =
    (config.email_remetente as string) || "onboarding@resend.dev";
  if (!resendKey) {
    throw new Error("Chave API Resend não configurada");
  }

  const mes = mesNoFuso(tz);
  const [ano, mesNum] = mes.split("-").map(Number) as [number, number];
  const proximoMes =
    mesNum === 12
      ? `${ano + 1}-01-01`
      : `${ano}-${String(mesNum + 1).padStart(2, "0")}-01`;

  const { data: alunos, error: aErr } = await supabaseAdmin
    .from("alunos")
    .select("id, nome")
    .eq("tipo_atleta", "Grupo");
  if (aErr) {
    throw new Error(aErr.message);
  }

  const { data: clubes, error: cErr } = await supabaseAdmin
    .from("clubes")
    .select("id, nome, valor_mensal")
    .eq("ativo", true);
  if (cErr) {
    throw new Error(cErr.message);
  }

  const { data: mensalidades, error: mErr } = await supabaseAdmin
    .from("mensalidades")
    .select("aluno_id, clube_id, mes_referencia, valor, estado_pagamento")
    .lt("mes_referencia", proximoMes);
  if (mErr) {
    throw new Error(mErr.message);
  }

  const nomeAluno = new Map(
    ((alunos ?? []) as Row[]).map((a) => [a.id as string, a.nome as string])
  );
  const clubeInfo = new Map(
    ((clubes ?? []) as Row[]).map((c) => [
      c.id as string,
      { nome: c.nome as string, valor: Number(c.valor_mensal ?? 0) },
    ])
  );

  interface Linha {
    mes: string;
    nome: string;
    tipo: string;
    valor: number;
  }
  const linhas: Linha[] = [];
  const registados = new Set<string>();

  for (const m of (mensalidades ?? []) as Row[]) {
    const mesRef = String(m.mes_referencia).slice(0, 7);
    const alunoId = m.aluno_id as string | null;
    const clubeId = m.clube_id as string | null;
    if (mesRef === mes) {
      registados.add(alunoId ?? clubeId ?? "");
    }
    if ((m.estado_pagamento as string) === "Pago") {
      continue;
    }
    if (alunoId && nomeAluno.has(alunoId)) {
      linhas.push({
        mes: mesRef,
        nome: nomeAluno.get(alunoId)!,
        tipo: "Atleta de grupo",
        valor: Number(m.valor ?? 0),
      });
    } else if (clubeId && clubeInfo.has(clubeId)) {
      linhas.push({
        mes: mesRef,
        nome: clubeInfo.get(clubeId)!.nome,
        tipo: "Clube (B2B)",
        valor: Number(m.valor ?? clubeInfo.get(clubeId)!.valor),
      });
    }
  }

  for (const [id, nome] of nomeAluno) {
    if (!registados.has(id)) {
      linhas.push({ mes, nome, tipo: "Atleta de grupo", valor: 0 });
    }
  }
  for (const [id, info] of clubeInfo) {
    if (!registados.has(id)) {
      linhas.push({
        mes,
        nome: info.nome,
        tipo: "Clube (B2B)",
        valor: info.valor,
      });
    }
  }

  linhas.sort(
    (a, b) => a.mes.localeCompare(b.mes) || a.nome.localeCompare(b.nome)
  );
  const valorEmFalta = linhas.reduce((acc, l) => acc + l.valor, 0);

  const corpo = linhas.length
    ? `<table role="presentation" style="${estiloTabela}">
        <thead><tr>
          <th style="${estiloTh}">Nome</th><th style="${estiloTh}">Tipo</th><th style="${estiloTh}">Mês</th><th style="${estiloTh}">Valor</th>
        </tr></thead>
        <tbody>${linhas
          .map(
            (l) =>
              `<tr><td style="${estiloTd}">${l.nome}</td><td style="${estiloTd}">${l.tipo}</td><td style="${estiloTd}">${mesLegivel(l.mes)}</td><td style="${estiloTd}">${l.valor > 0 ? euros(l.valor) : "—"}</td></tr>`
          )
          .join("")}</tbody>
      </table>`
    : `<p style="margin:0">Não há mensalidades em atraso. Está tudo em dia.</p>`;

  const html = envelopeEmail(
    `Mensalidades em atraso · ${mesLegivel(mes)}`,
    `<p style="margin:0 0 16px">Total em falta: <strong>${euros(valorEmFalta)}</strong> · ${linhas.length} registo(s)</p>${corpo}`
  );

  const res = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      cc: [EMAIL_ESCOLA],
      from: remetente,
      headers: { "X-Entity-Ref-ID": crypto.randomUUID() },
      html,
      subject: `Mensalidades em atraso · ${mesLegivel(mes)}`,
      to: [EMAIL_PRINCIPAL],
    }),
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(`Resend [${res.status}]: ${await res.text()}`);
  }

  return { emAtraso: linhas.length, enviado: true, mes, valorEmFalta };
}
