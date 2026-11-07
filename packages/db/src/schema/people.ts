import { sql } from "drizzle-orm";
import { boolean, date, numeric, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./_columns";
import { turmas } from "./places";

export const treinadores = pgTable("treinadores", {
  id: id(),
  nome: text("nome").notNull(),
  email: text("email").notNull(),
  telefoneWhatsapp: text("telefone_whatsapp"),
  ativo: boolean("ativo").notNull().default(true),
  dataNascimento: date("data_nascimento"),
  morada: text("morada"),
  nif: text("nif"),
  observacoes: text("observacoes"),
  valorHoraIndividual: numeric("valor_hora_individual").notNull().default("0"),
  valorHoraGrupo: numeric("valor_hora_grupo").notNull().default("0"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const alunos = pgTable("alunos", {
  id: id(),
  nome: text("nome").notNull(),
  escalao: text("escalao"),
  contactoEe: text("contacto_ee"),
  nomeEe: text("nome_ee"),
  emailEe: text("email_ee"),
  notasTecnicas: text("notas_tecnicas"),
  observacoes: text("observacoes"),
  dataNascimento: date("data_nascimento"),
  dataInscricao: date("data_inscricao"),
  modalidadeInscricao: text("modalidade_inscricao"),
  tipoAtleta: text("tipo_atleta").notNull().default("Individual"),
  turmaId: uuid("turma_id").references(() => turmas.id, { onDelete: "set null" }),
  turmaIds: uuid("turma_ids")
    .array()
    .notNull()
    .default(sql`'{}'::uuid[]`),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});
