import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./_columns";
import { alunos, treinadores } from "./people";
import { clubes, turmas } from "./places";

export const treinos = pgTable("treinos", {
  alunoId: uuid("aluno_id").references(() => alunos.id, {
    onDelete: "set null",
  }),
  campoLocal: text("campo_local"),
  clubeId: uuid("clube_id").references(() => clubes.id, {
    onDelete: "set null",
  }),
  createdAt: createdAt(),
  dataHoraFim: timestamp("data_hora_fim", {
    mode: "string",
    withTimezone: true,
  }).notNull(),
  dataHoraInicio: timestamp("data_hora_inicio", {
    mode: "string",
    withTimezone: true,
  }).notNull(),
  estado: text("estado").notNull().default("Agendado"),
  estadoPagamento: text("estado_pagamento")
    .notNull()
    .default("A aguardar pagamento"),
  fatura: text("fatura"),
  id: id(),
  nif: text("nif"),
  notas: text("notas"),
  serieId: uuid("serie_id"),
  tipo: text("tipo").notNull().default("Individual"),
  treinadorId: uuid("treinador_id").references(() => treinadores.id, {
    onDelete: "set null",
  }),
  turmaId: uuid("turma_id").references(() => turmas.id, {
    onDelete: "set null",
  }),
  updatedAt: updatedAt(),
});

export const historicoLembretes = pgTable("historico_lembretes", {
  canal: text("canal").notNull(),
  dataEnvio: timestamp("data_envio", { mode: "string", withTimezone: true })
    .notNull()
    .defaultNow(),
  detalhe: text("detalhe"),
  estadoEnvio: text("estado_envio").notNull(),
  id: id(),
  treinadorId: uuid("treinador_id").references(() => treinadores.id, {
    onDelete: "set null",
  }),
  treinoId: uuid("treino_id").references(() => treinos.id, {
    onDelete: "set null",
  }),
});
