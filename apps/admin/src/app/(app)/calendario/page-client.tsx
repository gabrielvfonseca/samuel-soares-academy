"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { toast } from "@repo/ui/components/sonner";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "@repo/ui/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { TreinoDialog } from "@/components/treino-dialog";
import { supabase } from "@/integrations/supabase/client";
import {
  formatHora,
  listAlunos,
  listCampos,
  listClubeSessoes,
  listClubes,
  listTreinadores,
  listTreinos,
  listTurmas,
  sameDay,
  type Treino,
} from "@/lib/gk";

type Vista = "mes" | "semana" | "dia";

function startOfWeek(d: Date) {
  const date = new Date(d);
  const dia = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - dia);
  date.setHours(0, 0, 0, 0);
  return date;
}

function Calendario() {
  const [vista, setVista] = useState<Vista>("mes");
  const [ref, setRef] = useState(new Date());
  const [filtro, setFiltro] = useState("todos");
  const [open, setOpen] = useState(false);
  const [selecionado, setSelecionado] = useState<Treino | null>(null);
  const [diaSelecionado, setDiaSelecionado] = useState<Date>(new Date());

  const qc = useQueryClient();
  const apagar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("treinos").delete().eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["treinos"] });
      toast.success("Treino eliminado");
    },
  });

  const treinos = useQuery({ queryFn: listTreinos, queryKey: ["treinos"] });
  const treinadores = useQuery({
    queryFn: listTreinadores,
    queryKey: ["treinadores"],
  });
  const alunos = useQuery({ queryFn: listAlunos, queryKey: ["alunos"] });
  const turmas = useQuery({ queryFn: listTurmas, queryKey: ["turmas"] });
  const clubes = useQuery({ queryFn: listClubes, queryKey: ["clubes"] });
  const clubeSessoes = useQuery({
    queryFn: listClubeSessoes,
    queryKey: ["clube_sessoes"],
  });

  const filtrados = useMemo(
    () =>
      (treinos.data ?? []).filter(
        (t) => filtro === "todos" || t.treinador_id === filtro
      ),
    [treinos.data, filtro]
  );

  const campos = useQuery({ queryFn: listCampos, queryKey: ["campos"] });

  const dias = useMemo(() => {
    if (vista === "dia") {
      return [new Date(ref)];
    }
    if (vista === "semana") {
      const inicio = startOfWeek(ref);
      return Array.from(
        { length: 7 },
        (_, i) => new Date(inicio.getTime() + i * 86_400_000)
      );
    }
    const primeiro = new Date(ref.getFullYear(), ref.getMonth(), 1);
    const inicio = startOfWeek(primeiro);
    return Array.from(
      { length: 42 },
      (_, i) => new Date(inicio.getTime() + i * 86_400_000)
    );
  }, [vista, ref]);

  const gerar = useMutation({
    mutationFn: async () => {
      const existentes = treinos.data ?? [];
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const agora = new Date();
      const novos: Record<string, unknown>[] = [];
      const atualizacoes: Array<{
        id: string;
        valores: Record<string, unknown>;
      }> = [];
      const esperadosClube = new Set<string>();
      const esperadosTurma = new Set<string>();
      const chaveDia = (id: string, data: Date) =>
        `${id}|${data.getFullYear()}-${data.getMonth()}-${data.getDate()}`;
      for (const dia of dias) {
        if (dia < hoje) {
          continue;
        }
        for (const turma of turmas.data ?? []) {
          if (
            !turma.ativo ||
            turma.dia_semana === null ||
            !turma.hora_inicio ||
            !turma.hora_fim
          ) {
            continue;
          }
          if (dia.getDay() !== turma.dia_semana) {
            continue;
          }
          const [hi, mi] = turma.hora_inicio.slice(0, 5).split(":").map(Number);
          const [hf, mf] = turma.hora_fim.slice(0, 5).split(":").map(Number);
          const inicio = new Date(dia);
          inicio.setHours(hi ?? 0, mi ?? 0, 0, 0);
          const fim = new Date(dia);
          fim.setHours(hf ?? 0, mf ?? 0, 0, 0);
          esperadosTurma.add(chaveDia(turma.id, inicio));
          const jaExiste = existentes.find(
            (t) =>
              t.turma_id === turma.id &&
              sameDay(new Date(t.data_hora_inicio), inicio)
          );
          if (jaExiste) {
            if (
              new Date(jaExiste.data_hora_inicio).getTime() !==
                inicio.getTime() ||
              new Date(jaExiste.data_hora_fim).getTime() !== fim.getTime() ||
              jaExiste.treinador_id !== turma.treinador_id ||
              jaExiste.campo_local !==
                (campos.data?.find((c) => c.id === turma.campo_id)?.nome ??
                  null)
            ) {
              atualizacoes.push({
                id: jaExiste.id,
                valores: {
                  campo_local:
                    campos.data?.find((c) => c.id === turma.campo_id)?.nome ??
                    null,
                  data_hora_fim: fim.toISOString(),
                  data_hora_inicio: inicio.toISOString(),
                  treinador_id: turma.treinador_id,
                },
              });
            }
            continue;
          }
          novos.push({
            aluno_id: null,
            campo_local:
              campos.data?.find((c) => c.id === turma.campo_id)?.nome ?? null,
            data_hora_fim: fim.toISOString(),
            data_hora_inicio: inicio.toISOString(),
            estado: "Agendado",
            tipo: "Grupo",
            treinador_id: turma.treinador_id,
            turma_id: turma.id,
          });
        }
        for (const sessao of clubeSessoes.data ?? []) {
          if (dia.getDay() !== sessao.dia_semana) {
            continue;
          }
          const clube = clubes.data?.find((c) => c.id === sessao.clube_id);
          if (!clube?.ativo) {
            continue;
          }
          const [hi, mi] = sessao.hora_inicio
            .slice(0, 5)
            .split(":")
            .map(Number);
          const [hf, mf] = sessao.hora_fim.slice(0, 5).split(":").map(Number);
          const inicio = new Date(dia);
          inicio.setHours(hi ?? 0, mi ?? 0, 0, 0);
          const fim = new Date(dia);
          fim.setHours(hf ?? 0, mf ?? 0, 0, 0);
          esperadosClube.add(chaveDia(clube.id, inicio));
          const jaExiste = existentes.find(
            (t) =>
              t.clube_id === clube.id &&
              sameDay(new Date(t.data_hora_inicio), inicio)
          );
          if (jaExiste) {
            if (
              new Date(jaExiste.data_hora_inicio).getTime() !==
                inicio.getTime() ||
              new Date(jaExiste.data_hora_fim).getTime() !== fim.getTime() ||
              jaExiste.treinador_id !== clube.treinador_id ||
              jaExiste.campo_local !==
                (campos.data?.find((c) => c.id === clube.campo_id)?.nome ??
                  null)
            ) {
              atualizacoes.push({
                id: jaExiste.id,
                valores: {
                  campo_local:
                    campos.data?.find((c) => c.id === clube.campo_id)?.nome ??
                    null,
                  data_hora_fim: fim.toISOString(),
                  data_hora_inicio: inicio.toISOString(),
                  treinador_id: clube.treinador_id,
                },
              });
            }
            continue;
          }
          novos.push({
            aluno_id: null,
            campo_local:
              campos.data?.find((c) => c.id === clube.campo_id)?.nome ?? null,
            clube_id: clube.id,
            data_hora_fim: fim.toISOString(),
            data_hora_inicio: inicio.toISOString(),
            estado: "Agendado",
            tipo: "Grupo",
            treinador_id: clube.treinador_id,
            turma_id: null,
          });
        }
      }

      // Remove treinos futuros de clubes/turmas que já não correspondem
      // ao horário atualmente definido.
      const primeiroDia = dias[0];
      const ultimoDia = dias.at(-1);
      const obsoletos = existentes
        .filter((t) => {
          if (t.estado !== "Agendado") {
            return false;
          }
          if (!(t.clube_id || t.turma_id)) {
            return false;
          }
          const inicio = new Date(t.data_hora_inicio);
          if (inicio < agora) {
            return false;
          }
          if (primeiroDia && inicio < primeiroDia) {
            return false;
          }
          if (ultimoDia) {
            const limite = new Date(ultimoDia);
            limite.setHours(23, 59, 59, 999);
            if (inicio > limite) {
              return false;
            }
          }
          const chave = chaveDia(t.clube_id ?? t.turma_id ?? "", inicio);
          return t.clube_id
            ? !esperadosClube.has(chave)
            : !esperadosTurma.has(chave);
        })
        .map((t) => t.id);

      if (obsoletos.length) {
        const del = await supabase.from("treinos").delete().in("id", obsoletos);
        if (del.error) {
          throw new Error(del.error.message);
        }
      }

      for (const atualizacao of atualizacoes) {
        const res = await supabase
          .from("treinos")
          .update(atualizacao.valores as never)
          .eq("id", atualizacao.id);
        if (res.error) {
          throw new Error(res.error.message);
        }
      }

      if (novos.length) {
        const { error } = await supabase.from("treinos").insert(novos as never);
        if (error) {
          throw new Error(error.message);
        }
      }
      return {
        atualizados: atualizacoes.length,
        criados: novos.length,
        removidos: obsoletos.length,
      };
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: ({ criados, atualizados, removidos }) => {
      if (criados || atualizados || removidos) {
        qc.invalidateQueries({ queryKey: ["treinos"] });
        if (criados) {
          toast.success(`${criados} treino(s) adicionados ao calendário`);
        }
        if (atualizados) {
          toast.success(`${atualizados} treino(s) ajustados ao novo horário`);
        }
        if (removidos) {
          toast.success(`${removidos} treino(s) desatualizados removidos`);
        }
      }
    },
  });

  const geradoRef = useRef<string>("");
  useEffect(() => {
    if (
      !(
        treinos.data &&
        turmas.data &&
        campos.data &&
        clubes.data &&
        clubeSessoes.data
      ) ||
      treinos.isFetching ||
      turmas.isFetching ||
      campos.isFetching ||
      clubes.isFetching ||
      clubeSessoes.isFetching
    ) {
      return;
    }
    const assinatura = [
      ...(clubeSessoes.data ?? []).map(
        (s) => `${s.clube_id}|${s.dia_semana}|${s.hora_inicio}|${s.hora_fim}`
      ),
      ...(clubes.data ?? []).map(
        (c) => `${c.id}|${c.ativo}|${c.treinador_id}|${c.campo_id}`
      ),
      ...(turmas.data ?? []).map(
        (t) =>
          `${t.id}|${t.ativo}|${t.dia_semana}|${t.hora_inicio}|${t.hora_fim}|${t.treinador_id}|${t.campo_id}`
      ),
    ]
      .sort()
      .join(";");
    const chave = `${vista}-${ref.getFullYear()}-${ref.getMonth()}-${ref.getDate()}-${assinatura}`;
    if (geradoRef.current === chave || gerar.isPending) {
      return;
    }
    geradoRef.current = chave;
    gerar.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    treinos.data,
    treinos.isFetching,
    turmas.data,
    turmas.isFetching,
    campos.data,
    campos.isFetching,
    clubes.data,
    clubes.isFetching,
    clubeSessoes.data,
    clubeSessoes.isFetching,
    gerar.isPending,
    vista,
    ref,
  ]);

  function mover(delta: number) {
    const d = new Date(ref);
    if (vista === "mes") {
      d.setMonth(d.getMonth() + delta);
    } else if (vista === "semana") {
      d.setDate(d.getDate() + 7 * delta);
    } else {
      d.setDate(d.getDate() + delta);
    }
    setRef(d);
  }

  const nomeAluno = (t: Treino) => {
    if (t.tipo !== "Grupo") {
      return alunos.data?.find((a) => a.id === t.aluno_id)?.nome ?? "—";
    }
    if (t.clube_id) {
      return clubes.data?.find((c) => c.id === t.clube_id)?.nome ?? "Clube";
    }
    return turmas.data?.find((x) => x.id === t.turma_id)?.nome ?? "Turma";
  };

  const titulo = ref.toLocaleDateString("pt-PT", {
    month: "long",
    year: "numeric",
    ...(vista === "dia" ? { day: "2-digit" } : {}),
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl leading-none">Calendário</h1>
          <p className="text-muted-foreground capitalize">{titulo}</p>
        </div>
        <Button
          onClick={() => {
            setSelecionado(null);
            setDiaSelecionado(new Date());
            setOpen(true);
          }}
        >
          <Plus className="size-4" /> Marcar treino
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs onValueChange={(v) => setVista(v as Vista)} value={vista}>
          <TabsList>
            <TabsTrigger value="mes">Mês</TabsTrigger>
            <TabsTrigger value="semana">Semana</TabsTrigger>
            <TabsTrigger value="dia">Dia</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-1">
          <Button onClick={() => mover(-1)} size="icon" variant="outline">
            <ChevronLeft className="size-4" />
          </Button>
          <Button onClick={() => setRef(new Date())} variant="outline">
            Hoje
          </Button>
          <Button onClick={() => mover(1)} size="icon" variant="outline">
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Select onValueChange={setFiltro} value={filtro}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Filtrar por treinador" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os treinadores</SelectItem>
            {(treinadores.data ?? []).map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          {vista === "mes" && (
            <div className="text-muted-foreground mb-2 grid grid-cols-7 gap-2 text-center text-xs tracking-widest uppercase">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          )}
          <div
            className={
              vista === "dia"
                ? "grid grid-cols-1 gap-2"
                : vista === "semana"
                  ? "grid grid-cols-1 gap-2 sm:grid-cols-7"
                  : "grid grid-cols-7 gap-2"
            }
          >
            {dias.map((dia) => {
              const doDia = filtrados.filter((t) =>
                sameDay(new Date(t.data_hora_inicio), dia)
              );
              const foraDoMes =
                vista === "mes" && dia.getMonth() !== ref.getMonth();
              return (
                <button
                  className={`border-border/60 hover:border-primary/60 min-h-24 rounded-md border p-2 text-left transition-colors ${
                    foraDoMes ? "opacity-40" : ""
                  } ${sameDay(dia, new Date()) ? "border-primary/70 bg-primary/5" : ""}`}
                  key={dia.toISOString()}
                  onClick={() => {
                    setSelecionado(null);
                    setDiaSelecionado(new Date(dia));
                    setOpen(true);
                  }}
                >
                  <span className="text-muted-foreground text-xs font-semibold">
                    {dia.getDate()}
                  </span>
                  <div className="mt-1 space-y-1">
                    {doDia.map((t) => (
                      <span
                        className="bg-primary/15 text-primary block truncate rounded px-1.5 py-1 text-[11px] font-medium"
                        key={t.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelecionado(t);
                          setOpen(true);
                        }}
                        onKeyDown={() => undefined}
                        role="button"
                        tabIndex={0}
                      >
                        {formatHora(t.data_hora_inicio)} {nomeAluno(t)}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {vista === "dia" && (
        <div className="space-y-2">
          {filtrados
            .filter((t) => sameDay(new Date(t.data_hora_inicio), ref))
            .map((t) => (
              <div
                className="border-border/60 flex items-center justify-between rounded-md border p-3"
                key={t.id}
              >
                <span className="font-semibold">
                  {formatHora(t.data_hora_inicio)} –{" "}
                  {formatHora(t.data_hora_fim)} · {nomeAluno(t)}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{t.estado}</Badge>
                  {t.tipo === "Grupo" && (
                    <Badge variant="secondary">Grupo</Badge>
                  )}
                  {t.tipo === "Individual" && t.estado === "Concluído" && (
                    <Badge
                      variant={
                        t.estado_pagamento === "Pago" ? "default" : "secondary"
                      }
                    >
                      {t.estado_pagamento}
                    </Badge>
                  )}
                  {t.tipo === "Individual" &&
                    t.estado_pagamento === "Pago" &&
                    t.fatura && <Badge variant="outline">{t.fatura}</Badge>}
                  <Button
                    className="text-destructive hover:text-destructive"
                    disabled={apagar.isPending}
                    onClick={() => {
                      if (window.confirm("Eliminar este treino agendado?")) {
                        apagar.mutate(t.id);
                      }
                    }}
                    size="icon"
                    variant="ghost"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}

      <TreinoDialog
        alunos={alunos.data ?? []}
        dataInicial={diaSelecionado}
        onOpenChange={setOpen}
        open={open}
        treinadores={treinadores.data ?? []}
        treino={selecionado}
      />
    </div>
  );
}

export default Calendario;
