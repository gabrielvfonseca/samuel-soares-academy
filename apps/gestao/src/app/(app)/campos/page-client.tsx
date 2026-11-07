"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Check, MapPin, Plus, Trash2 } from "@repo/ui/icons";
import { toast } from "@repo/ui/components/sonner";

import { supabase } from "@/integrations/supabase/client";
import { DIAS_SEMANA, formatHoraSimples, listCampos, listDisponibilidadesCampos } from "@/lib/gk";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
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

function Campos() {
  const qc = useQueryClient();
  const campos = useQuery({ queryKey: ["campos"], queryFn: listCampos });
  const disp = useQuery({
    queryKey: ["disponibilidades-campos"],
    queryFn: listDisponibilidadesCampos,
  });

  const [novoCampo, setNovoCampo] = useState({ nome: "", morada: "" });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    campo_id: "",
    dias: [1] as number[],
    hora_inicio: "18:00",
    hora_fim: "21:00",
    notas: "",
  });

  const nomes = useMemo(
    () => Object.fromEntries((campos.data ?? []).map((c) => [c.id, c.nome])),
    [campos.data],
  );

  const criarCampo = useMutation({
    mutationFn: async () => {
      if (!novoCampo.nome.trim()) throw new Error("Indica o nome do campo.");
      const { error } = await supabase
        .from("campos")
        .insert({ nome: novoCampo.nome.trim(), morada: novoCampo.morada || null } as never);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      setNovoCampo({ nome: "", morada: "" });
      qc.invalidateQueries({ queryKey: ["campos"] });
      toast.success("Campo adicionado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removerCampo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("campos").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campos"] });
      qc.invalidateQueries({ queryKey: ["disponibilidades-campos"] });
      toast.success("Campo removido.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const guardarDisp = useMutation({
    mutationFn: async () => {
      if (!form.campo_id) throw new Error("Escolhe o campo.");
      if (form.dias.length === 0) throw new Error("Escolhe pelo menos um dia da semana.");
      if (form.hora_fim <= form.hora_inicio)
        throw new Error("A hora de fim tem de ser depois do início.");
      const { error } = await supabase.from("disponibilidades_campos").insert(
        form.dias.map((dia) => ({
          campo_id: form.campo_id,
          dia_semana: dia,
          hora_inicio: form.hora_inicio,
          hora_fim: form.hora_fim,
          notas: form.notas || null,
        })) as never,
      );
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["disponibilidades-campos"] });
      toast.success("Disponibilidade do campo adicionada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removerDisp = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("disponibilidades_campos").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["disponibilidades-campos"] });
      toast.success("Disponibilidade removida.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl leading-none">Campos</h1>
          <p className="text-muted-foreground">
            Locais de treino e horas em que cada campo está livre.
          </p>
        </div>
        <Button onClick={() => setOpen(true)} disabled={(campos.data ?? []).length === 0}>
          <Plus className="size-4" /> Disponibilidade do campo
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">Novo campo</CardTitle>
          <CardDescription>Adiciona um campo ou pavilhão onde damos treinos.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="nomecampo">Nome</Label>
            <Input
              id="nomecampo"
              value={novoCampo.nome}
              placeholder="Campo sintético 1"
              onChange={(e) => setNovoCampo({ ...novoCampo, nome: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="moradacampo">Morada</Label>
            <Input
              id="moradacampo"
              value={novoCampo.morada}
              onChange={(e) => setNovoCampo({ ...novoCampo, morada: e.target.value })}
            />
          </div>
          <Button onClick={() => criarCampo.mutate()} disabled={criarCampo.isPending}>
            <Plus className="size-4" /> Adicionar
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {(campos.data ?? []).map((c) => {
          const horas = (disp.data ?? []).filter((d) => d.campo_id === c.id);
          return (
            <Card key={c.id}>
              <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2 font-display text-2xl">
                    <MapPin className="size-5" /> {c.nome}
                  </CardTitle>
                  <CardDescription>{c.morada ?? "Sem morada indicada"}</CardDescription>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => {
                    if (window.confirm(`Remover o campo ${c.nome}?`)) removerCampo.mutate(c.id);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {horas.length === 0 && (
                  <p className="text-sm text-muted-foreground">Sem disponibilidade registada.</p>
                )}
                {horas.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary">{DIAS_SEMANA[d.dia_semana]}</Badge>
                      {formatHoraSimples(d.hora_inicio)} – {formatHoraSimples(d.hora_fim)}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removerDisp.mutate(d.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
        {(campos.data ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">Ainda não existem campos registados.</p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Disponibilidade do campo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Campo</Label>
              <Select
                value={form.campo_id}
                onValueChange={(v) => setForm({ ...form, campo_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolher campo" />
                </SelectTrigger>
                <SelectContent>
                  {(campos.data ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {nomes[c.id]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Dias da semana</Label>
              <div className="flex flex-wrap gap-2">
                {DIAS_SEMANA.map((d, i) => {
                  const ativo = form.dias.includes(i);
                  return (
                    <Button
                      key={d}
                      type="button"
                      variant={ativo ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setForm({
                          ...form,
                          dias: ativo
                            ? form.dias.filter((x) => x !== i)
                            : [...form.dias, i].sort((a, b) => a - b),
                        })
                      }
                    >
                      {ativo && <Check className="size-4" />}
                      {d}
                    </Button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                O horário escolhido é aplicado a todos os dias selecionados.
              </p>
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
                placeholder="Ex.: campo com iluminação"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => guardarDisp.mutate()} disabled={guardarDisp.isPending}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Campos;
