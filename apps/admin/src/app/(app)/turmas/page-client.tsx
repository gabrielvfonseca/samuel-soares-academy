"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
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
import { Pencil, Plus, Trash2 } from "@repo/ui/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/data/client";
import {
  DAY_NAMES,
  formatTimeShort,
  type Group,
  listCoaches,
  listFields,
  listGroups,
  listStudents,
} from "@/lib/gk";

const SEM_VALOR = "__nenhum__";

function Turmas() {
  const qc = useQueryClient();
  const turmas = useQuery({ queryFn: listGroups, queryKey: ["turmas"] });
  const treinadores = useQuery({
    queryFn: listCoaches,
    queryKey: ["treinadores"],
  });
  const campos = useQuery({ queryFn: listFields, queryKey: ["campos"] });
  const alunos = useQuery({ queryFn: listStudents, queryKey: ["alunos"] });

  const porTurma = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const a of alunos.data ?? []) {
      const ids = a.group_ids?.length
        ? a.group_ids
        : a.group_id
          ? [a.group_id]
          : [];
      for (const tid of ids) {
        map.set(tid, [...(map.get(tid) ?? []), a.name]);
      }
    }
    return map;
  }, [alunos.data]);

  const [open, setOpen] = useState(false);
  const [atual, setAtual] = useState<Group | null>(null);
  const [form, setForm] = useState({
    active: true,
    coach_id: "",
    day_of_week: "",
    end_time: "",
    field_id: "",
    level: "",
    name: "",
    notes: "",
    start_time: "",
  });

  function abrir(t?: Group) {
    setAtual(t ?? null);
    setForm({
      active: t?.active ?? true,
      coach_id: t?.coach_id ?? "",
      day_of_week:
        t?.day_of_week === undefined || t.day_of_week === null
          ? ""
          : String(t.day_of_week),
      end_time: t?.end_time ? t.end_time.slice(0, 5) : "",
      field_id: t?.field_id ?? "",
      level: t?.level ?? "",
      name: t?.name ?? "",
      notes: t?.notes ?? "",
      start_time: t?.start_time ? t.start_time.slice(0, 5) : "",
    });
    setOpen(true);
  }

  const guardar = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) {
        throw new Error("Indique o nome da turma");
      }
      if (
        form.start_time &&
        form.end_time &&
        form.end_time <= form.start_time
      ) {
        throw new Error("A hora de fim tem de ser depois da hora de início");
      }
      const payload = {
        active: form.active,
        coach_id: form.coach_id || null,
        day_of_week: form.day_of_week ? Number(form.day_of_week) : null,
        end_time: form.end_time || null,
        field_id: form.field_id || null,
        level: form.level || null,
        name: form.name.trim(),
        notes: form.notes || null,
        start_time: form.start_time || null,
      };
      const res = atual
        ? await supabase
            .from("groups")
            .update(payload as never)
            .eq("id", atual.id)
        : await supabase.from("groups").insert(payload as never);
      if (res.error) {
        throw new Error(res.error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["turmas"] });
      toast.success("Group guardada");
      setOpen(false);
    },
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("groups").delete().eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["turmas"] });
      qc.invalidateQueries({ queryKey: ["alunos"] });
      toast.success("Group removida");
    },
  });

  const nomeTreinador = (id: string | null) =>
    treinadores.data?.find((t) => t.id === id)?.name ?? "Sem treinador";
  const nomeCampo = (id: string | null) =>
    campos.data?.find((c) => c.id === id)?.name ?? "Sem campo";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl leading-none">Turmas</h1>
          <p className="text-muted-foreground">
            Grupos de atletas com treinador, campo e horário semanal
          </p>
        </div>
        <Button onClick={() => abrir()}>
          <Plus className="size-4" /> Nova turma
        </Button>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        {(turmas.data ?? []).map((t) => {
          const atletas = porTurma.get(t.id) ?? [];
          return (
            <Card key={t.id}>
              <CardContent className="space-y-2 pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {nomeTreinador(t.coach_id)} · {nomeCampo(t.field_id)}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {t.day_of_week === null
                        ? "Sem dia definido"
                        : DAY_NAMES[t.day_of_week]}
                      {t.start_time && t.end_time
                        ? ` · ${formatTimeShort(t.start_time)}–${formatTimeShort(t.end_time)}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.level && <Badge variant="secondary">{t.level}</Badge>}
                    {!t.active && <Badge variant="outline">Inativa</Badge>}
                    <Button
                      onClick={() => abrir(t)}
                      size="icon"
                      variant="outline"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        if (window.confirm("Remover esta turma?")) {
                          remover.mutate(t.id);
                        }
                      }}
                      size="icon"
                      variant="destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  {atletas.length > 0
                    ? `${atletas.length} atleta(s): ${atletas.join(", ")}`
                    : "Ainda sem atletas atribuídos"}
                </p>
                {t.notes && (
                  <p className="border-border text-muted-foreground border-l-4 pl-3 text-sm">
                    {t.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
        {(turmas.data ?? []).length === 0 && (
          <p className="text-muted-foreground text-sm">
            Ainda não existem turmas.
          </p>
        )}
      </div>

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {atual ? "Editar turma" : "Nova turma"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da turma</Label>
              <Input
                id="nome"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex.: Group Sub-15 Terças"
                value={form.name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Escalão</Label>
              <Input
                id="level"
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                placeholder="Sub-15"
                value={form.level}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Coach</Label>
                <Select
                  onValueChange={(v) =>
                    setForm({ ...form, coach_id: v === SEM_VALOR ? "" : v })
                  }
                  value={form.coach_id || SEM_VALOR}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SEM_VALOR}>Sem treinador</SelectItem>
                    {(treinadores.data ?? []).map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Field</Label>
                <Select
                  onValueChange={(v) =>
                    setForm({ ...form, field_id: v === SEM_VALOR ? "" : v })
                  }
                  value={form.field_id || SEM_VALOR}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SEM_VALOR}>Sem campo</SelectItem>
                    {(campos.data ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Dia</Label>
                <Select
                  onValueChange={(v) =>
                    setForm({ ...form, day_of_week: v === SEM_VALOR ? "" : v })
                  }
                  value={form.day_of_week || SEM_VALOR}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Dia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SEM_VALOR}>Sem dia</SelectItem>
                    {DAY_NAMES.map((d, i) => (
                      <SelectItem key={d} value={String(i)}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hi">Início</Label>
                <Input
                  id="hi"
                  onChange={(e) =>
                    setForm({ ...form, start_time: e.target.value })
                  }
                  type="time"
                  value={form.start_time}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hf">Fim</Label>
                <Input
                  id="hf"
                  onChange={(e) =>
                    setForm({ ...form, end_time: e.target.value })
                  }
                  type="time"
                  value={form.end_time}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                onValueChange={(v) =>
                  setForm({ ...form, active: v === "ativa" })
                }
                value={form.active ? "ativa" : "inativa"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="inativa">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
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

export default Turmas;
