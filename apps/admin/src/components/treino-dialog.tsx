"use client";

import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { toast } from "@repo/ui/components/sonner";
import { Textarea } from "@repo/ui/components/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/data/client";
import type { Coach, Student, Training } from "@/lib/gk";
import {
  findSeries,
  INVOICE_STATUSES,
  listGroups,
  PAYMENT_STATUSES,
  TRAINING_STATUSES,
  TRAINING_TYPES,
  toLocalInput,
} from "@/lib/gk";

interface Props {
  alunos: Student[];
  dataInicial?: Date;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  treinadores: Coach[];
  treino?: Training | null;
}

export function TreinoDialog({
  open,
  onOpenChange,
  treino,
  treinadores,
  alunos,
  dataInicial,
}: Props) {
  const qc = useQueryClient();
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [treinadorId, setTreinadorId] = useState("");
  const [alunoId, setAlunoId] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const turmas = useQuery({ queryFn: listGroups, queryKey: ["turmas"] });
  const [local, setLocal] = useState("");
  const [estado, setEstado] = useState<string>("Scheduled");
  const [tipo, setTipo] = useState<string>("Individual");
  const [estadoPagamento, setEstadoPagamento] = useState<string>("Pending");
  const [fatura, setFatura] = useState<string>("No invoice");
  const [nif, setNif] = useState("");
  const [notas, setNotas] = useState("");
  const [repeticao, setRepeticao] = useState<string>("nenhuma");
  const [ocorrencias, setOcorrencias] = useState<string>("4");

  function alterarInicio(value: string) {
    setInicio(value);
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      setFim(toLocalInput(new Date(d.getTime() + 60 * 60_000)));
    }
  }

  useEffect(() => {
    if (!open) {
      return;
    }
    const base = dataInicial ?? new Date();
    const inicioBase = treino
      ? new Date(treino.start_date)
      : new Date(base.setHours(18, 0, 0, 0));
    const fimBase = treino
      ? new Date(treino.end_date)
      : new Date(inicioBase.getTime() + 60 * 60_000);
    setInicio(toLocalInput(inicioBase));
    setFim(toLocalInput(fimBase));
    setTreinadorId(treino?.coach_id ?? "");
    setAlunoId(treino?.student_id ?? "");
    setTurmaId(treino?.group_id ?? "");
    setLocal(treino?.field ?? "");
    setEstado(treino?.status ?? "Scheduled");
    setTipo(treino?.type ?? "Individual");
    setEstadoPagamento(treino?.payment_status ?? "Pending");
    setFatura(treino?.invoice ?? "No invoice");
    setNif(treino?.tax_id ?? "");
    setNotas(treino?.notes ?? "");
    setRepeticao("nenhuma");
    setOcorrencias("4");
  }, [open, treino, dataInicial]);

  const guardar = useMutation({
    mutationFn: async () => {
      const payload = {
        coach_id: treinadorId || null,
        end_date: new Date(fim).toISOString(),
        estado,
        field: local || null,
        group_id: tipo === "Group" ? turmaId || null : null,
        invoice:
          tipo === "Individual" &&
          estado === "Completed" &&
          estadoPagamento === "Paid"
            ? fatura
            : null,
        notes: notas || null,
        payment_status:
          tipo === "Individual" && estado === "Completed"
            ? estadoPagamento
            : "Pending",
        start_date: new Date(inicio).toISOString(),
        student_id: tipo === "Group" ? null : alunoId || null,
        tax_id:
          tipo === "Individual" &&
          estado === "Completed" &&
          estadoPagamento === "Paid" &&
          fatura === "Invoiced"
            ? nif || null
            : null,
        tipo,
      };
      const repetir =
        !treino && tipo === "Individual" && repeticao !== "nenhuma";
      const total = repetir
        ? Math.min(Math.max(Number(ocorrencias) || 1, 1), 52)
        : 1;
      const dias = repeticao === "quinzenal" ? 14 : 7;

      if (repetir) {
        const base = new Date(inicio);
        const baseFim = new Date(fim);
        const serieId = crypto.randomUUID();
        const registos = Array.from({ length: total }, (_, i) => {
          const ini = new Date(base);
          ini.setDate(ini.getDate() + i * dias);
          const f = new Date(baseFim);
          f.setDate(f.getDate() + i * dias);
          return {
            ...payload,
            end_date: f.toISOString(),
            series_id: serieId,
            start_date: ini.toISOString(),
          };
        });
        const { error } = await supabase
          .from("trainings")
          .insert(registos as never);
        if (error) {
          throw new Error(error.message);
        }
        return total;
      }

      const res = treino
        ? await supabase
            .from("trainings")
            .update(payload as never)
            .eq("id", treino.id)
        : await supabase.from("trainings").insert(payload as never);
      if (res.error) {
        throw new Error(res.error.message);
      }
      return 1;
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: (total) => {
      qc.invalidateQueries({ queryKey: ["treinos"] });
      toast.success(
        treino
          ? "Training atualizado"
          : total > 1
            ? `${total} treinos marcados`
            : "Training marcado"
      );
      onOpenChange(false);
    },
  });

  const apagar = useMutation({
    mutationFn: async () => {
      if (!treino) {
        return;
      }
      const { error } = await supabase
        .from("trainings")
        .delete()
        .eq("id", treino.id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["treinos"] });
      toast.success("Training eliminado");
      onOpenChange(false);
    },
  });

  const apagarSerie = useMutation({
    mutationFn: async (modo: "upcoming" | "all") => {
      if (!treino) {
        return 0;
      }
      const ids = await findSeries(treino, modo);
      if (ids.length === 0) {
        return 0;
      }
      const { error } = await supabase.from("trainings").delete().in("id", ids);
      if (error) {
        throw new Error(error.message);
      }
      return ids.length;
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: (n) => {
      qc.invalidateQueries({ queryKey: ["treinos"] });
      toast.success(
        `${n} treino${n === 1 ? "" : "s"} eliminado${n === 1 ? "" : "s"}`
      );
      onOpenChange(false);
    },
  });

  async function confirmarSerie(modo: "upcoming" | "all") {
    if (!treino) {
      return;
    }
    try {
      const n = (await findSeries(treino, modo)).length;
      const msg =
        modo === "upcoming"
          ? `Eliminar este treino e os ${n - 1} seguintes da mesma série?`
          : `Eliminar toda a série (${n} treinos)? Os treinos já concluídos são mantidos.`;
      if (window.confirm(msg)) {
        apagarSerie.mutate(modo);
      }
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {treino ? "Editar treino" : "Marcar treino"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="inicio">Início</Label>
              <Input
                id="inicio"
                onChange={(e) => alterarInicio(e.target.value)}
                type="datetime-local"
                value={inicio}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fim">Fim</Label>
              <Input
                id="fim"
                onChange={(e) => setFim(e.target.value)}
                type="datetime-local"
                value={fim}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Coach</Label>
            <Select onValueChange={setTreinadorId} value={treinadorId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar treinador" />
              </SelectTrigger>
              <SelectContent>
                {treinadores.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {tipo === "Group" ? (
            <div className="space-y-2">
              <Label>Group</Label>
              <Select onValueChange={setTurmaId} value={turmaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar turma" />
                </SelectTrigger>
                <SelectContent>
                  {(turmas.data ?? [])
                    .filter((t) => t.active || t.id === turmaId)
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {turmaId && (
                <p className="text-muted-foreground text-xs">
                  Atletas:{" "}
                  {alunos
                    .filter((a) =>
                      a.group_ids?.length
                        ? a.group_ids.includes(turmaId)
                        : a.group_id === turmaId
                    )
                    .map((a) => a.name)
                    .join(", ") || "ainda sem atletas nesta turma"}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Student</Label>
              <Select onValueChange={setAlunoId} value={alunoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar aluno" />
                </SelectTrigger>
                <SelectContent>
                  {alunos.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="local">Field / Local</Label>
              <Input
                id="local"
                onChange={(e) => setLocal(e.target.value)}
                value={local}
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select onValueChange={setEstado} value={estado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRAINING_STATUSES.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tipo de treino</Label>
            <Select onValueChange={setTipo} value={tipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRAINING_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t === "Individual"
                      ? "Training individual"
                      : "Training de grupo"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!treino && tipo === "Individual" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Repetição</Label>
                <Select onValueChange={setRepeticao} value={repeticao}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhuma">Não repetir</SelectItem>
                    <SelectItem value="semanal">Todas as semanas</SelectItem>
                    <SelectItem value="quinzenal">De 15 em 15 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {repeticao !== "nenhuma" && (
                <div className="space-y-2">
                  <Label htmlFor="ocorrencias">Número de treinos</Label>
                  <Input
                    id="ocorrencias"
                    max={52}
                    min={1}
                    onChange={(e) => setOcorrencias(e.target.value)}
                    type="number"
                    value={ocorrencias}
                  />
                  <p className="text-muted-foreground text-xs">
                    Inclui o primeiro treino, no mesmo dia da semana e à mesma
                    hora.
                  </p>
                </div>
              )}
            </div>
          )}
          {tipo === "Individual" && estado === "Completed" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Pagamento</Label>
                <Select
                  onValueChange={setEstadoPagamento}
                  value={estadoPagamento}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUSES.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {estadoPagamento === "Paid" && (
                <div className="space-y-2">
                  <Label>Fatura</Label>
                  <Select onValueChange={setFatura} value={fatura}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INVOICE_STATUSES.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
          {tipo === "Individual" &&
            estado === "Completed" &&
            estadoPagamento === "Paid" &&
            fatura === "Invoiced" && (
              <div className="space-y-2">
                <Label htmlFor="nif">NIF para a fatura</Label>
                <Input
                  id="nif"
                  inputMode="numeric"
                  onChange={(e) => setNif(e.target.value)}
                  placeholder="Ex.: 123456789"
                  value={nif}
                />
              </div>
            )}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              onChange={(e) => setNotas(e.target.value)}
              value={notas}
            />
          </div>
        </div>
        {treino && treino.type === "Individual" && (
          <div className="border-border/60 flex flex-wrap items-center gap-2 rounded-md border p-3">
            <span className="text-muted-foreground text-xs">
              Training recorrente?
            </span>
            <Button
              className="text-destructive"
              disabled={apagarSerie.isPending}
              onClick={() => confirmarSerie("upcoming")}
              size="sm"
              type="button"
              variant="outline"
            >
              Eliminar este e seguintes
            </Button>
            <Button
              className="text-destructive"
              disabled={apagarSerie.isPending}
              onClick={() => confirmarSerie("all")}
              size="sm"
              type="button"
              variant="outline"
            >
              Eliminar toda a série
            </Button>
          </div>
        )}
        <DialogFooter className="gap-2 sm:justify-between">
          {treino ? (
            <Button onClick={() => apagar.mutate()} variant="destructive">
              Eliminar
            </Button>
          ) : (
            <span />
          )}
          <Button disabled={guardar.isPending} onClick={() => guardar.mutate()}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
