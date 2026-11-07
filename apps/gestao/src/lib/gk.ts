import { supabase } from "@/integrations/supabase/client";

export type Treinador = {
  id: string;
  nome: string;
  email: string;
  telefone_whatsapp: string | null;
  ativo: boolean;
  valor_hora_individual: number;
  valor_hora_grupo: number;
};

export type ModalidadeInscricao = "Inscrição Base" | "Inscrição Pro" | "Inscrição Supreme";

export const MODALIDADES_INSCRICAO: ModalidadeInscricao[] = [
  "Inscrição Base",
  "Inscrição Pro",
  "Inscrição Supreme",
];

export type TipoAtleta = "Individual" | "Grupo";

export const TIPOS_ATLETA: TipoAtleta[] = ["Individual", "Grupo"];

export type Aluno = {
  id: string;
  nome: string;
  escalao: string | null;
  contacto_ee: string | null;
  notas_tecnicas: string | null;
  data_inscricao: string | null;
  modalidade_inscricao: ModalidadeInscricao | null;
  tipo_atleta: TipoAtleta;
  turma_id: string | null;
  turma_ids: string[] | null;
};

export type Turma = {
  id: string;
  nome: string;
  escalao: string | null;
  treinador_id: string | null;
  campo_id: string | null;
  dia_semana: number | null;
  hora_inicio: string | null;
  hora_fim: string | null;
  ativo: boolean;
  notas: string | null;
};

export function formatMesAno(iso: string) {
  return new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("pt-PT", {
    month: "long",
    year: "numeric",
  });
}

export function horasTreino(inicio: string, fim: string) {
  const h = (new Date(fim).getTime() - new Date(inicio).getTime()) / 3600000;
  return h > 0 ? h : 0;
}

export type EstadoTreino = "Agendado" | "Concluído" | "Cancelado";
export type EstadoPagamento = "A aguardar pagamento" | "Pago";
export type EstadoFatura = "Com fatura" | "Sem fatura";
export type TipoTreino = "Individual" | "Grupo";

export type Treino = {
  id: string;
  data_hora_inicio: string;
  data_hora_fim: string;
  treinador_id: string | null;
  aluno_id: string | null;
  turma_id: string | null;
  clube_id?: string | null;
  serie_id?: string | null;
  campo_local: string | null;
  estado: EstadoTreino;
  tipo: TipoTreino;
  estado_pagamento: EstadoPagamento;
  fatura: EstadoFatura | null;
  nif: string | null;
  notas: string | null;
};

export type Configuracao = {
  id: string;
  hora_envio_diario: string;
  canal_preferencial: "Email" | "WhatsApp" | "Ambos";
  chave_api_resend: string | null;
  chave_api_whatsapp: string | null;
  whatsapp_phone_id: string | null;
  email_remetente: string | null;
  fuso_horario: string;
};

export type Lembrete = {
  id: string;
  treino_id: string | null;
  treinador_id: string | null;
  data_envio: string;
  canal: string;
  estado_envio: string;
  detalhe: string | null;
};

function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return data as T;
}

export const listTreinadores = async () =>
  unwrap<Treinador[]>((await supabase.from("treinadores").select("*").order("nome")) as never);

export const listAlunos = async () =>
  unwrap<Aluno[]>((await supabase.from("alunos").select("*").order("nome")) as never);

export const listTreinos = async () =>
  unwrap<Treino[]>((await supabase.from("treinos").select("*").order("data_hora_inicio")) as never);

export const getConfiguracao = async () =>
  unwrap<Configuracao>(
    (await supabase.from("configuracoes_notificacoes").select("*").limit(1).single()) as never,
  );

export const listLembretes = async () =>
  unwrap<Lembrete[]>(
    (await supabase
      .from("historico_lembretes")
      .select("*")
      .order("data_envio", { ascending: false })
      .limit(100)) as never,
  );

export type Mensalidade = {
  id: string;
  aluno_id: string | null;
  clube_id?: string | null;
  mes_referencia: string;
  valor: number | null;
  estado_pagamento: EstadoPagamento;
  fatura: EstadoFatura | null;
  nif: string | null;
  notas: string | null;
};

export const listMensalidades = async () =>
  unwrap<Mensalidade[]>(
    (await supabase
      .from("mensalidades")
      .select("*")
      .order("mes_referencia", { ascending: false })) as never,
  );

export const TIPOS_TREINO: TipoTreino[] = ["Individual", "Grupo"];

export function formatMes(iso: string) {
  return new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString("pt-PT", {
    month: "long",
    year: "numeric",
  });
}

export function mesAtual() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export const ESTADOS: EstadoTreino[] = ["Agendado", "Concluído", "Cancelado"];
export const ESTADOS_PAGAMENTO: EstadoPagamento[] = ["A aguardar pagamento", "Pago"];
export const ESTADOS_FATURA: EstadoFatura[] = ["Com fatura", "Sem fatura"];

export function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
}

export function formatData(iso: string | Date) {
  return new Date(iso).toLocaleDateString("pt-PT", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export type Disponibilidade = {
  id: string;
  treinador_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  notas: string | null;
};

export const DIAS_SEMANA = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
] as const;

export const listDisponibilidades = async () =>
  unwrap<Disponibilidade[]>(
    (await supabase
      .from("disponibilidades")
      .select("*")
      .order("dia_semana")
      .order("hora_inicio")) as never,
  );

export function formatHoraSimples(hora: string) {
  return hora.slice(0, 5);
}

export type TipoMovimento = "Entrada" | "Saída";

export type Movimento = {
  id: string;
  tipo: TipoMovimento;
  categoria: string;
  descricao: string | null;
  valor: number;
  data: string;
  treino_id: string | null;
  treinador_id: string | null;
  automatico: boolean;
};

export const TIPOS_MOVIMENTO: TipoMovimento[] = ["Entrada", "Saída"];

export const CATEGORIAS_MOVIMENTO = [
  "Treino individual",
  "Mensalidade",
  "Ordenado treinador",
  "Material",
  "Aluguer de campo",
  "Outros",
] as const;

export const listMovimentos = async () =>
  unwrap<Movimento[]>(
    (await supabase.from("movimentos").select("*").order("data", { ascending: false })) as never,
  );

export function formatEuros(valor: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(valor);
}

export type Campo = {
  id: string;
  nome: string;
  morada: string | null;
  notas: string | null;
  ativo: boolean;
};

export type DisponibilidadeCampo = {
  id: string;
  campo_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
  notas: string | null;
};

export const listCampos = async () =>
  unwrap<Campo[]>((await supabase.from("campos").select("*").order("nome")) as never);

export const listDisponibilidadesCampos = async () =>
  unwrap<DisponibilidadeCampo[]>(
    (await supabase
      .from("disponibilidades_campos")
      .select("*")
      .order("dia_semana")
      .order("hora_inicio")) as never,
  );

export function minutosDeHora(hora: string) {
  const [h, m] = hora.slice(0, 5).split(":");
  return Number(h) * 60 + Number(m);
}

export function horaDeMinutos(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export type Clube = {
  id: string;
  nome: string;
  nif: string | null;
  contacto: string | null;
  email: string | null;
  valor_mensal: number;
  treinador_id: string | null;
  campo_id: string | null;
  dia_semana: number | null;
  hora_inicio: string | null;
  hora_fim: string | null;
  ativo: boolean;
  notas: string | null;
};

export const listClubes = async () =>
  unwrap<Clube[]>((await supabase.from("clubes").select("*").order("nome")) as never);

export type ClubeSessao = {
  id: string;
  clube_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
};

export const listClubeSessoes = async () =>
  unwrap<ClubeSessao[]>(
    (await supabase
      .from("clube_sessoes")
      .select("*")
      .order("dia_semana")
      .order("hora_inicio")) as never,
  );

export const listTurmas = async () =>
  unwrap<Turma[]>((await supabase.from("turmas").select("*").order("nome")) as never);

/**
 * Encontra os treinos individuais da mesma série recorrente.
 * Usa serie_id quando existe; para treinos antigos usa aluno + treinador + dia da semana + hora.
 * Treinos já concluídos nunca são incluídos (protegem as contas).
 */
export async function encontrarSerie(
  treino: Treino,
  modo: "seguintes" | "toda",
): Promise<string[]> {
  let lista: Treino[] = [];
  if (treino.serie_id) {
    const { data, error } = await supabase
      .from("treinos")
      .select("*")
      .eq("serie_id", treino.serie_id);
    if (error) throw new Error(error.message);
    lista = (data ?? []) as unknown as Treino[];
  } else if (treino.aluno_id) {
    const { data, error } = await supabase
      .from("treinos")
      .select("*")
      .eq("tipo", "Individual")
      .eq("aluno_id", treino.aluno_id);
    if (error) throw new Error(error.message);
    const ref = new Date(treino.data_hora_inicio);
    lista = ((data ?? []) as unknown as Treino[]).filter((t) => {
      const d = new Date(t.data_hora_inicio);
      return (
        t.treinador_id === treino.treinador_id &&
        d.getDay() === ref.getDay() &&
        d.getHours() === ref.getHours() &&
        d.getMinutes() === ref.getMinutes()
      );
    });
  } else {
    lista = [treino];
  }
  const inicioRef = new Date(treino.data_hora_inicio).getTime();
  return lista
    .filter((t) => t.id === treino.id || t.estado !== "Concluído")
    .filter((t) => modo === "toda" || new Date(t.data_hora_inicio).getTime() >= inicioRef)
    .map((t) => t.id);
}
