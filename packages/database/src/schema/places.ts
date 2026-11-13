import {
  boolean,
  numeric,
  pgTable,
  smallint,
  text,
  time,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./_columns";
import { treinadores } from "./people";

export const campos = pgTable("campos", {
  ativo: boolean("ativo").notNull().default(true),
  createdAt: createdAt(),
  id: id(),
  morada: text("morada"),
  nome: text("nome").notNull(),
  notas: text("notas"),
  updatedAt: updatedAt(),
});

export const disponibilidades = pgTable("disponibilidades", {
  createdAt: createdAt(),
  diaSemana: smallint("dia_semana").notNull(),
  horaFim: time("hora_fim").notNull(),
  horaInicio: time("hora_inicio").notNull(),
  id: id(),
  notas: text("notas"),
  treinadorId: uuid("treinador_id")
    .notNull()
    .references(() => treinadores.id, { onDelete: "cascade" }),
  updatedAt: updatedAt(),
});

export const disponibilidadesCampos = pgTable("disponibilidades_campos", {
  campoId: uuid("campo_id")
    .notNull()
    .references(() => campos.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
  diaSemana: smallint("dia_semana").notNull(),
  horaFim: time("hora_fim").notNull(),
  horaInicio: time("hora_inicio").notNull(),
  id: id(),
  notas: text("notas"),
  updatedAt: updatedAt(),
});

export const turmas = pgTable("turmas", {
  ativo: boolean("ativo").notNull().default(true),
  campoId: uuid("campo_id").references(() => campos.id, {
    onDelete: "set null",
  }),
  createdAt: createdAt(),
  diaSemana: smallint("dia_semana"),
  escalao: text("escalao"),
  horaFim: time("hora_fim"),
  horaInicio: time("hora_inicio"),
  id: id(),
  nome: text("nome").notNull(),
  notas: text("notas"),
  treinadorId: uuid("treinador_id").references(() => treinadores.id, {
    onDelete: "set null",
  }),
  updatedAt: updatedAt(),
});

export const clubes = pgTable("clubes", {
  ativo: boolean("ativo").notNull().default(true),
  campoId: uuid("campo_id").references(() => campos.id, {
    onDelete: "set null",
  }),
  contacto: text("contacto"),
  createdAt: createdAt(),
  diaSemana: smallint("dia_semana"),
  email: text("email"),
  horaFim: time("hora_fim"),
  horaInicio: time("hora_inicio"),
  id: id(),
  nif: text("nif"),
  nome: text("nome").notNull(),
  notas: text("notas"),
  treinadorId: uuid("treinador_id").references(() => treinadores.id, {
    onDelete: "set null",
  }),
  updatedAt: updatedAt(),
  valorMensal: numeric("valor_mensal").notNull().default("0"),
});

export const clubeSessoes = pgTable("clube_sessoes", {
  clubeId: uuid("clube_id")
    .notNull()
    .references(() => clubes.id, { onDelete: "cascade" }),
  createdAt: createdAt(),
  diaSemana: smallint("dia_semana").notNull(),
  horaFim: time("hora_fim").notNull(),
  horaInicio: time("hora_inicio").notNull(),
  id: id(),
  updatedAt: updatedAt(),
});
