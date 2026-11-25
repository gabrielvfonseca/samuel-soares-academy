"use client";

import { Badge } from "@ssa/ui/components/badge";
import { Button } from "@ssa/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ssa/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ssa/ui/components/dialog";
import { Input } from "@ssa/ui/components/input";
import { Label } from "@ssa/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ssa/ui/components/select";
import { toast } from "@ssa/ui/components/sonner";
import { Textarea } from "@ssa/ui/components/textarea";
import { Check, MapPin, Plus, Trash2 } from "@ssa/ui/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/data/client";
import {
  DAY_NAMES,
  formatTimeShort,
  listFieldAvailability,
  listFields,
} from "@/lib/gk";

function Campos() {
  const qc = useQueryClient();
  const campos = useQuery({ queryFn: listFields, queryKey: ["campos"] });
  const disp = useQuery({
    queryFn: listFieldAvailability,
    queryKey: ["disponibilidades-campos"],
  });

  const [novoCampo, setNovoCampo] = useState({ address: "", name: "" });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    dias: [1] as number[],
    end_time: "21:00",
    field_id: "",
    notes: "",
    start_time: "18:00",
  });

  const nomes = useMemo(
    () => Object.fromEntries((campos.data ?? []).map((c) => [c.id, c.name])),
    [campos.data]
  );

  const criarCampo = useMutation({
    mutationFn: async () => {
      if (!novoCampo.name.trim()) {
        throw new Error("Indica o nome do campo.");
      }
      const { error } = await supabase.from("fields").insert({
        address: novoCampo.address || null,
        name: novoCampo.name.trim(),
      } as never);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      setNovoCampo({ address: "", name: "" });
      qc.invalidateQueries({ queryKey: ["campos"] });
      toast.success("Field adicionado.");
    },
  });

  const removerCampo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fields").delete().eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campos"] });
      qc.invalidateQueries({ queryKey: ["disponibilidades-campos"] });
      toast.success("Field removido.");
    },
  });

  const guardarDisp = useMutation({
    mutationFn: async () => {
      if (!form.field_id) {
        throw new Error("Escolhe o campo.");
      }
      if (form.dias.length === 0) {
        throw new Error("Escolhe pelo menos um dia da semana.");
      }
      if (form.end_time <= form.start_time) {
        throw new Error("A hora de fim tem de ser depois do início.");
      }
      const { error } = await supabase.from("field_availability").insert(
        form.dias.map((dia) => ({
          day_of_week: dia,
          end_time: form.end_time,
          field_id: form.field_id,
          notes: form.notes || null,
          start_time: form.start_time,
        })) as never
      );
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["disponibilidades-campos"] });
      toast.success("Availability do campo adicionada.");
    },
  });

  const removerDisp = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("field_availability")
        .delete()
        .eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["disponibilidades-campos"] });
      toast.success("Availability removida.");
    },
  });

  function abrirDialog() {
    setOpen(true);
  }

  function handleNomeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNovoCampo({ ...novoCampo, name: e.target.value });
  }

  function handleMoradaChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNovoCampo({ ...novoCampo, address: e.target.value });
  }

  function adicionarCampo() {
    criarCampo.mutate();
  }

  function confirmarRemoverCampo(c: { id: string; name: string }) {
    // biome-ignore lint/suspicious/noAlert: user confirmation before destructive delete
    if (window.confirm(`Remover o campo ${c.name}?`)) {
      removerCampo.mutate(c.id);
    }
  }

  function removerDispItem(id: string) {
    removerDisp.mutate(id);
  }

  function handleFieldChange(v: string) {
    setForm({ ...form, field_id: v });
  }

  function toggleDay(i: number) {
    const ativo = form.dias.includes(i);
    setForm({
      ...form,
      dias: ativo
        ? form.dias.filter((x) => x !== i)
        : [...form.dias, i].sort((a, b) => a - b),
    });
  }

  function handleStartTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, start_time: e.target.value });
  }

  function handleEndTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, end_time: e.target.value });
  }

  function handleNotesChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setForm({ ...form, notes: e.target.value });
  }

  function guardar() {
    guardarDisp.mutate();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl leading-none">Campos</h1>
          <p className="text-muted-foreground">
            Locais de treino e horas em que cada campo está livre.
          </p>
        </div>
        <Button
          disabled={(campos.data ?? []).length === 0}
          onClick={abrirDialog}
        >
          <Plus className="size-4" /> Availability do campo
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Novo campo</CardTitle>
          <CardDescription>
            Adiciona um campo ou pavilhão onde damos treinos.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="nomecampo">Nome</Label>
            <Input
              id="nomecampo"
              onChange={handleNomeChange}
              placeholder="Field sintético 1"
              value={novoCampo.name}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="moradacampo">Morada</Label>
            <Input
              id="moradacampo"
              onChange={handleMoradaChange}
              value={novoCampo.address}
            />
          </div>
          <Button disabled={criarCampo.isPending} onClick={adicionarCampo}>
            <Plus className="size-4" /> Adicionar
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {(campos.data ?? []).map((c) => {
          const horas = (disp.data ?? []).filter((d) => d.field_id === c.id);
          return (
            <Card key={c.id}>
              <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <MapPin className="size-5" /> {c.name}
                  </CardTitle>
                  <CardDescription>
                    {c.address ?? "Sem morada indicada"}
                  </CardDescription>
                </div>
                <Button
                  onClick={() => confirmarRemoverCampo(c)}
                  size="icon"
                  variant="destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {horas.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    Sem disponibilidade registada.
                  </p>
                )}
                {horas.map((d) => (
                  <div
                    className="border-border flex items-center justify-between gap-2 rounded-md border px-3 py-2"
                    key={d.id}
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary">
                        {DAY_NAMES[d.day_of_week]}
                      </Badge>
                      {formatTimeShort(d.start_time)} –{" "}
                      {formatTimeShort(d.end_time)}
                    </div>
                    <Button
                      onClick={() => removerDispItem(d.id)}
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
        {(campos.data ?? []).length === 0 && (
          <p className="text-muted-foreground text-sm">
            Ainda não existem campos registados.
          </p>
        )}
      </div>

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Availability do campo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              {/* biome-ignore lint/a11y/noLabelWithoutControl: Radix Select trigger has implicit label association */}
              <Label>Field</Label>
              <Select onValueChange={handleFieldChange} value={form.field_id}>
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
              {/* biome-ignore lint/a11y/noLabelWithoutControl: group of day-toggle buttons */}
              <Label>Dias da semana</Label>
              <div className="flex flex-wrap gap-2">
                {DAY_NAMES.map((d, i) => {
                  const ativo = form.dias.includes(i);
                  return (
                    <Button
                      key={d}
                      onClick={() => toggleDay(i)}
                      size="sm"
                      type="button"
                      variant={ativo ? "default" : "outline"}
                    >
                      {ativo && <Check className="size-4" />}
                      {d}
                    </Button>
                  );
                })}
              </div>
              <p className="text-muted-foreground text-xs">
                O horário escolhido é aplicado a todos os dias selecionados.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                {/* biome-ignore lint/a11y/noLabelWithoutControl: paired with time input below */}
                <Label>Início</Label>
                <Input
                  onChange={handleStartTimeChange}
                  type="time"
                  value={form.start_time}
                />
              </div>
              <div className="space-y-1.5">
                {/* biome-ignore lint/a11y/noLabelWithoutControl: paired with time input below */}
                <Label>Fim</Label>
                <Input
                  onChange={handleEndTimeChange}
                  type="time"
                  value={form.end_time}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              {/* biome-ignore lint/a11y/noLabelWithoutControl: paired with textarea below */}
              <Label>Notas</Label>
              <Textarea
                onChange={handleNotesChange}
                placeholder="Ex.: campo com iluminação"
                value={form.notes}
              />
            </div>
          </div>
          <DialogFooter>
            <Button disabled={guardarDisp.isPending} onClick={guardar}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Campos;
