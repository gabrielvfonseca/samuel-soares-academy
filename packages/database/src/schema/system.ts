import {
  boolean,
  date,
  pgTable,
  text,
  time,
  timestamp,
} from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./_columns";

export const configuracoesNotificacoes = pgTable("configuracoes_notificacoes", {
  canalPreferencial: text("canal_preferencial").notNull().default("Email"),
  chaveApiResend: text("chave_api_resend"),
  chaveApiWhatsapp: text("chave_api_whatsapp"),
  createdAt: createdAt(),
  emailRemetente: text("email_remetente").default("onboarding@resend.dev"),
  fusoHorario: text("fuso_horario").notNull().default("Europe/Lisbon"),
  horaEnvioDiario: time("hora_envio_diario").notNull().default("20:00"),
  id: id(),
  ultimoEnvioData: date("ultimo_envio_data"),
  updatedAt: updatedAt(),
  whatsappPhoneId: text("whatsapp_phone_id"),
});

export const cronConfig = pgTable("cron_config", {
  endpoint: text("endpoint").notNull(),
  id: boolean("id").primaryKey().default(true),
  secret: text("secret").notNull(),
});

export const lembretesPessoais = pgTable("lembretes_pessoais", {
  createdAt: createdAt(),
  email: text("email").notNull(),
  enviado: boolean("enviado").notNull().default(false),
  enviadoEm: timestamp("enviado_em", { mode: "string", withTimezone: true }),
  erro: text("erro"),
  id: id(),
  quando: timestamp("quando", { mode: "string", withTimezone: true }).notNull(),
  texto: text("texto").notNull(),
});
