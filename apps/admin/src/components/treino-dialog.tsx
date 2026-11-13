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
import { supabase } from "@/integrations/supabase/client";
import type { Aluno, Treinador, Treino } from "@/lib/gk";
import {
  ESTADOS,
  ESTADOS_FATURA,
  ESTADOS_PAGAMENTO,
  encontrarSerie,
  listTurmas,
  TIPOS_TREINO,
  toLocalInput,
} from "@/lib/gk";

interface Props {
  alunos: Aluno[];
  dataInicial?: Date;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  treinadores: Treinador[];
  treino?: Treino | null;
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
  const turmas = useQuery({ queryFn: listTurmas, queryKey: ["turmas"] });
  const [local, setLocal] = useState("");
  const [estado, setEstado] = useState<string>("Agendado");
  const [tipo, setTipo] = useState<string>("Individual");
  const [estadoPagamento, setEstadoPagamento] = useState<string>(
    "A aguardar pagamento"
  );
  const [fatura, setFatura] = useState<string>("Sem fatura");
  const [nif, setNif] = useState("");
  const [notas, setNotas] = useState("");
  const [repeticao, setRepeticao] = useState<string>("nenhuma");
  const [ocorrencias, setOcorrencias] = useState<string>("4");

  function alterarInicio(valor: string) {
    setInicio(valor);
    const d = new Date(valor);
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
      ? new Date(treino.data_hora_inicio)
      : new Date(base.setHours(18, 0, 0, 0));
    const fimBase = treino
      ? new Date(treino.data_hora_fim)
      : new Date(inicioBase.getTime() + 60 * 60_000);
    setInicio(toLocalInput(inicioBase));
    setFim(toLocalInput(fimBase));
    setTreinadorId(treino?.treinador_id ?? "");
    setAlunoId(treino?.aluno_id ?? "");
    setTurmaId(treino?.turma_id ?? "");
    setLocal(treino?.campo_local ?? "");
    setEstado(treino?.estado ?? "Agendado");
    setTipo(treino?.tipo ?? "Individual");
    setEstadoPagamento(treino?.estado_pagamento ?? "A aguardar pagamento");
    setFatura(treino?.fatura ?? "Sem fatura");
    setNif(treino?.nif ?? "");
    setNotas(treino?.notas ?? "");
    setRepeticao("nenhuma");
    setOcorrencias("4");
  }, [open, treino, dataInicial]);

  const guardar = useMutation({
    mutationFn: async () => {
      const payload = {
        aluno_id: tipo === "Grupo" ? null : alunoId || null,
        campo_local: local || null,
        data_hora_fim: new Date(fim).toISOString(),
        data_hora_inicio: new Date(inicio).toISOString(),
        estado,
        estado_pagamento:
          tipo === "Individual" && estado === "Concluído"
            ? estadoPagamento
            : "A aguardar pagamento",
        fatura:
          tipo === "Individual" &&
          estado === "Concluído" &&
          estadoPagamento === "Pago"
            ? fatura
            : null,
        nif:
          tipo === "Individual" &&
          estado === "Concluído" &&
          estadoPagamento === "Pago" &&
          fatura === "Com fatura"
            ? nif || null
            : null,
        notas: notas || null,
        tipo,
        treinador_id: treinadorId || null,
        turma_id: tipo === "Grupo" ? turmaId || null : null,
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
            data_hora_fim: f.toISOString(),
            data_hora_inicio: ini.toISOString(),
            serie_id: serieId,
          };
        });
        const { error } = await supabase
          .from("treinos")
          .insert(registos as never);
        if (error) {
          throw new Error(error.message);
        }
        return total;
      }

      const res = treino
        ? await supabase
            .from("treinos")
            .update(payload as never)
            .eq("id", treino.id)
        : await supabase.from("treinos").insert(payload as never);
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
          ? "Treino atualizado"
          : total > 1
            ? `${total} treinos marcados`
            : "Treino marcado"
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
        .from("treinos")
        .delete()
        .eq("id", treino.id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["treinos"] });
      toast.success("Treino eliminado");
      onOpenChange(false);
    },
  });

  const apagarSerie = useMutation({
    mutationFn: async (modo: "seguintes" | "toda") => {
      if (!treino) {
        return 0;
      }
      const ids = await encontrarSerie(treino, modo);
      if (ids.length === 0) {
        return 0;
      }
      const { error } = await supabase.from("treinos").delete().in("id", ids);
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

  async function confirmarSerie(modo: "seguintes" | "toda") {
    if (!treino) {
      return;
    }
    try {
      const n = (await encontrarSerie(treino, modo)).length;
      const msg =
        modo === "seguintes"
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
          <DialogTitle className="font-display text-2xl">
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
            <Label>Treinador</Label>
            <Select onValueChange={setTreinadorId} value={treinadorId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar treinador" />
              </SelectTrigger>
              <SelectContent>
                {treinadores.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {tipo === "Grupo" ? (
            <div className="space-y-2">
              <Label>Turma</Label>
              <Select onValueChange={setTurmaId} value={turmaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar turma" />
                </SelectTrigger>
                <SelectContent>
                  {(turmas.data ?? [])
                    .filter((t) => t.ativo || t.id === turmaId)
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {turmaId && (
                <p className="text-muted-foreground text-xs">
                  Atletas:{" "}
                  {alunos
                    .filter((a) =>
                      a.turma_ids?.length
                        ? a.turma_ids.includes(turmaId)
                        : a.turma_id === turmaId
                    )
                    .map((a) => a.nome)
                    .join(", ") || "ainda sem atletas nesta turma"}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Aluno</Label>
              <Select onValueChange={setAlunoId} value={alunoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar aluno" />
                </SelectTrigger>
                <SelectContent>
                  {alunos.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="local">Campo / Local</Label>
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
                  {ESTADOS.map((e) => (
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
                {TIPOS_TREINO.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t === "Individual"
                      ? "Treino individual"
                      : "Treino de grupo"}
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
          {tipo === "Individual" && estado === "Concluído" && (
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
                    {ESTADOS_PAGAMENTO.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {estadoPagamento === "Pago" && (
                <div className="space-y-2">
                  <Label>Fatura</Label>
                  <Select onValueChange={setFatura} value={fatura}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_FATURA.map((e) => (
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
            estado === "Concluído" &&
            estadoPagamento === "Pago" &&
            fatura === "Com fatura" && (
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
        {treino && treino.tipo === "Individual" && (
          <div className="border-border/60 flex flex-wrap items-center gap-2 rounded-md border p-3">
            <span className="text-muted-foreground text-xs">
              Treino recorrente?
            </span>
            <Button
              className="text-destructive"
              disabled={apagarSerie.isPending}
              onClick={() => confirmarSerie("seguintes")}
              size="sm"
              type="button"
              variant="outline"
            >
              Eliminar este e seguintes
            </Button>
            <Button
              className="text-destructive"
              disabled={apagarSerie.isPending}
              onClick={() => confirmarSerie("toda")}
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
