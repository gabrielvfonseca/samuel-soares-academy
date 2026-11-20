import "server-only";

import { clubs, monthlyFees, students } from "@repo/database/schema";
import {
  envelopeEmail,
  estiloTabela,
  estiloTd,
  estiloTh,
} from "@repo/email/layout";
import { eq, lt } from "drizzle-orm";
import { getDb } from "@/integrations/db/client.server";
import { getConfig, mesNoFuso } from "./db-helpers.server";

const EMAIL_PRINCIPAL = "ruijmorgadomarques@gmail.com";
const EMAIL_ESCOLA = "geral@samuelsoares.academy";

export interface ResultadoMensalidades {
  emAtraso: number;
  enviado: boolean;
  mes: string;
  valorEmFalta: number;
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
  const db = getDb();

  const config = await getConfig();
  const tz = config?.timezone || "Europe/Lisbon";
  const resendKey = config?.resendApiKey ?? null;
  const remetente = config?.fromEmail || "onboarding@resend.dev";
  if (!resendKey) {
    throw new Error("Chave API Resend não configurada");
  }

  const mes = mesNoFuso(tz);
  const [ano, mesNum] = mes.split("-").map(Number) as [number, number];
  const proximoMes =
    mesNum === 12
      ? `${ano + 1}-01-01`
      : `${ano}-${String(mesNum + 1).padStart(2, "0")}-01`;

  const grupoAlunos = await db
    .select({ id: students.id, nome: students.name })
    .from(students)
    .where(eq(students.athleteType, "Group"));

  const clubesAtivos = await db
    .select({
      id: clubs.id,
      monthlyFee: clubs.monthlyFee,
      nome: clubs.name,
    })
    .from(clubs)
    .where(eq(clubs.active, true));

  const mensalidadesPendentes = await db
    .select({
      amount: monthlyFees.amount,
      clubId: monthlyFees.clubId,
      month: monthlyFees.month,
      paymentStatus: monthlyFees.paymentStatus,
      studentId: monthlyFees.studentId,
    })
    .from(monthlyFees)
    .where(lt(monthlyFees.month, proximoMes));

  const nomeAluno = new Map(
    grupoAlunos.map((a) => [a.id as string, a.nome as string])
  );
  const clubeInfo = new Map(
    clubesAtivos.map((c) => [
      c.id as string,
      { nome: c.nome as string, valor: (c.monthlyFee ?? 0) / 100 },
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

  for (const m of mensalidadesPendentes) {
    const mesRef = String(m.month).slice(0, 7);
    const alunoId = m.studentId as string | null;
    const clubeId = m.clubId as string | null;
    if (mesRef === mes) {
      registados.add(alunoId ?? clubeId ?? "");
    }
    if (m.paymentStatus === "Paid") {
      continue;
    }
    if (alunoId && nomeAluno.has(alunoId)) {
      linhas.push({
        mes: mesRef,
        nome: nomeAluno.get(alunoId)!,
        tipo: "Atleta de grupo",
        valor: (m.amount ?? 0) / 100,
      });
    } else if (clubeId && clubeInfo.has(clubeId)) {
      linhas.push({
        mes: mesRef,
        nome: clubeInfo.get(clubeId)!.nome,
        tipo: "Clube (B2B)",
        valor: (m.amount ?? clubeInfo.get(clubeId)!.valor * 100) / 100,
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
