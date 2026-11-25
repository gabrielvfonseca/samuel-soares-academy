import "server-only";

import { monthlyFees, students, trainings } from "@ssa/database/schema";
import {
  envelopeEmail,
  estiloTabela,
  estiloTd,
  estiloTh,
} from "@ssa/email/layout";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/integrations/db/client.server";
import { getConfig, mesNoFuso } from "./db-helpers.server";

const EMAIL_PRINCIPAL = "ruijmorgadomarques@gmail.com";
const EMAIL_ESCOLA = "geral@samuelsoares.academy";

export interface ResultadoFaturas {
  enviado: boolean;
  linhas: number;
  mes: string;
  total: number;
}

export async function executarResumoFaturas(): Promise<ResultadoFaturas> {
  const db = getDb();

  const config = await getConfig();
  const tz = config?.timezone || "Europe/Lisbon";
  const resendKey = config?.resendApiKey ?? null;
  const remetente = config?.fromEmail || "onboarding@resend.dev";
  if (!resendKey) {
    throw new Error("Chave API Resend não configurada");
  }

  const mes = mesNoFuso(tz);

  // `startDate` is an RFC3339 string in the user's local timezone;
  // the "in month" filter is done in JS (same pattern as `lembretes.server.ts`).
  const treinosFaturados = (
    await db
      .select({
        nif: trainings.taxId,
        startDate: trainings.startDate,
        studentId: trainings.studentId,
      })
      .from(trainings)
      .where(
        and(
          eq(trainings.type, "Individual"),
          eq(trainings.paymentStatus, "Paid"),
          eq(trainings.invoice, "Invoiced")
        )
      )
  ).filter((t) => {
    const d = new Date(t.startDate);
    const ymd = new Intl.DateTimeFormat("en-CA", {
      day: "2-digit",
      month: "2-digit",
      timeZone: tz,
      year: "numeric",
    }).format(d);
    return ymd.slice(0, 7) === mes;
  });

  const mensalidadesFaturadas = await db
    .select({ nif: monthlyFees.taxId, studentId: monthlyFees.studentId })
    .from(monthlyFees)
    .where(
      and(
        eq(monthlyFees.paymentStatus, "Paid"),
        eq(monthlyFees.invoice, "Invoiced"),
        eq(monthlyFees.month, mes)
      )
    );

  // Student names for the aggregated rows.
  const todosAlunos = await db
    .select({ id: students.id, nome: students.name })
    .from(students);
  const alunoNome = new Map(todosAlunos.map((a) => [a.id, a.nome]));

  interface Agregado {
    nif: string;
    nome: string;
    quantidade: number;
  }
  const mapa = new Map<string, Agregado>();
  const juntar = (nome: string, nif: string | null) => {
    const chave = `${nome}|${nif ?? ""}`;
    const atual = mapa.get(chave);
    if (atual) {
      atual.quantidade += 1;
    } else {
      mapa.set(chave, { nif: nif ?? "NIF em falta", nome, quantidade: 1 });
    }
  };

  for (const t of treinosFaturados) {
    juntar(
      (t.studentId && alunoNome.get(t.studentId)) || "Aluno sem nome",
      t.nif ?? null
    );
  }
  for (const m of mensalidadesFaturadas) {
    juntar(
      (m.studentId && alunoNome.get(m.studentId)) || "Aluno sem nome",
      m.nif ?? null
    );
  }

  const linhas = [...mapa.values()].sort((a, b) =>
    a.nome.localeCompare(b.nome)
  );
  const total = linhas.reduce((acc, l) => acc + l.quantidade, 0);
  const mesLegivel = new Date(`${mes}-01T12:00:00`).toLocaleDateString(
    "pt-PT",
    {
      month: "long",
      year: "numeric",
    }
  );

  const corpo = linhas.length
    ? `<table role="presentation" style="${estiloTabela}">
        <thead><tr>
          <th style="${estiloTh}">Nome</th><th style="${estiloTh}">NIF</th><th style="${estiloTh}">Faturas</th>
        </tr></thead>
        <tbody>${linhas
          .map(
            (l) =>
              `<tr><td style="${estiloTd}">${l.nome}</td><td style="${estiloTd}">${l.nif}</td><td style="${estiloTd}">${l.quantidade}</td></tr>`
          )
          .join("")}</tbody>
    </table>`
    : `<p style="margin:0">Não há faturas por emitir neste mês.</p>`;

  const html = envelopeEmail(
    `Faturas a emitir · ${mesLegivel}`,
    `<p style="margin:0 0 16px">Total de faturas a emitir: <strong>${total}</strong></p>${corpo}`
  );

  const res = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      cc: [EMAIL_ESCOLA],
      from: remetente,
      headers: { "X-Entity-Ref-ID": crypto.randomUUID() },
      html,
      subject: `Faturas a emitir · ${mesLegivel}`,
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

  return { enviado: true, linhas: linhas.length, mes, total };
}
