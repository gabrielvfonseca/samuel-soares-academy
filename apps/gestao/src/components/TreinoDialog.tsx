"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@repo/ui/components/sonner";

import { supabase } from "@/integrations/supabase/client";
import type { Aluno, Treinador, Treino } from "@/lib/gk";
import {
  ESTADOS,
  ESTADOS_FATURA,
  ESTADOS_PAGAMENTO,
  TIPOS_TREINO,
  encontrarSerie,
  listTurmas,
  toLocalInput,
} from "@/lib/gk";
import { useQuery } from "@tanstack/react-query";
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
import { Textarea } from "@repo/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treino?: Treino | null;
  treinadores: Treinador[];
  alunos: Aluno[];
  dataInicial?: Date;
};

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
  const turmas = useQuery({ queryKey: ["turmas"], queryFn: listTurmas });
  const [local, setLocal] = useState("");
  const [estado, setEstado] = useState<string>("Agendado");
  const [tipo, setTipo] = useState<string>("Individual");
  const [estadoPagamento, setEstadoPagamento] = useState<string>("A aguardar pagamento");
  const [fatura, setFatura] = useState<string>("Sem fatura");
  const [nif, setNif] = useState("");
  const [notas, setNotas] = useState("");
  const [repeticao, setRepeticao] = useState<string>("nenhuma");
  const [ocorrencias, setOcorrencias] = useState<string>("4");

  function alterarInicio(valor: string) {
    setInicio(valor);
    const d = new Date(valor);
    if (!Number.isNaN(d.getTime())) setFim(toLocalInput(new Date(d.getTime() + 60 * 60000)));
  }

  useEffect(() => {
    if (!open) return;
    const base = dataInicial ?? new Date();
    const inicioBase = treino
      ? new Date(treino.data_hora_inicio)
      : new Date(base.setHours(18, 0, 0, 0));
    const fimBase = treino
      ? new Date(treino.data_hora_fim)
      : new Date(inicioBase.getTime() + 60 * 60000);
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
        data_hora_inicio: new Date(inicio).toISOString(),
        data_hora_fim: new Date(fim).toISOString(),
        treinador_id: treinadorId || null,
        aluno_id: tipo === "Grupo" ? null : alunoId || null,
        turma_id: tipo === "Grupo" ? turmaId || null : null,
        campo_local: local || null,
        estado,
        tipo,
        estado_pagamento:
          tipo === "Individual" && estado === "Concluído"
            ? estadoPagamento
            : "A aguardar pagamento",
        fatura:
          tipo === "Individual" && estado === "Concluído" && estadoPagamento === "Pago"
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
      };
      const repetir = !treino && tipo === "Individual" && repeticao !== "nenhuma";
      const total = repetir ? Math.min(Math.max(Number(ocorrencias) || 1, 1), 52) : 1;
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
            serie_id: serieId,
            data_hora_inicio: ini.toISOString(),
            data_hora_fim: f.toISOString(),
          };
        });
        const { error } = await supabase.from("treinos").insert(registos as never);
        if (error) throw new Error(error.message);
        return total;
      }

      const res = treino
        ? await supabase
            .from("treinos")
            .update(payload as never)
            .eq("id", treino.id)
        : await supabase.from("treinos").insert(payload as never);
      if (res.error) throw new Error(res.error.message);
      return 1;
    },
    onSuccess: (total) => {
      qc.invalidateQueries({ queryKey: ["treinos"] });
      toast.success(
        treino ? "Treino atualizado" : total > 1 ? `${total} treinos marcados` : "Treino marcado",
      );
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const apagar = useMutation({
    mutationFn: async () => {
      if (!treino) return;
      const { error } = await supabase.from("treinos").delete().eq("id", treino.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["treinos"] });
      toast.success("Treino eliminado");
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const apagarSerie = useMutation({
    mutationFn: async (modo: "seguintes" | "toda") => {
      if (!treino) return 0;
      const ids = await encontrarSerie(treino, modo);
      if (ids.length === 0) return 0;
      const { error } = await supabase.from("treinos").delete().in("id", ids);
      if (error) throw new Error(error.message);
      return ids.length;
    },
    onSuccess: (n) => {
      qc.invalidateQueries({ queryKey: ["treinos"] });
      toast.success(`${n} treino${n === 1 ? "" : "s"} eliminado${n === 1 ? "" : "s"}`);
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function confirmarSerie(modo: "seguintes" | "toda") {
    if (!treino) return;
    try {
      const n = (await encontrarSerie(treino, modo)).length;
      const msg =
        modo === "seguintes"
          ? `Eliminar este treino e os ${n - 1} seguintes da mesma série?`
          : `Eliminar toda a série (${n} treinos)? Os treinos já concluídos são mantidos.`;
      if (window.confirm(msg)) apagarSerie.mutate(modo);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                type="datetime-local"
                value={inicio}
                onChange={(e) => alterarInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fim">Fim</Label>
              <Input
                id="fim"
                type="datetime-local"
                value={fim}
                onChange={(e) => setFim(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Treinador</Label>
            <Select value={treinadorId} onValueChange={setTreinadorId}>
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
              <Select value={turmaId} onValueChange={setTurmaId}>
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
                <p className="text-xs text-muted-foreground">
                  Atletas:{" "}
                  {alunos
                    .filter((a) =>
                      a.turma_ids?.length ? a.turma_ids.includes(turmaId) : a.turma_id === turmaId,
                    )
                    .map((a) => a.nome)
                    .join(", ") || "ainda sem atletas nesta turma"}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Aluno</Label>
              <Select value={alunoId} onValueChange={setAlunoId}>
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
              <Input id="local" value={local} onChange={(e) => setLocal(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={estado} onValueChange={setEstado}>
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
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_TREINO.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t === "Individual" ? "Treino individual" : "Treino de grupo"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!treino && tipo === "Individual" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Repetição</Label>
                <Select value={repeticao} onValueChange={setRepeticao}>
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
                    type="number"
                    min={1}
                    max={52}
                    value={ocorrencias}
                    onChange={(e) => setOcorrencias(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Inclui o primeiro treino, no mesmo dia da semana e à mesma hora.
                  </p>
                </div>
              )}
            </div>
          )}
          {tipo === "Individual" && estado === "Concluído" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Pagamento</Label>
                <Select value={estadoPagamento} onValueChange={setEstadoPagamento}>
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
                  <Select value={fatura} onValueChange={setFatura}>
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
                  placeholder="Ex.: 123456789"
                  value={nif}
                  onChange={(e) => setNif(e.target.value)}
                />
              </div>
            )}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea id="notas" value={notas} onChange={(e) => setNotas(e.target.value)} />
          </div>
        </div>
        {treino && treino.tipo === "Individual" && (
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 p-3">
            <span className="text-xs text-muted-foreground">Treino recorrente?</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-destructive"
              disabled={apagarSerie.isPending}
              onClick={() => confirmarSerie("seguintes")}
            >
              Eliminar este e seguintes
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-destructive"
              disabled={apagarSerie.isPending}
              onClick={() => confirmarSerie("toda")}
            >
              Eliminar toda a série
            </Button>
          </div>
        )}
        <DialogFooter className="gap-2 sm:justify-between">
          {treino ? (
            <Button variant="destructive" onClick={() => apagar.mutate()}>
              Eliminar
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={() => guardar.mutate()} disabled={guardar.isPending}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
