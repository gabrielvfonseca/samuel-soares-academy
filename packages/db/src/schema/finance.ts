import { boolean, date, numeric, pgTable, text, unique, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./_columns";
import { alunos, treinadores } from "./people";
import { clubes } from "./places";
import { treinos } from "./training";

export const mensalidades = pgTable(
  "mensalidades",
  {
    id: id(),
    alunoId: uuid("aluno_id").references(() => alunos.id, { onDelete: "cascade" }),
    clubeId: uuid("clube_id").references(() => clubes.id, { onDelete: "cascade" }),
    mesReferencia: date("mes_referencia").notNull(),
    valor: numeric("valor", { precision: 10, scale: 2 }),
    estadoPagamento: text("estado_pagamento").notNull().default("A aguardar pagamento"),
    fatura: text("fatura"),
    nif: text("nif"),
    notas: text("notas"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [unique("mensalidades_unicas").on(t.alunoId, t.mesReferencia)],
);

export const movimentos = pgTable("movimentos", {
  id: id(),
  tipo: text("tipo").notNull(),
  categoria: text("categoria").notNull().default("Outros"),
  descricao: text("descricao"),
  valor: numeric("valor", { precision: 10, scale: 2 }).notNull().default("0"),
  data: date("data").notNull(),
  treinoId: uuid("treino_id").references(() => treinos.id, { onDelete: "cascade" }),
  treinadorId: uuid("treinador_id").references(() => treinadores.id, { onDelete: "set null" }),
  mensalidadeId: uuid("mensalidade_id").references(() => mensalidades.id, { onDelete: "cascade" }),
  automatico: boolean("automatico").notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});
