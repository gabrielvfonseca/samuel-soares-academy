import { boolean, date, pgTable, text, time, timestamp } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./_columns";

export const configuracoesNotificacoes = pgTable("configuracoes_notificacoes", {
  id: id(),
  horaEnvioDiario: time("hora_envio_diario").notNull().default("20:00"),
  canalPreferencial: text("canal_preferencial").notNull().default("Email"),
  chaveApiResend: text("chave_api_resend"),
  chaveApiWhatsapp: text("chave_api_whatsapp"),
  whatsappPhoneId: text("whatsapp_phone_id"),
  emailRemetente: text("email_remetente").default("onboarding@resend.dev"),
  fusoHorario: text("fuso_horario").notNull().default("Europe/Lisbon"),
  ultimoEnvioData: date("ultimo_envio_data"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const cronConfig = pgTable("cron_config", {
  id: boolean("id").primaryKey().default(true),
  secret: text("secret").notNull(),
  endpoint: text("endpoint").notNull(),
});

export const lembretesPessoais = pgTable("lembretes_pessoais", {
  id: id(),
  texto: text("texto").notNull(),
  quando: timestamp("quando", { withTimezone: true, mode: "string" }).notNull(),
  email: text("email").notNull(),
  enviado: boolean("enviado").notNull().default(false),
  enviadoEm: timestamp("enviado_em", { withTimezone: true, mode: "string" }),
  erro: text("erro"),
  createdAt: createdAt(),
});
