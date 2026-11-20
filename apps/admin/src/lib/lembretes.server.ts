import "server-only";

import {
  clubs,
  coaches,
  groups,
  reminderHistory,
  students,
  trainings,
} from "@repo/database/schema";
import { envelopeEmail } from "@repo/email/layout";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/integrations/db/client.server";
import { dataNoFuso, getConfig, upsertConfig } from "./db-helpers.server";

export interface ResultadoEnvio {
  enviados: number;
  erros: number;
  executado: boolean;
  motivo?: string;
  treinadores: number;
  treinos: number;
}

function fmtHora(iso: string, tz: string) {
  return new Date(iso).toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  });
}

function fmtData(d: Date, tz: string) {
  return d.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    timeZone: tz,
    weekday: "long",
  });
}

function minutosNoFuso(tz: string) {
  const s = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    timeZone: tz,
  }).format(new Date());
  const [h, m] = s.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Cópia de todos os lembretes para o responsável da academia. */
const EMAIL_COPIA_ADMIN = "ruijmorgadomarques@gmail.com";
const EMAIL_ESCOLA = "geral@samuelsoares.academy";

async function enviarEmail(
  apiKey: string,
  from: string,
  to: string,
  subject: string,
  html: string
) {
  const cc =
    to.trim().toLowerCase() === EMAIL_COPIA_ADMIN
      ? [EMAIL_ESCOLA]
      : [EMAIL_COPIA_ADMIN, EMAIL_ESCOLA];
  const res = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      cc,
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

async function enviarWhatsapp(
  token: string,
  phoneId: string,
  to: string,
  texto: string
) {
  const res = await fetch(
    `https://graph.facebook.com/v20.0/${phoneId}/messages`,
    {
      body: JSON.stringify({
        messaging_product: "whatsapp",
        text: { body: texto },
        to: to.replace(/[^\d]/gu, ""),
        type: "text",
      }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    }
  );
  if (!res.ok) {
    throw new Error(`WhatsApp [${res.status}]: ${await res.text()}`);
  }
}

export async function executarLembretes(
  forcar = false
): Promise<ResultadoEnvio> {
  const db = getDb();

  const config = await getConfig();
  if (!config) {
    throw new Error("Configuração não encontrada");
  }

  const tz = config.timezone || "Europe/Lisbon";
  const horaTexto = String(config.dailySendTime ?? "20:00");
  const [hCfg, mCfg] = horaTexto.split(":").map(Number);
  const minutosConfig = (hCfg ?? 20) * 60 + (mCfg ?? 0);
  const hoje = dataNoFuso(tz, 0);
  const jaEnviado = config.lastSentDate === hoje;

  if (!forcar && (jaEnviado || minutosNoFuso(tz) < minutosConfig)) {
    return {
      enviados: 0,
      erros: 0,
      executado: false,
      motivo: jaEnviado ? "Já enviado hoje" : "Ainda antes da hora configurada",
      treinadores: 0,
      treinos: 0,
    };
  }

  const dia = dataNoFuso(tz, 1);

  const treinosAgendados = await db
    .select({
      clubId: trainings.clubId,
      coachId: trainings.coachId,
      endDate: trainings.endDate,
      field: trainings.field,
      groupId: trainings.groupId,
      id: trainings.id,
      startDate: trainings.startDate,
      studentId: trainings.studentId,
    })
    .from(trainings)
    .where(eq(trainings.status, "Scheduled"))
    .orderBy(asc(trainings.startDate));

  // Filter for the target day in the configured timezone.
  const treinosDoDia = treinosAgendados.filter((t) => {
    const d = new Date(t.startDate);
    const dayStr = new Intl.DateTimeFormat("en-CA", {
      day: "2-digit",
      month: "2-digit",
      timeZone: tz,
      year: "numeric",
    }).format(d);
    return dayStr === dia;
  });

  // Resolve lookup tables for name resolution.
  const [todosClubes, todasTurmas, todosAlunos, todosTreinadores] =
    await Promise.all([
      db.select({ id: clubs.id, nome: clubs.name }).from(clubs),
      db.select({ id: groups.id, nome: groups.name }).from(groups),
      db.select({ id: students.id, nome: students.name }).from(students),
      db
        .select({
          active: coaches.active,
          email: coaches.email,
          id: coaches.id,
          name: coaches.name,
          whatsappPhone: coaches.whatsappPhone,
        })
        .from(coaches),
    ]);

  const clubeNome = new Map(todosClubes.map((c) => [c.id, c.nome]));
  const turmaNome = new Map(todasTurmas.map((t) => [t.id, t.nome]));
  const alunoNome = new Map(todosAlunos.map((a) => [a.id, a.nome]));
  const treinadorPorId = new Map(todosTreinadores.map((t) => [t.id, t]));

  // Group by coachId.
  const grupos = new Map<string, typeof treinosDoDia>();
  for (const t of treinosDoDia) {
    const tid = t.coachId;
    if (!tid) {
      continue;
    }
    grupos.set(tid, [...(grupos.get(tid) ?? []), t]);
  }

  const canal = config.preferredChannel ?? "Email";
  const resendKey = config.resendApiKey ?? null;
  const waToken = config.whatsappApiKey ?? null;
  const waPhoneId = config.whatsappPhoneId ?? null;
  const remetente = config.fromEmail || "onboarding@resend.dev";

  let enviados = 0;
  let erros = 0;
  type Registo = typeof reminderHistory.$inferInsert;
  const registos: Registo[] = [];

  for (const [treinadorId, treinosDoTreinador] of grupos) {
    const treinador = treinadorPorId.get(treinadorId);
    if (!treinador?.active) {
      continue;
    }

    const linhas = treinosDoTreinador.map((t) => {
      const clube = t.clubId ? clubeNome.get(t.clubId) : undefined;
      const turma = t.groupId ? turmaNome.get(t.groupId) : undefined;
      const aluno = t.studentId ? alunoNome.get(t.studentId) : undefined;
      const nome = clube
        ? `Treino no ${clube}`
        : (turma ?? aluno ?? "Treino sem nome");
      return `${fmtHora(t.startDate, tz)}–${fmtHora(t.endDate, tz)} · ${nome} · ${t.field ?? "Local a definir"}`;
    });
    const dataLegivel = fmtData(new Date(`${dia}T12:00:00`), tz);
    const diaSemana = new Date(`${dia}T12:00:00`).toLocaleDateString("pt-PT", {
      timeZone: tz,
      weekday: "long",
    });
    const horaEnvio = new Date().toLocaleTimeString("pt-PT", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: tz,
    });
    const assunto = forcar
      ? `Teste ${horaEnvio} · Treinos de ${diaSemana} · ${dataLegivel}`
      : `Treinos de ${diaSemana} · ${dataLegivel}`;
    const texto = `Olá ${treinador.name},\n\nLembrete dos teus treinos de amanhã (${dataLegivel}):\n\n${linhas.map((l) => `• ${l}`).join("\n")}\n\nBons treinos!`;
    const html = envelopeEmail(
      "Treinos de amanhã",
      `<p style="margin:0 0 16px">Olá <strong>${treinador.name}</strong>, aqui está o teu plano para <strong>${dataLegivel}</strong>:</p>
       <ul style="padding-left:18px;line-height:1.8;margin:0">${linhas.map((l) => `<li>${l}</li>`).join("")}</ul>`
    );

    const canais: string[] = canal === "Both" ? ["Email", "WhatsApp"] : [canal];

    for (const c of canais) {
      let estado = "sucesso";
      let detalhe: string | null = null;
      try {
        if (c === "Email") {
          if (!resendKey) {
            throw new Error("Chave API Resend não configurada");
          }
          await enviarEmail(
            resendKey,
            remetente,
            treinador.email,
            assunto,
            html
          );
        } else {
          if (!(waToken && waPhoneId)) {
            throw new Error("Credenciais WhatsApp não configuradas");
          }
          if (!treinador.whatsappPhone) {
            throw new Error("Treinador sem telefone WhatsApp");
          }
          await enviarWhatsapp(
            waToken,
            waPhoneId,
            treinador.whatsappPhone,
            texto
          );
        }
        enviados++;
      } catch (e) {
        estado = "erro";
        detalhe = e instanceof Error ? e.message : String(e);
        erros++;
      }
      for (const t of treinosDoTreinador) {
        registos.push({
          channel: c,
          coachId: treinadorId,
          detail: detalhe,
          id: crypto.randomUUID(),
          status: estado,
          trainingId: t.id,
        });
      }
    }
  }

  if (registos.length > 0) {
    await db.insert(reminderHistory).values(registos);
  }

  if (!forcar) {
    await upsertConfig({ lastSentDate: hoje });
  }

  return {
    enviados,
    erros,
    executado: true,
    treinadores: grupos.size,
    treinos: treinosDoDia.length,
  };
}
