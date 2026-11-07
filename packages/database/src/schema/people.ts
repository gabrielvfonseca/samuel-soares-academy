import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  numeric,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./_columns";
import { turmas } from "./places";

export const treinadores = pgTable("treinadores", {
  ativo: boolean("ativo").notNull().default(true),
  createdAt: createdAt(),
  dataNascimento: date("data_nascimento"),
  email: text("email").notNull(),
  id: id(),
  morada: text("morada"),
  nif: text("nif"),
  nome: text("nome").notNull(),
  observacoes: text("observacoes"),
  telefoneWhatsapp: text("telefone_whatsapp"),
  updatedAt: updatedAt(),
  valorHoraGrupo: numeric("valor_hora_grupo").notNull().default("0"),
  valorHoraIndividual: numeric("valor_hora_individual").notNull().default("0"),
});

export const alunos = pgTable("alunos", {
  contactoEe: text("contacto_ee"),
  createdAt: createdAt(),
  dataInscricao: date("data_inscricao"),
  dataNascimento: date("data_nascimento"),
  emailEe: text("email_ee"),
  escalao: text("escalao"),
  id: id(),
  modalidadeInscricao: text("modalidade_inscricao"),
  nome: text("nome").notNull(),
  nomeEe: text("nome_ee"),
  notasTecnicas: text("notas_tecnicas"),
  observacoes: text("observacoes"),
  tipoAtleta: text("tipo_atleta").notNull().default("Individual"),
  turmaId: uuid("turma_id").references(() => turmas.id, {
    onDelete: "set null",
  }),
  turmaIds: uuid("turma_ids").array().notNull().default(sql`'{}'::uuid[]`),
  updatedAt: updatedAt(),
});
