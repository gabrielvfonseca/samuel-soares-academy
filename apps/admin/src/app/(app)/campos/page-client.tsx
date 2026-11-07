"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
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
import { Check, MapPin, Plus, Trash2 } from "@repo/ui/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DIAS_SEMANA,
  formatHoraSimples,
  listCampos,
  listDisponibilidadesCampos,
} from "@/lib/gk";

function Campos() {
  const qc = useQueryClient();
  const campos = useQuery({ queryFn: listCampos, queryKey: ["campos"] });
  const disp = useQuery({
    queryFn: listDisponibilidadesCampos,
    queryKey: ["disponibilidades-campos"],
  });

  const [novoCampo, setNovoCampo] = useState({ morada: "", nome: "" });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    campo_id: "",
    dias: [1] as number[],
    hora_fim: "21:00",
    hora_inicio: "18:00",
    notas: "",
  });

  const nomes = useMemo(
    () => Object.fromEntries((campos.data ?? []).map((c) => [c.id, c.nome])),
    [campos.data]
  );

  const criarCampo = useMutation({
    mutationFn: async () => {
      if (!novoCampo.nome.trim()) {
        throw new Error("Indica o nome do campo.");
      }
      const { error } = await supabase.from("campos").insert({
        morada: novoCampo.morada || null,
        nome: novoCampo.nome.trim(),
      } as never);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      setNovoCampo({ morada: "", nome: "" });
      qc.invalidateQueries({ queryKey: ["campos"] });
      toast.success("Campo adicionado.");
    },
  });

  const removerCampo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("campos").delete().eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campos"] });
      qc.invalidateQueries({ queryKey: ["disponibilidades-campos"] });
      toast.success("Campo removido.");
    },
  });

  const guardarDisp = useMutation({
    mutationFn: async () => {
      if (!form.campo_id) {
        throw new Error("Escolhe o campo.");
      }
      if (form.dias.length === 0) {
        throw new Error("Escolhe pelo menos um dia da semana.");
      }
      if (form.hora_fim <= form.hora_inicio) {
        throw new Error("A hora de fim tem de ser depois do início.");
      }
      const { error } = await supabase.from("disponibilidades_campos").insert(
        form.dias.map((dia) => ({
          campo_id: form.campo_id,
          dia_semana: dia,
          hora_fim: form.hora_fim,
          hora_inicio: form.hora_inicio,
          notas: form.notas || null,
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
      toast.success("Disponibilidade do campo adicionada.");
    },
  });

  const removerDisp = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("disponibilidades_campos")
        .delete()
        .eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["disponibilidades-campos"] });
      toast.success("Disponibilidade removida.");
    },
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
        <Button
          disabled={(campos.data ?? []).length === 0}
          onClick={() => setOpen(true)}
        >
          <Plus className="size-4" /> Disponibilidade do campo
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">Novo campo</CardTitle>
          <CardDescription>
            Adiciona um campo ou pavilhão onde damos treinos.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="nomecampo">Nome</Label>
            <Input
              id="nomecampo"
              onChange={(e) =>
                setNovoCampo({ ...novoCampo, nome: e.target.value })
              }
              placeholder="Campo sintético 1"
              value={novoCampo.nome}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="moradacampo">Morada</Label>
            <Input
              id="moradacampo"
              onChange={(e) =>
                setNovoCampo({ ...novoCampo, morada: e.target.value })
              }
              value={novoCampo.morada}
            />
          </div>
          <Button
            disabled={criarCampo.isPending}
            onClick={() => criarCampo.mutate()}
          >
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
                  <CardTitle className="font-display flex items-center gap-2 text-2xl">
                    <MapPin className="size-5" /> {c.nome}
                  </CardTitle>
                  <CardDescription>
                    {c.morada ?? "Sem morada indicada"}
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    if (window.confirm(`Remover o campo ${c.nome}?`)) {
                      removerCampo.mutate(c.id);
                    }
                  }}
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
                        {DIAS_SEMANA[d.dia_semana]}
                      </Badge>
                      {formatHoraSimples(d.hora_inicio)} –{" "}
                      {formatHoraSimples(d.hora_fim)}
                    </div>
                    <Button
                      onClick={() => removerDisp.mutate(d.id)}
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
            <DialogTitle className="font-display text-2xl">
              Disponibilidade do campo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Campo</Label>
              <Select
                onValueChange={(v) => setForm({ ...form, campo_id: v })}
                value={form.campo_id}
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
                      onClick={() =>
                        setForm({
                          ...form,
                          dias: ativo
                            ? form.dias.filter((x) => x !== i)
                            : [...form.dias, i].sort((a, b) => a - b),
                        })
                      }
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
                <Label>Início</Label>
                <Input
                  onChange={(e) =>
                    setForm({ ...form, hora_inicio: e.target.value })
                  }
                  type="time"
                  value={form.hora_inicio}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Fim</Label>
                <Input
                  onChange={(e) =>
                    setForm({ ...form, hora_fim: e.target.value })
                  }
                  type="time"
                  value={form.hora_fim}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notas</Label>
              <Textarea
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                placeholder="Ex.: campo com iluminação"
                value={form.notas}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={guardarDisp.isPending}
              onClick={() => guardarDisp.mutate()}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Campos;
