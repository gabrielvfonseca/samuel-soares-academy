import { boolean, pgTable, smallint, text, time, uuid, numeric } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./_columns";
import { treinadores } from "./people";

export const campos = pgTable("campos", {
  id: id(),
  nome: text("nome").notNull(),
  morada: text("morada"),
  notas: text("notas"),
  ativo: boolean("ativo").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const disponibilidades = pgTable("disponibilidades", {
  id: id(),
  treinadorId: uuid("treinador_id")
    .notNull()
    .references(() => treinadores.id, { onDelete: "cascade" }),
  diaSemana: smallint("dia_semana").notNull(),
  horaInicio: time("hora_inicio").notNull(),
  horaFim: time("hora_fim").notNull(),
  notas: text("notas"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const disponibilidadesCampos = pgTable("disponibilidades_campos", {
  id: id(),
  campoId: uuid("campo_id")
    .notNull()
    .references(() => campos.id, { onDelete: "cascade" }),
  diaSemana: smallint("dia_semana").notNull(),
  horaInicio: time("hora_inicio").notNull(),
  horaFim: time("hora_fim").notNull(),
  notas: text("notas"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const turmas = pgTable("turmas", {
  id: id(),
  nome: text("nome").notNull(),
  escalao: text("escalao"),
  treinadorId: uuid("treinador_id").references(() => treinadores.id, { onDelete: "set null" }),
  campoId: uuid("campo_id").references(() => campos.id, { onDelete: "set null" }),
  diaSemana: smallint("dia_semana"),
  horaInicio: time("hora_inicio"),
  horaFim: time("hora_fim"),
  ativo: boolean("ativo").notNull().default(true),
  notas: text("notas"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const clubes = pgTable("clubes", {
  id: id(),
  nome: text("nome").notNull(),
  nif: text("nif"),
  contacto: text("contacto"),
  email: text("email"),
  valorMensal: numeric("valor_mensal").notNull().default("0"),
  treinadorId: uuid("treinador_id").references(() => treinadores.id, { onDelete: "set null" }),
  campoId: uuid("campo_id").references(() => campos.id, { onDelete: "set null" }),
  diaSemana: smallint("dia_semana"),
  horaInicio: time("hora_inicio"),
  horaFim: time("hora_fim"),
  ativo: boolean("ativo").notNull().default(true),
  notas: text("notas"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const clubeSessoes = pgTable("clube_sessoes", {
  id: id(),
  clubeId: uuid("clube_id")
    .notNull()
    .references(() => clubes.id, { onDelete: "cascade" }),
  diaSemana: smallint("dia_semana").notNull(),
  horaInicio: time("hora_inicio").notNull(),
  horaFim: time("hora_fim").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});
