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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { Textarea } from "@repo/ui/components/textarea";
import { IdCard, Pencil, Plus, Trash2 } from "@repo/ui/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { type ChangeEvent, useMemo, useState } from "react";
import { supabase } from "@/integrations/data/client";
import {
  ATHLETE_TYPES,
  ENROLLMENT_TYPES,
  formatMonthYear,
  listGroups,
  listStudents,
  listTrainings,
  type Student,
} from "@/lib/gk";

function Alunos() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryFn: listStudents, queryKey: ["alunos"] });
  const treinos = useQuery({ queryFn: listTrainings, queryKey: ["treinos"] });
  const turmas = useQuery({ queryFn: listGroups, queryKey: ["turmas"] });
  const alunosGrupo = useMemo(
    () =>
      new Set(
        (treinos.data ?? [])
          .filter((t) => t.type === "Group" && t.student_id)
          .map((t) => t.student_id as string)
      ),
    [treinos.data]
  );
  const ehGrupo = (a: Student) =>
    a.athlete_type === "Group" || alunosGrupo.has(a.id);
  const grupo = useMemo(
    () => (data ?? []).filter((a) => ehGrupo(a)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, alunosGrupo]
  );
  const individuais = useMemo(
    () => (data ?? []).filter((a) => !ehGrupo(a)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, alunosGrupo]
  );
  const [open, setOpen] = useState(false);
  const [atual, setAtual] = useState<Student | null>(null);
  const [form, setForm] = useState({
    athlete_type: "Individual",
    enroll_date: "",
    enrollment_type: "",
    group_ids: [] as string[],
    level: "",
    name: "",
    parent_contact: "",
    technical_notes: "",
  });

  function abrirNovo() {
    abrir();
  }

  function handleNomeChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, name: e.target.value });
  }

  function handleLevelChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, level: e.target.value });
  }

  function handleParentChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, parent_contact: e.target.value });
  }

  function handleAthleteTypeChange(v: string) {
    setForm({ ...form, athlete_type: v });
  }

  function handleEnrollmentChange(v: string) {
    setForm({ ...form, enrollment_type: v });
  }

  function handleEnrollDateChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, enroll_date: e.target.value });
  }

  function handleNotesChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setForm({ ...form, technical_notes: e.target.value });
  }

  function handleGroupToggle(e: ChangeEvent<HTMLInputElement>) {
    const tId = e.currentTarget.dataset.tid;
    if (!tId) {
      return;
    }
    setForm({
      ...form,
      group_ids: e.target.checked
        ? [...form.group_ids, tId]
        : form.group_ids.filter((x) => x !== tId),
    });
  }

  function guardarSubmit() {
    guardar.mutate();
  }

  function abrir(a?: Student) {
    setAtual(a ?? null);
    setForm({
      athlete_type: a?.athlete_type ?? "Individual",
      enroll_date: a?.enroll_date ?? "",
      enrollment_type: a?.enrollment_type ?? "",
      group_ids: resolveGroupIds(a),
      level: a?.level ?? "",
      name: a?.name ?? "",
      parent_contact: a?.parent_contact ?? "",
      technical_notes: a?.technical_notes ?? "",
    });
    setOpen(true);
  }

  function resolveGroupIds(a: Student | undefined): string[] {
    if (a?.group_ids?.length) {
      return a.group_ids;
    }
    return a?.group_id ? [a.group_id] : [];
  }

  const guardar = useMutation({
    mutationFn: async () => {
      const payload = {
        athlete_type: form.athlete_type,
        enroll_date: form.enroll_date || null,
        enrollment_type:
          form.athlete_type === "Group" ? form.enrollment_type || null : null,
        group_id:
          form.athlete_type === "Group" ? (form.group_ids[0] ?? null) : null,
        group_ids: form.athlete_type === "Group" ? form.group_ids : [],
        level: form.level || null,
        name: form.name,
        parent_contact: form.parent_contact || null,
        technical_notes: form.technical_notes || null,
      };
      const res = atual
        ? await supabase
            .from("students")
            .update(payload as never)
            .eq("id", atual.id)
        : await supabase.from("students").insert(payload as never);
      if (res.error) {
        throw new Error(res.error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alunos"] });
      toast.success("Student guardado");
      setOpen(false);
    },
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alunos"] });
      toast.success("Student removido");
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl leading-none">Alunos</h1>
          <p className="text-muted-foreground">
            Guarda-redes inscritos na escola
          </p>
        </div>
        <Button onClick={abrirNovo}>
          <Plus className="size-4" /> Novo aluno
        </Button>
      </header>

      <Tabs defaultValue="individual">
        <TabsList>
          <TabsTrigger value="individual">
            Treinos individuais ({individuais.length})
          </TabsTrigger>
          <TabsTrigger value="grupo">
            Treinos de grupo ({grupo.length})
          </TabsTrigger>
        </TabsList>

        {(["individual", "grupo"] as const).map((sep) => {
          const lista = sep === "individual" ? individuais : grupo;
          return (
            <TabsContent className="mt-4" key={sep} value={sep}>
              <div className="grid gap-3 md:grid-cols-2">
                {lista.map((a) => {
                  const abrirAluno = () => abrir(a);
                  const apagarAluno = () => remover.mutate(a.id);
                  return (
                    <Card key={a.id}>
                      <CardContent className="space-y-2 pt-6">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{a.name}</p>
                            <p className="text-muted-foreground text-sm">
                              {a.parent_contact ?? "—"}
                            </p>
                            {!!a.enroll_date && (
                              <p className="text-muted-foreground text-xs">
                                Connosco desde {formatMonthYear(a.enroll_date)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {!!a.level && (
                              <Badge variant="secondary">{a.level}</Badge>
                            )}
                            {!!a.enrollment_type && (
                              <Badge className="whitespace-nowrap">
                                {a.enrollment_type}
                              </Badge>
                            )}
                            {resolveGroupIds(a).map((tid) => (
                              <Badge
                                className="whitespace-nowrap"
                                key={tid}
                                variant="outline"
                              >
                                {turmas.data?.find((t) => t.id === tid)?.name ??
                                  "Group"}
                              </Badge>
                            ))}
                            <Button asChild size="sm" variant="secondary">
                              <Link href={`/perfil-aluno/${a.id}`}>
                                <IdCard className="size-4" /> Perfil
                              </Link>
                            </Button>
                            <Button
                              onClick={abrirAluno}
                              size="icon"
                              variant="outline"
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              onClick={apagarAluno}
                              size="icon"
                              variant="destructive"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                        {!!a.technical_notes && (
                          <p className="border-border text-muted-foreground border-l-4 pl-3 text-sm">
                            {a.technical_notes}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {lista.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    {sep === "individual"
                      ? "Ainda não existem alunos de treinos individuais."
                      : "Ainda não existem alunos de treinos de grupo."}
                  </p>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {atual ? "Editar aluno" : "Novo aluno"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" onChange={handleNomeChange} value={form.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Escalão</Label>
              <Input
                id="level"
                onChange={handleLevelChange}
                placeholder="Sub-15"
                value={form.level}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ee">Contacto do encarregado de educação</Label>
              <Input
                id="ee"
                onChange={handleParentChange}
                value={form.parent_contact}
              />
            </div>
            <div className="space-y-2">
              {/* biome-ignore lint/a11y/noLabelWithoutControl: Radix Select trigger has implicit label association */}
              <Label>Tipo de atleta</Label>
              <Select
                onValueChange={handleAthleteTypeChange}
                value={form.athlete_type}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ATHLETE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t === "Group"
                        ? "Treinos de grupo"
                        : "Treinos individuais"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div
              className={form.athlete_type === "Group" ? "space-y-2" : "hidden"}
            >
              {/* biome-ignore lint/a11y/noLabelWithoutControl: Radix Select trigger has implicit label association */}
              <Label>Modalidade de inscrição</Label>
              <Select
                onValueChange={handleEnrollmentChange}
                value={form.enrollment_type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar modalidade" />
                </SelectTrigger>
                <SelectContent>
                  {ENROLLMENT_TYPES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div
              className={form.athlete_type === "Group" ? "space-y-2" : "hidden"}
            >
              {/* biome-ignore lint/a11y/noLabelWithoutControl: group of checkbox inputs */}
              <Label>Turmas</Label>
              <div className="space-y-2 rounded-md border p-3">
                {(turmas.data ?? []).length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    Ainda não há turmas criadas.
                  </p>
                )}
                {(turmas.data ?? []).map((t) => (
                  <label
                    className="flex cursor-pointer items-center gap-2 text-sm"
                    key={t.id}
                  >
                    <input
                      checked={form.group_ids.includes(t.id)}
                      className="accent-primary size-4"
                      data-tid={t.id}
                      onChange={handleGroupToggle}
                      type="checkbox"
                    />
                    {t.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inscricao">Connosco desde</Label>
              <Input
                id="inscricao"
                onChange={handleEnrollDateChange}
                type="date"
                value={form.enroll_date}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notas">Notas técnicas</Label>
              <Textarea
                id="notas"
                onChange={handleNotesChange}
                value={form.technical_notes}
              />
            </div>
          </div>
          <DialogFooter>
            <Button disabled={guardar.isPending} onClick={guardarSubmit}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Alunos;
