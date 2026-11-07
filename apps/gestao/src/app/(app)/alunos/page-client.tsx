"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, IdCard } from "@repo/ui/icons";
import { toast } from "@repo/ui/components/sonner";

import { supabase } from "@/integrations/supabase/client";
import {
  MODALIDADES_INSCRICAO,
  TIPOS_ATLETA,
  formatMesAno,
  listAlunos,
  listTreinos,
  listTurmas,
  type Aluno,
} from "@/lib/gk";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { Card, CardContent } from "@repo/ui/components/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";

function Alunos() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["alunos"], queryFn: listAlunos });
  const treinos = useQuery({ queryKey: ["treinos"], queryFn: listTreinos });
  const turmas = useQuery({ queryKey: ["turmas"], queryFn: listTurmas });
  const alunosGrupo = useMemo(
    () =>
      new Set(
        (treinos.data ?? [])
          .filter((t) => t.tipo === "Grupo" && t.aluno_id)
          .map((t) => t.aluno_id as string),
      ),
    [treinos.data],
  );
  const ehGrupo = (a: Aluno) => a.tipo_atleta === "Grupo" || alunosGrupo.has(a.id);
  const grupo = useMemo(() => (data ?? []).filter(ehGrupo), [data, alunosGrupo]);
  const individuais = useMemo(() => (data ?? []).filter((a) => !ehGrupo(a)), [data, alunosGrupo]);
  const [open, setOpen] = useState(false);
  const [atual, setAtual] = useState<Aluno | null>(null);
  const [form, setForm] = useState({
    nome: "",
    escalao: "",
    contacto_ee: "",
    notas_tecnicas: "",
    data_inscricao: "",
    modalidade_inscricao: "",
    tipo_atleta: "Individual",
    turma_ids: [] as string[],
  });

  function abrir(a?: Aluno) {
    setAtual(a ?? null);
    setForm({
      nome: a?.nome ?? "",
      escalao: a?.escalao ?? "",
      contacto_ee: a?.contacto_ee ?? "",
      notas_tecnicas: a?.notas_tecnicas ?? "",
      data_inscricao: a?.data_inscricao ?? "",
      modalidade_inscricao: a?.modalidade_inscricao ?? "",
      tipo_atleta: a?.tipo_atleta ?? "Individual",
      turma_ids: a?.turma_ids?.length ? a.turma_ids : a?.turma_id ? [a.turma_id] : [],
    });
    setOpen(true);
  }

  const guardar = useMutation({
    mutationFn: async () => {
      const payload = {
        nome: form.nome,
        escalao: form.escalao || null,
        contacto_ee: form.contacto_ee || null,
        notas_tecnicas: form.notas_tecnicas || null,
        data_inscricao: form.data_inscricao || null,
        modalidade_inscricao:
          form.tipo_atleta === "Grupo" ? form.modalidade_inscricao || null : null,
        tipo_atleta: form.tipo_atleta,
        turma_ids: form.tipo_atleta === "Grupo" ? form.turma_ids : [],
        turma_id: form.tipo_atleta === "Grupo" ? (form.turma_ids[0] ?? null) : null,
      };
      const res = atual
        ? await supabase
            .from("alunos")
            .update(payload as never)
            .eq("id", atual.id)
        : await supabase.from("alunos").insert(payload as never);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alunos"] });
      toast.success("Aluno guardado");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("alunos").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alunos"] });
      toast.success("Aluno removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl leading-none">Alunos</h1>
          <p className="text-muted-foreground">Guarda-redes inscritos na escola</p>
        </div>
        <Button onClick={() => abrir()}>
          <Plus className="size-4" /> Novo aluno
        </Button>
      </header>

      <Tabs defaultValue="individual">
        <TabsList>
          <TabsTrigger value="individual">Treinos individuais ({individuais.length})</TabsTrigger>
          <TabsTrigger value="grupo">Treinos de grupo ({grupo.length})</TabsTrigger>
        </TabsList>

        {(["individual", "grupo"] as const).map((sep) => {
          const lista = sep === "individual" ? individuais : grupo;
          return (
            <TabsContent key={sep} value={sep} className="mt-4">
              <div className="grid gap-3 md:grid-cols-2">
                {lista.map((a) => (
                  <Card key={a.id}>
                    <CardContent className="space-y-2 pt-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{a.nome}</p>
                          <p className="text-sm text-muted-foreground">{a.contacto_ee ?? "—"}</p>
                          {a.data_inscricao && (
                            <p className="text-xs text-muted-foreground">
                              Connosco desde {formatMesAno(a.data_inscricao)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {a.escalao && <Badge variant="secondary">{a.escalao}</Badge>}
                          {a.modalidade_inscricao && (
                            <Badge className="whitespace-nowrap">{a.modalidade_inscricao}</Badge>
                          )}
                          {(a.turma_ids?.length ? a.turma_ids : a.turma_id ? [a.turma_id] : []).map(
                            (tid) => (
                              <Badge key={tid} variant="outline" className="whitespace-nowrap">
                                {turmas.data?.find((t) => t.id === tid)?.nome ?? "Turma"}
                              </Badge>
                            ),
                          )}
                          <Button variant="secondary" size="sm" asChild>
                            <Link href={`/perfil-aluno/${a.id}`}>
                              <IdCard className="size-4" /> Perfil
                            </Link>
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => abrir(a)}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => remover.mutate(a.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                      {a.notas_tecnicas && (
                        <p className="pitch-line pl-3 text-sm text-muted-foreground">
                          {a.notas_tecnicas}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {lista.length === 0 && (
                  <p className="text-sm text-muted-foreground">
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {atual ? "Editar aluno" : "Novo aluno"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="escalao">Escalão</Label>
              <Input
                id="escalao"
                placeholder="Sub-15"
                value={form.escalao}
                onChange={(e) => setForm({ ...form, escalao: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ee">Contacto do encarregado de educação</Label>
              <Input
                id="ee"
                value={form.contacto_ee}
                onChange={(e) => setForm({ ...form, contacto_ee: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de atleta</Label>
              <Select
                value={form.tipo_atleta}
                onValueChange={(v) => setForm({ ...form, tipo_atleta: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_ATLETA.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t === "Grupo" ? "Treinos de grupo" : "Treinos individuais"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className={form.tipo_atleta === "Grupo" ? "space-y-2" : "hidden"}>
              <Label>Modalidade de inscrição</Label>
              <Select
                value={form.modalidade_inscricao}
                onValueChange={(v) => setForm({ ...form, modalidade_inscricao: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar modalidade" />
                </SelectTrigger>
                <SelectContent>
                  {MODALIDADES_INSCRICAO.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className={form.tipo_atleta === "Grupo" ? "space-y-2" : "hidden"}>
              <Label>Turmas</Label>
              <div className="space-y-2 rounded-md border p-3">
                {(turmas.data ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">Ainda não há turmas criadas.</p>
                )}
                {(turmas.data ?? []).map((t) => (
                  <label key={t.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      className="size-4 accent-primary"
                      checked={form.turma_ids.includes(t.id)}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          turma_ids: e.target.checked
                            ? [...form.turma_ids, t.id]
                            : form.turma_ids.filter((x) => x !== t.id),
                        })
                      }
                    />
                    {t.nome}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inscricao">Connosco desde</Label>
              <Input
                id="inscricao"
                type="date"
                value={form.data_inscricao}
                onChange={(e) => setForm({ ...form, data_inscricao: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notas">Notas técnicas</Label>
              <Textarea
                id="notas"
                value={form.notas_tecnicas}
                onChange={(e) => setForm({ ...form, notas_tecnicas: e.target.value })}
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

export default Alunos;
