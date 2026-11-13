"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { toast } from "@repo/ui/components/sonner";
import {
  CalendarClock,
  GraduationCap,
  Plus,
  Trash2,
  Users,
} from "@repo/ui/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { TreinoDialog } from "@/components/treino-dialog";
import { supabase } from "@/integrations/supabase/client";
import {
  formatData,
  formatHora,
  listAlunos,
  listTreinadores,
  listTreinos,
  listTurmas,
  sameDay,
  type Treino,
} from "@/lib/gk";

function Dashboard() {
  const [open, setOpen] = useState(false);
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

  const nomeTreinador = (id: string | null) =>
    treinadores.data?.find((t) => t.id === id)?.nome ?? "—";
  const nomeAluno = (t: Treino) =>
    t.tipo === "Grupo"
      ? (turmas.data?.find((x) => x.id === t.turma_id)?.nome ?? "Turma")
      : (alunos.data?.find((a) => a.id === t.aluno_id)?.nome ?? "—");

  const hoje = new Date();
  const { deHoje, proximos } = useMemo(() => {
    const lista = treinos.data ?? [];
    return {
      deHoje: lista.filter((t) => sameDay(new Date(t.data_hora_inicio), hoje)),
      proximos: lista
        .filter((t) => new Date(t.data_hora_inicio) > hoje)
        .slice(0, 8),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treinos.data]);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl leading-none">Dashboard</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("pt-PT", {
              day: "2-digit",
              month: "long",
              weekday: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> Marcar treino
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={CalendarClock}
          label="Treinos hoje"
          value={deHoje.length}
        />
        <StatCard
          icon={Users}
          label="Treinadores ativos"
          value={(treinadores.data ?? []).filter((t) => t.ativo).length}
        />
        <StatCard
          icon={GraduationCap}
          label="Alunos"
          value={(alunos.data ?? []).length}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">Hoje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {deHoje.length === 0 && (
              <p className="text-muted-foreground text-sm">
                Sem treinos marcados para hoje.
              </p>
            )}
            {deHoje.map((t) => (
              <div
                className="pitch-line bg-secondary/50 rounded-md p-3"
                key={t.id}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">
                    {formatHora(t.data_hora_inicio)} –{" "}
                    {formatHora(t.data_hora_fim)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{t.estado}</Badge>
                    {t.tipo === "Grupo" && (
                      <Badge variant="secondary">Grupo</Badge>
                    )}
                    {t.tipo === "Individual" && t.estado === "Concluído" && (
                      <Badge
                        variant={
                          t.estado_pagamento === "Pago"
                            ? "default"
                            : "secondary"
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
                <p className="text-muted-foreground text-sm">
                  {nomeAluno(t)} · {nomeTreinador(t.treinador_id)} ·{" "}
                  {t.campo_local ?? "Local a definir"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">
              Próximos treinos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {proximos.length === 0 && (
              <p className="text-muted-foreground text-sm">
                Nada agendado por agora.
              </p>
            )}
            {proximos.map((t) => (
              <div
                className="border-border/60 flex items-center justify-between gap-3 rounded-md border p-3"
                key={t.id}
              >
                <div>
                  <p className="text-sm font-semibold capitalize">
                    {formatData(t.data_hora_inicio)} ·{" "}
                    {formatHora(t.data_hora_inicio)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {nomeAluno(t)} · {nomeTreinador(t.treinador_id)}
                  </p>
                </div>
                <Badge variant="secondary">{t.campo_local ?? "—"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <TreinoDialog
        alunos={alunos.data ?? []}
        onOpenChange={setOpen}
        open={open}
        treinadores={treinadores.data ?? []}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="bg-primary/15 text-primary rounded-lg p-3">
          <Icon className="size-6" />
        </div>
        <div>
          <p className="font-display text-4xl leading-none">{value}</p>
          <p className="text-muted-foreground text-xs tracking-widest uppercase">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default Dashboard;
