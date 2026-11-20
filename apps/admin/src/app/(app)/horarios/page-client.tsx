"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
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
import { Copy, Plus, Trash2 } from "@repo/ui/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/data/client";
import {
  DAY_NAMES,
  formatTimeShort,
  listAvailability,
  listCoaches,
} from "@/lib/gk";

function Horarios() {
  const qc = useQueryClient();
  const { data: treinadores } = useQuery({
    queryFn: listCoaches,
    queryKey: ["treinadores"],
  });
  const { data: disp } = useQuery({
    queryFn: listAvailability,
    queryKey: ["disponibilidades"],
  });

  const [filtro, setFiltro] = useState("todos");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    coach_id: "",
    day_of_week: "1",
    end_time: "19:00",
    notes: "",
    start_time: "18:00",
  });

  const nomes = useMemo(
    () => Object.fromEntries((treinadores ?? []).map((t) => [t.id, t.name])),
    [treinadores]
  );

  const lista = (disp ?? []).filter(
    (d) => filtro === "todos" || d.coach_id === filtro
  );

  const guardar = useMutation({
    mutationFn: async () => {
      if (!form.coach_id) {
        throw new Error("Escolhe o treinador.");
      }
      if (form.end_time <= form.start_time) {
        throw new Error("A hora de fim tem de ser depois do início.");
      }
      const { error } = await supabase.from("availability").insert({
        coach_id: form.coach_id,
        day_of_week: Number(form.day_of_week),
        end_time: form.end_time,
        notes: form.notes || null,
        start_time: form.start_time,
      } as never);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Availability adicionada.");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["disponibilidades"] });
    },
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("availability")
        .delete()
        .eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Availability removida.");
      qc.invalidateQueries({ queryKey: ["disponibilidades"] });
    },
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
          <h1 className="text-3xl">Horários Disponíveis</h1>
          <p className="text-muted-foreground text-sm">
            Availability semanal declarada por cada treinador.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={copiarLink} variant="outline">
            <Copy className="size-4" /> Link para treinadores
          </Button>
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Adicionar
          </Button>
        </div>
      </div>

      <div className="w-full max-w-xs">
        <Select onValueChange={setFiltro} value={filtro}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os treinadores</SelectItem>
            {(treinadores ?? []).map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {DAY_NAMES.map((dia, idx) => {
          const doDia = lista.filter((d) => d.day_of_week === idx);
          return (
            <Card key={dia}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl tracking-wide">{dia}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {doDia.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    Sem disponibilidade.
                  </p>
                )}
                {doDia.map((d) => (
                  <div
                    className="border-border flex items-start justify-between gap-2 rounded-md border p-2"
                    key={d.id}
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {formatTimeShort(d.start_time)} –{" "}
                        {formatTimeShort(d.end_time)}
                      </p>
                      <Badge className="mt-1" variant="secondary">
                        {nomes[d.coach_id] ?? "—"}
                      </Badge>
                      {d.notes && (
                        <p className="text-muted-foreground mt-1 text-xs">
                          {d.notes}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => {
                        if (window.confirm("Remover esta disponibilidade?")) {
                          remover.mutate(d.id);
                        }
                      }}
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
      </div>

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova disponibilidade</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Coach</Label>
              <Select
                onValueChange={(v) => setForm({ ...form, coach_id: v })}
                value={form.coach_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolher treinador" />
                </SelectTrigger>
                <SelectContent>
                  {(treinadores ?? []).map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Dia da semana</Label>
              <Select
                onValueChange={(v) => setForm({ ...form, day_of_week: v })}
                value={form.day_of_week}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAY_NAMES.map((d, i) => (
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
                  onChange={(e) =>
                    setForm({ ...form, start_time: e.target.value })
                  }
                  type="time"
                  value={form.start_time}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Fim</Label>
                <Input
                  onChange={(e) =>
                    setForm({ ...form, end_time: e.target.value })
                  }
                  type="time"
                  value={form.end_time}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notas</Label>
              <Textarea
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Ex.: apenas campo sintético"
                value={form.notes}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={guardar.isPending}
              onClick={() => guardar.mutate()}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Horarios;
