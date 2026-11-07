import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./_columns";
import { alunos, treinadores } from "./people";
import { clubes, turmas } from "./places";

export const treinos = pgTable("treinos", {
  id: id(),
  dataHoraInicio: timestamp("data_hora_inicio", { withTimezone: true, mode: "string" }).notNull(),
  dataHoraFim: timestamp("data_hora_fim", { withTimezone: true, mode: "string" }).notNull(),
  treinadorId: uuid("treinador_id").references(() => treinadores.id, { onDelete: "set null" }),
  alunoId: uuid("aluno_id").references(() => alunos.id, { onDelete: "set null" }),
  turmaId: uuid("turma_id").references(() => turmas.id, { onDelete: "set null" }),
  clubeId: uuid("clube_id").references(() => clubes.id, { onDelete: "set null" }),
  serieId: uuid("serie_id"),
  campoLocal: text("campo_local"),
  tipo: text("tipo").notNull().default("Individual"),
  estado: text("estado").notNull().default("Agendado"),
  estadoPagamento: text("estado_pagamento").notNull().default("A aguardar pagamento"),
  fatura: text("fatura"),
  nif: text("nif"),
  notas: text("notas"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const historicoLembretes = pgTable("historico_lembretes", {
  id: id(),
  treinoId: uuid("treino_id").references(() => treinos.id, { onDelete: "set null" }),
  treinadorId: uuid("treinador_id").references(() => treinadores.id, { onDelete: "set null" }),
  dataEnvio: timestamp("data_envio", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  canal: text("canal").notNull(),
  estadoEnvio: text("estado_envio").notNull(),
  detalhe: text("detalhe"),
});
