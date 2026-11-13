import "server-only";

import { envelopeEmail } from "@repo/email/layout";

type Row = Record<string, unknown>;

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

/** Data (YYYY-MM-DD) no fuso indicado, deslocada por `offsetDias`. */
function dataNoFuso(tz: string, offsetDias = 0) {
  const base = new Date(Date.now() + offsetDias * 86_400_000);
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: tz,
    year: "numeric",
  }).format(base);
  return parts;
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
  const { supabaseAdmin } = await import(
    "@/integrations/supabase/client.server"
  );

  const { data: cfg, error: cfgErr } = await supabaseAdmin
    .from("configuracoes_notificacoes")
    .select("*")
    .limit(1)
    .single();
  if (cfgErr || !cfg) {
    throw new Error(cfgErr?.message ?? "Configuração não encontrada");
  }

  const config = cfg as Row;
  const tz = (config.fuso_horario as string) || "Europe/Lisbon";
  const horaTexto = String(config.hora_envio_diario ?? "20:00");
  const [hCfg, mCfg] = horaTexto.split(":").map(Number);
  const minutosConfig = (hCfg ?? 20) * 60 + (mCfg ?? 0);
  const hoje = dataNoFuso(tz, 0);
  const jaEnviado = (config.ultimo_envio_data as string | null) === hoje;

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
  const inicio = new Date(`${dia}T00:00:00`);
  const fim = new Date(`${dia}T23:59:59`);

  const { data: treinos, error: trErr } = await supabaseAdmin
    .from("treinos")
    .select("*, treinadores(*), alunos(nome), turmas(nome), clubes(nome)")
    .eq("estado", "Agendado")
    .gte("data_hora_inicio", inicio.toISOString())
    .lte("data_hora_inicio", fim.toISOString())
    .order("data_hora_inicio");
  if (trErr) {
    throw new Error(trErr.message);
  }

  const lista = (treinos ?? []) as Row[];
  const grupos = new Map<string, Row[]>();
  for (const t of lista) {
    const tid = t.treinador_id as string | null;
    if (!tid) {
      continue;
    }
    grupos.set(tid, [...(grupos.get(tid) ?? []), t]);
  }

  const canal = (config.canal_preferencial as string) ?? "Email";
  const resendKey = config.chave_api_resend as string | null;
  const waToken = config.chave_api_whatsapp as string | null;
  const waPhoneId = config.whatsapp_phone_id as string | null;
  const remetente =
    (config.email_remetente as string) || "onboarding@resend.dev";

  let enviados = 0;
  let erros = 0;
  const registos: Row[] = [];

  for (const [treinadorId, treinosDoTreinador] of grupos) {
    const treinador = treinosDoTreinador[0]?.treinadores as Row | null;
    if (!treinador || treinador.ativo === false) {
      continue;
    }

    const linhas = treinosDoTreinador.map((t) => {
      const clube = (t.clubes as Row | null)?.nome as string | undefined;
      const turma = (t.turmas as Row | null)?.nome as string | undefined;
      const aluno = (t.alunos as Row | null)?.nome as string | undefined;
      const nome = clube
        ? `Treino no ${clube}`
        : (turma ?? aluno ?? "Treino sem nome");
      return `${fmtHora(t.data_hora_inicio as string, tz)}–${fmtHora(t.data_hora_fim as string, tz)} · ${nome} · ${t.campo_local ?? "Local a definir"}`;
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
    const texto = `Olá ${treinador.nome},\n\nLembrete dos teus treinos de amanhã (${dataLegivel}):\n\n${linhas.map((l) => `• ${l}`).join("\n")}\n\nBons treinos!`;
    const html = envelopeEmail(
      "Treinos de amanhã",
      `<p style="margin:0 0 16px">Olá <strong>${treinador.nome}</strong>, aqui está o teu plano para <strong>${dataLegivel}</strong>:</p>
       <ul style="padding-left:18px;line-height:1.8;margin:0">${linhas.map((l) => `<li>${l}</li>`).join("")}</ul>`
    );

    const canais: string[] =
      canal === "Ambos" ? ["Email", "WhatsApp"] : [canal];

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
            treinador.email as string,
            assunto,
            html
          );
        } else {
          if (!(waToken && waPhoneId)) {
            throw new Error("Credenciais WhatsApp não configuradas");
          }
          if (!treinador.telefone_whatsapp) {
            throw new Error("Treinador sem telefone WhatsApp");
          }
          await enviarWhatsapp(
            waToken,
            waPhoneId,
            treinador.telefone_whatsapp as string,
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
          canal: c,
          detalhe,
          estado_envio: estado,
          treinador_id: treinadorId,
          treino_id: t.id,
        });
      }
    }
  }

  if (registos.length > 0) {
    await supabaseAdmin.from("historico_lembretes").insert(registos as never);
  }

  if (!forcar) {
    await supabaseAdmin
      .from("configuracoes_notificacoes")
      .update({ ultimo_envio_data: hoje } as never)
      .eq("id", config.id as string);
  }

  return {
    enviados,
    erros,
    executado: true,
    treinadores: grupos.size,
    treinos: lista.length,
  };
}
