import "server-only";

import { coaches, trainings } from "@repo/database/schema";
import {
  envelopeEmail,
  estiloTabela,
  estiloTd,
  estiloTh,
} from "@repo/email/layout";
import { ne } from "drizzle-orm";
import { getDb } from "@/integrations/db/client.server";
import { eurosDeCents, getConfig, mesNoFuso } from "./db-helpers.server";

const EMAIL_PRINCIPAL = "ruijmorgadomarques@gmail.com";
const EMAIL_ESCOLA = "geral@samuelsoares.academy";

export interface ResultadoOrdenados {
  enviado: boolean;
  mes: string;
  total: number;
  treinadores: number;
}

function euros(v: number) {
  return new Intl.NumberFormat("pt-PT", {
    currency: "EUR",
    style: "currency",
  }).format(v);
}

export async function executarResumoOrdenados(): Promise<ResultadoOrdenados> {
  const db = getDb();

  const config = await getConfig();
  const tz = config?.timezone || "Europe/Lisbon";
  const resendKey = config?.resendApiKey ?? null;
  const remetente = config?.fromEmail || "onboarding@resend.dev";
  if (!resendKey) {
    throw new Error("Chave API Resend não configurada");
  }

  const mes = mesNoFuso(tz);

  const todosTreinadores = await db
    .select({
      groupRate: coaches.groupRate,
      id: coaches.id,
      individualRate: coaches.individualRate,
      nome: coaches.name,
    })
    .from(coaches);

  // `startDate` is an RFC3339 string in the user's local timezone; the
  // "in month" filter is done in JS (same pattern as `lembretes.server.ts`).
  // Only finished sessions are paid (`endDate <= now`).
  const agora = new Date().toISOString();
  const treinosDoMes = (
    await db
      .select({
        coachId: trainings.coachId,
        endDate: trainings.endDate,
        startDate: trainings.startDate,
        type: trainings.type,
      })
      .from(trainings)
      .where(ne(trainings.status, "Cancelled"))
  ).filter((t) => {
    const d = new Date(t.startDate);
    const ymd = new Intl.DateTimeFormat("en-CA", {
      day: "2-digit",
      month: "2-digit",
      timeZone: tz,
      year: "numeric",
    }).format(d);
    return ymd.slice(0, 7) === mes && t.endDate <= agora;
  });

  interface Linha {
    horasGrupo: number;
    horasInd: number;
    nome: string;
    valorGrupo: number;
    valorInd: number;
  }
  const linhas = new Map<string, Linha>();
  for (const t of todosTreinadores) {
    linhas.set(t.id, {
      horasGrupo: 0,
      horasInd: 0,
      nome: t.nome,
      valorGrupo: eurosDeCents(t.groupRate),
      valorInd: eurosDeCents(t.individualRate),
    });
  }

  for (const t of treinosDoMes) {
    const linha = t.coachId ? linhas.get(t.coachId) : undefined;
    if (!linha) {
      continue;
    }
    const horas =
      (new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) /
      3_600_000;
    if (horas <= 0) {
      continue;
    }
    if (t.type === "Group") {
      linha.horasGrupo += horas;
    } else {
      linha.horasInd += horas;
    }
  }

  const resultado = [...linhas.values()]
    .map((l) => ({
      ...l,
      total: l.horasInd * l.valorInd + l.horasGrupo * l.valorGrupo,
    }))
    .filter((l) => l.horasInd > 0 || l.horasGrupo > 0);

  const total = resultado.reduce((acc, l) => acc + l.total, 0);
  const mesLegivel = new Date(`${mes}-01T12:00:00`).toLocaleDateString(
    "pt-PT",
    {
      month: "long",
      year: "numeric",
    }
  );

  const corpo = resultado.length
    ? `<table role="presentation" style="${estiloTabela}">
        <thead><tr>
          <th style="${estiloTh}">Treinador</th><th style="${estiloTh}">H. individuais</th><th style="${estiloTh}">H. grupo</th><th style="${estiloTh}">Ordenado</th>
        </tr></thead>
        <tbody>${resultado
          .map(
            (l) =>
              `<tr><td style="${estiloTd}">${l.nome}</td><td style="${estiloTd}">${l.horasInd.toFixed(1)}h</td><td style="${estiloTd}">${l.horasGrupo.toFixed(1)}h</td><td style="${estiloTd}">${euros(l.total)}</td></tr>`
          )
          .join("")}</tbody>
    </table>`
    : `<p style="margin:0">Não há horas de treino registadas neste mês.</p>`;

  const html = envelopeEmail(
    `Ordenados dos treinadores · ${mesLegivel}`,
    `<p style="margin:0 0 16px">Total a pagar: <strong>${euros(total)}</strong></p>${corpo}`
  );

  const res = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      cc: [EMAIL_ESCOLA],
      from: remetente,
      headers: { "X-Entity-Ref-ID": crypto.randomUUID() },
      html,
      subject: `Ordenados dos treinadores · ${mesLegivel}`,
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

  return { enviado: true, mes, total, treinadores: resultado.length };
}
