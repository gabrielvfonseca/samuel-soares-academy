"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Trash2, Copy } from "@repo/ui/icons";
import { toast } from "@repo/ui/components/sonner";

import { supabase } from "@/integrations/supabase/client";
import { DIAS_SEMANA, formatHoraSimples, listDisponibilidades, listTreinadores } from "@/lib/gk";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";

function Horarios() {
  const qc = useQueryClient();
  const { data: treinadores } = useQuery({ queryKey: ["treinadores"], queryFn: listTreinadores });
  const { data: disp } = useQuery({
    queryKey: ["disponibilidades"],
    queryFn: listDisponibilidades,
  });

  const [filtro, setFiltro] = useState("todos");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    treinador_id: "",
    dia_semana: "1",
    hora_inicio: "18:00",
    hora_fim: "19:00",
    notas: "",
  });

  const nomes = useMemo(
    () => Object.fromEntries((treinadores ?? []).map((t) => [t.id, t.nome])),
    [treinadores],
  );

  const lista = (disp ?? []).filter((d) => filtro === "todos" || d.treinador_id === filtro);

  const guardar = useMutation({
    mutationFn: async () => {
      if (!form.treinador_id) throw new Error("Escolhe o treinador.");
      if (form.hora_fim <= form.hora_inicio)
        throw new Error("A hora de fim tem de ser depois do início.");
      const { error } = await supabase.from("disponibilidades").insert({
        treinador_id: form.treinador_id,
        dia_semana: Number(form.dia_semana),
        hora_inicio: form.hora_inicio,
        hora_fim: form.hora_fim,
        notas: form.notas || null,
      } as never);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Disponibilidade adicionada.");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["disponibilidades"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("disponibilidades").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Disponibilidade removida.");
      qc.invalidateQueries({ queryKey: ["disponibilidades"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function copiarLink() {
    const url = `${window.location.origin}/disponibilidade`;
    await navigator.clipboard.writeText(url);
    toast.success("Link para treinadores copiado.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Horários Disponíveis</h1>
          <p className="text-sm text-muted-foreground">
            Disponibilidade semanal declarada por cada treinador.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copiarLink}>
            <Copy className="size-4" /> Link para treinadores
          </Button>
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Adicionar
          </Button>
        </div>
      </div>

      <div className="w-full max-w-xs">
        <Select value={filtro} onValueChange={setFiltro}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os treinadores</SelectItem>
            {(treinadores ?? []).map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {DIAS_SEMANA.map((dia, idx) => {
          const doDia = lista.filter((d) => d.dia_semana === idx);
          return (
            <Card key={dia}>
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-xl tracking-wide">{dia}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {doDia.length === 0 && (
                  <p className="text-sm text-muted-foreground">Sem disponibilidade.</p>
                )}
                {doDia.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-start justify-between gap-2 rounded-md border border-border p-2"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {formatHoraSimples(d.hora_inicio)} – {formatHoraSimples(d.hora_fim)}
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        {nomes[d.treinador_id] ?? "—"}
                      </Badge>
                      {d.notas && <p className="mt-1 text-xs text-muted-foreground">{d.notas}</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (window.confirm("Remover esta disponibilidade?")) remover.mutate(d.id);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova disponibilidade</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Treinador</Label>
              <Select
                value={form.treinador_id}
                onValueChange={(v) => setForm({ ...form, treinador_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolher treinador" />
                </SelectTrigger>
                <SelectContent>
                  {(treinadores ?? []).map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Dia da semana</Label>
              <Select
                value={form.dia_semana}
                onValueChange={(v) => setForm({ ...form, dia_semana: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIAS_SEMANA.map((d, i) => (
                    <SelectItem key={d} value={String(i)}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Início</Label>
                <Input
                  type="time"
                  value={form.hora_inicio}
                  onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Fim</Label>
                <Input
                  type="time"
                  value={form.hora_fim}
                  onChange={(e) => setForm({ ...form, hora_fim: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notas</Label>
              <Textarea
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                placeholder="Ex.: apenas campo sintético"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => guardar.mutate()} disabled={guardar.isPending}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Horarios;
