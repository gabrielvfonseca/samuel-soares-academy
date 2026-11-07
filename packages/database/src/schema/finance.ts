import {
  boolean,
  date,
  numeric,
  pgTable,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./_columns";
import { alunos, treinadores } from "./people";
import { clubes } from "./places";
import { treinos } from "./training";

export const mensalidades = pgTable(
  "mensalidades",
  {
    alunoId: uuid("aluno_id").references(() => alunos.id, {
      onDelete: "cascade",
    }),
    clubeId: uuid("clube_id").references(() => clubes.id, {
      onDelete: "cascade",
    }),
    createdAt: createdAt(),
    estadoPagamento: text("estado_pagamento")
      .notNull()
      .default("A aguardar pagamento"),
    fatura: text("fatura"),
    id: id(),
    mesReferencia: date("mes_referencia").notNull(),
    nif: text("nif"),
    notas: text("notas"),
    updatedAt: updatedAt(),
    valor: numeric("valor", { precision: 10, scale: 2 }),
  },
  (t) => [unique("mensalidades_unicas").on(t.alunoId, t.mesReferencia)]
);

export const movimentos = pgTable("movimentos", {
  automatico: boolean("automatico").notNull().default(false),
  categoria: text("categoria").notNull().default("Outros"),
  createdAt: createdAt(),
  data: date("data").notNull(),
  descricao: text("descricao"),
  id: id(),
  mensalidadeId: uuid("mensalidade_id").references(() => mensalidades.id, {
    onDelete: "cascade",
  }),
  tipo: text("tipo").notNull(),
  treinadorId: uuid("treinador_id").references(() => treinadores.id, {
    onDelete: "set null",
  }),
  treinoId: uuid("treino_id").references(() => treinos.id, {
    onDelete: "cascade",
  }),
  updatedAt: updatedAt(),
  valor: numeric("valor", { precision: 10, scale: 2 }).notNull().default("0"),
});
