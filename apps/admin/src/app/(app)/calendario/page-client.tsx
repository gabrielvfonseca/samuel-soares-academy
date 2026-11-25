"use client";

import { Badge } from "@ssa/ui/components/badge";
import { Button } from "@ssa/ui/components/button";
import { Card, CardContent } from "@ssa/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ssa/ui/components/select";
import { toast } from "@ssa/ui/components/sonner";
import { Tabs, TabsList, TabsTrigger } from "@ssa/ui/components/tabs";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "@ssa/ui/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { TreinoDialog } from "@/components/treino-dialog";
import { supabase } from "@/integrations/data/client";
import {
  formatTime,
  listClubSessions,
  listClubs,
  listCoaches,
  listFields,
  listGroups,
  listStudents,
  listTrainings,
  sameDay,
  type Training,
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
  const [selecionado, setSelecionado] = useState<Training | null>(null);
  const [diaSelecionado, setDiaSelecionado] = useState<Date>(new Date());

  const qc = useQueryClient();
  const apagar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("trainings").delete().eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["treinos"] });
      toast.success("Training eliminado");
    },
  });

  const treinos = useQuery({ queryFn: listTrainings, queryKey: ["treinos"] });
  const treinadores = useQuery({
    queryFn: listCoaches,
    queryKey: ["treinadores"],
  });
  const alunos = useQuery({ queryFn: listStudents, queryKey: ["alunos"] });
  const turmas = useQuery({ queryFn: listGroups, queryKey: ["turmas"] });
  const clubes = useQuery({ queryFn: listClubs, queryKey: ["clubes"] });
  const clubeSessoes = useQuery({
    queryFn: listClubSessions,
    queryKey: ["clube_sessoes"],
  });

  const filtrados = useMemo(
    () =>
      (treinos.data ?? []).filter(
        (t) => filtro === "todos" || t.coach_id === filtro
      ),
    [treinos.data, filtro]
  );

  const campos = useQuery({ queryFn: listFields, queryKey: ["campos"] });

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
      const chaveDia = (id: string, date: Date) =>
        `${id}|${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      for (const dia of dias) {
        if (dia < hoje) {
          continue;
        }
        for (const turma of turmas.data ?? []) {
          if (
            !turma.active ||
            turma.day_of_week === null ||
            !turma.start_time ||
            !turma.end_time
          ) {
            continue;
          }
          if (dia.getDay() !== turma.day_of_week) {
            continue;
          }
          const [hi, mi] = turma.start_time.slice(0, 5).split(":").map(Number);
          const [hf, mf] = turma.end_time.slice(0, 5).split(":").map(Number);
          const inicio = new Date(dia);
          inicio.setHours(hi ?? 0, mi ?? 0, 0, 0);
          const fim = new Date(dia);
          fim.setHours(hf ?? 0, mf ?? 0, 0, 0);
          esperadosTurma.add(chaveDia(turma.id, inicio));
          const jaExiste = existentes.find(
            (t) =>
              t.group_id === turma.id && sameDay(new Date(t.start_date), inicio)
          );
          if (jaExiste) {
            if (
              new Date(jaExiste.start_date).getTime() !== inicio.getTime() ||
              new Date(jaExiste.end_date).getTime() !== fim.getTime() ||
              jaExiste.coach_id !== turma.coach_id ||
              jaExiste.field !==
                (campos.data?.find((c) => c.id === turma.field_id)?.name ??
                  null)
            ) {
              atualizacoes.push({
                id: jaExiste.id,
                valores: {
                  coach_id: turma.coach_id,
                  end_date: fim.toISOString(),
                  field:
                    campos.data?.find((c) => c.id === turma.field_id)?.name ??
                    null,
                  start_date: inicio.toISOString(),
                },
              });
            }
            continue;
          }
          novos.push({
            coach_id: turma.coach_id,
            end_date: fim.toISOString(),
            field:
              campos.data?.find((c) => c.id === turma.field_id)?.name ?? null,
            group_id: turma.id,
            start_date: inicio.toISOString(),
            status: "Scheduled",
            student_id: null,
            type: "Group",
          });
        }
        for (const sessao of clubeSessoes.data ?? []) {
          if (dia.getDay() !== sessao.day_of_week) {
            continue;
          }
          const clube = clubes.data?.find((c) => c.id === sessao.club_id);
          if (!clube?.active) {
            continue;
          }
          const [hi, mi] = sessao.start_time.slice(0, 5).split(":").map(Number);
          const [hf, mf] = sessao.end_time.slice(0, 5).split(":").map(Number);
          const inicio = new Date(dia);
          inicio.setHours(hi ?? 0, mi ?? 0, 0, 0);
          const fim = new Date(dia);
          fim.setHours(hf ?? 0, mf ?? 0, 0, 0);
          esperadosClube.add(chaveDia(clube.id, inicio));
          const jaExiste = existentes.find(
            (t) =>
              t.club_id === clube.id && sameDay(new Date(t.start_date), inicio)
          );
          if (jaExiste) {
            if (
              new Date(jaExiste.start_date).getTime() !== inicio.getTime() ||
              new Date(jaExiste.end_date).getTime() !== fim.getTime() ||
              jaExiste.coach_id !== clube.coach_id ||
              jaExiste.field !==
                (campos.data?.find((c) => c.id === clube.field_id)?.name ??
                  null)
            ) {
              atualizacoes.push({
                id: jaExiste.id,
                valores: {
                  coach_id: clube.coach_id,
                  end_date: fim.toISOString(),
                  field:
                    campos.data?.find((c) => c.id === clube.field_id)?.name ??
                    null,
                  start_date: inicio.toISOString(),
                },
              });
            }
            continue;
          }
          novos.push({
            club_id: clube.id,
            coach_id: clube.coach_id,
            end_date: fim.toISOString(),
            field:
              campos.data?.find((c) => c.id === clube.field_id)?.name ?? null,
            group_id: null,
            start_date: inicio.toISOString(),
            status: "Scheduled",
            student_id: null,
            type: "Group",
          });
        }
      }

      // Remove treinos futuros de clubes/turmas que já não correspondem
      // ao horário atualmente definido.
      const primeiroDia = dias[0];
      const ultimoDia = dias.at(-1);
      const obsoletos = existentes
        .filter((t) => {
          if (t.status !== "Scheduled") {
            return false;
          }
          if (!(t.club_id || t.group_id)) {
            return false;
          }
          const inicio = new Date(t.start_date);
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
          const chave = chaveDia(t.club_id ?? t.group_id ?? "", inicio);
          return t.club_id
            ? !esperadosClube.has(chave)
            : !esperadosTurma.has(chave);
        })
        .map((t) => t.id);

      if (obsoletos.length) {
        const del = await supabase
          .from("trainings")
          .delete()
          .in("id", obsoletos);
        if (del.error) {
          throw new Error(del.error.message);
        }
      }

      for (const atualizacao of atualizacoes) {
        const res = await supabase
          .from("trainings")
          .update(atualizacao.valores as never)
          .eq("id", atualizacao.id);
        if (res.error) {
          throw new Error(res.error.message);
        }
      }

      if (novos.length) {
        const { error } = await supabase
          .from("trainings")
          .insert(novos as never);
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
        (s) => `${s.club_id}|${s.day_of_week}|${s.start_time}|${s.end_time}`
      ),
      ...(clubes.data ?? []).map(
        (c) => `${c.id}|${c.active}|${c.coach_id}|${c.field_id}`
      ),
      ...(turmas.data ?? []).map(
        (t) =>
          `${t.id}|${t.active}|${t.day_of_week}|${t.start_time}|${t.end_time}|${t.coach_id}|${t.field_id}`
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

  const nomeAluno = (t: Training) => {
    if (t.type !== "Group") {
      return alunos.data?.find((a) => a.id === t.student_id)?.name ?? "—";
    }
    if (t.club_id) {
      return clubes.data?.find((c) => c.id === t.club_id)?.name ?? "Clube";
    }
    return turmas.data?.find((x) => x.id === t.group_id)?.name ?? "Group";
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
          <h1 className="text-5xl leading-none">Calendário</h1>
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
                {t.name}
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
                sameDay(new Date(t.start_date), dia)
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
                        {formatTime(t.start_date)} {nomeAluno(t)}
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
            .filter((t) => sameDay(new Date(t.start_date), ref))
            .map((t) => (
              <div
                className="border-border/60 flex items-center justify-between rounded-md border p-3"
                key={t.id}
              >
                <span className="font-semibold">
                  {formatTime(t.start_date)} – {formatTime(t.end_date)} ·{" "}
                  {nomeAluno(t)}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{t.status}</Badge>
                  {t.type === "Group" && (
                    <Badge variant="secondary">Grupo</Badge>
                  )}
                  {t.type === "Individual" && t.status === "Completed" && (
                    <Badge
                      variant={
                        t.payment_status === "Paid" ? "default" : "secondary"
                      }
                    >
                      {t.payment_status}
                    </Badge>
                  )}
                  {t.type === "Individual" &&
                    t.payment_status === "Paid" &&
                    t.invoice && <Badge variant="outline">{t.invoice}</Badge>}
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
