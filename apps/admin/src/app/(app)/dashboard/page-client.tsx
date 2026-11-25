"use client";

import { Badge } from "@ssa/ui/components/badge";
import { Button } from "@ssa/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@ssa/ui/components/card";
import { toast } from "@ssa/ui/components/sonner";
import {
  CalendarClock,
  GraduationCap,
  Plus,
  Trash2,
  Users,
} from "@ssa/ui/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { TreinoDialog } from "@/components/treino-dialog";
import { supabase } from "@/integrations/data/client";
import {
  formatDate,
  formatTime,
  listCoaches,
  listGroups,
  listStudents,
  listTrainings,
  sameDay,
  type Training,
} from "@/lib/gk";

function Dashboard() {
  const [open, setOpen] = useState(false);
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
  const treinadoresAtivos = useMemo(
    () => (treinadores.data ?? []).filter((t) => t.active).length,
    [treinadores.data]
  );
  const alunos = useQuery({ queryFn: listStudents, queryKey: ["alunos"] });
  const turmas = useQuery({ queryFn: listGroups, queryKey: ["turmas"] });

  const nomeTreinador = (id: string | null) =>
    treinadores.data?.find((t) => t.id === id)?.name ?? "—";
  const nomeAluno = (t: Training) =>
    t.type === "Group"
      ? (turmas.data?.find((x) => x.id === t.group_id)?.name ?? "Group")
      : (alunos.data?.find((a) => a.id === t.student_id)?.name ?? "—");

  function abrirDialog() {
    setOpen(true);
  }

  function confirmarApagar(id: string) {
    if (window.confirm("Eliminar este treino agendado?")) {
      apagar.mutate(id);
    }
  }

  const hoje = useMemo(() => new Date(), []);
  const { deHoje, proximos } = useMemo(() => {
    const lista = treinos.data ?? [];
    return {
      deHoje: lista.filter((t) => sameDay(new Date(t.start_date), hoje)),
      proximos: lista.filter((t) => new Date(t.start_date) > hoje).slice(0, 8),
    };
  }, [treinos.data, hoje]);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl leading-none">Dashboard</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("pt-PT", {
              day: "2-digit",
              month: "long",
              weekday: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Button onClick={abrirDialog}>
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
          value={treinadoresAtivos}
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
            <CardTitle className="text-2xl">Hoje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {deHoje.length === 0 && (
              <p className="text-muted-foreground text-sm">
                Sem treinos marcados para hoje.
              </p>
            )}
            {deHoje.map((t) => (
              <div
                className="border-border bg-secondary/50 rounded-md border-l-4 p-3"
                key={t.id}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">
                    {formatTime(t.start_date)} – {formatTime(t.end_date)}
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
                      onClick={() => confirmarApagar(t.id)}
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  {nomeAluno(t)} · {nomeTreinador(t.coach_id)} ·{" "}
                  {t.field ?? "Local a definir"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Próximos treinos</CardTitle>
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
                    {formatDate(t.start_date)} · {formatTime(t.start_date)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {nomeAluno(t)} · {nomeTreinador(t.coach_id)}
                  </p>
                </div>
                <Badge variant="secondary">{t.field ?? "—"}</Badge>
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
          <p className="text-4xl leading-none">{value}</p>
          <p className="text-muted-foreground text-xs tracking-widest uppercase">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default Dashboard;
