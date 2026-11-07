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
import { supabase } from "@/integrations/supabase/client";
import {
  DIAS_SEMANA,
  formatHoraSimples,
  listAlunos,
  listCampos,
  listTreinadores,
  listTurmas,
  type Turma,
} from "@/lib/gk";

const SEM_VALOR = "__nenhum__";

function Turmas() {
  const qc = useQueryClient();
  const turmas = useQuery({ queryFn: listTurmas, queryKey: ["turmas"] });
  const treinadores = useQuery({
    queryFn: listTreinadores,
    queryKey: ["treinadores"],
  });
  const campos = useQuery({ queryFn: listCampos, queryKey: ["campos"] });
  const alunos = useQuery({ queryFn: listAlunos, queryKey: ["alunos"] });

  const porTurma = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const a of alunos.data ?? []) {
      const ids = a.turma_ids?.length
        ? a.turma_ids
        : a.turma_id
          ? [a.turma_id]
          : [];
      for (const tid of ids) {
        map.set(tid, [...(map.get(tid) ?? []), a.nome]);
      }
    }
    return map;
  }, [alunos.data]);

  const [open, setOpen] = useState(false);
  const [atual, setAtual] = useState<Turma | null>(null);
  const [form, setForm] = useState({
    ativo: true,
    campo_id: "",
    dia_semana: "",
    escalao: "",
    hora_fim: "",
    hora_inicio: "",
    nome: "",
    notas: "",
    treinador_id: "",
  });

  function abrir(t?: Turma) {
    setAtual(t ?? null);
    setForm({
      ativo: t?.ativo ?? true,
      campo_id: t?.campo_id ?? "",
      dia_semana:
        t?.dia_semana === undefined || t.dia_semana === null
          ? ""
          : String(t.dia_semana),
      escalao: t?.escalao ?? "",
      hora_fim: t?.hora_fim ? t.hora_fim.slice(0, 5) : "",
      hora_inicio: t?.hora_inicio ? t.hora_inicio.slice(0, 5) : "",
      nome: t?.nome ?? "",
      notas: t?.notas ?? "",
      treinador_id: t?.treinador_id ?? "",
    });
    setOpen(true);
  }

  const guardar = useMutation({
    mutationFn: async () => {
      if (!form.nome.trim()) {
        throw new Error("Indique o nome da turma");
      }
      if (
        form.hora_inicio &&
        form.hora_fim &&
        form.hora_fim <= form.hora_inicio
      ) {
        throw new Error("A hora de fim tem de ser depois da hora de início");
      }
      const payload = {
        ativo: form.ativo,
        campo_id: form.campo_id || null,
        dia_semana: form.dia_semana ? Number(form.dia_semana) : null,
        escalao: form.escalao || null,
        hora_fim: form.hora_fim || null,
        hora_inicio: form.hora_inicio || null,
        nome: form.nome.trim(),
        notas: form.notas || null,
        treinador_id: form.treinador_id || null,
      };
      const res = atual
        ? await supabase
            .from("turmas")
            .update(payload as never)
            .eq("id", atual.id)
        : await supabase.from("turmas").insert(payload as never);
      if (res.error) {
        throw new Error(res.error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["turmas"] });
      toast.success("Turma guardada");
      setOpen(false);
    },
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("turmas").delete().eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["turmas"] });
      qc.invalidateQueries({ queryKey: ["alunos"] });
      toast.success("Turma removida");
    },
  });

  const nomeTreinador = (id: string | null) =>
    treinadores.data?.find((t) => t.id === id)?.nome ?? "Sem treinador";
  const nomeCampo = (id: string | null) =>
    campos.data?.find((c) => c.id === id)?.nome ?? "Sem campo";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl leading-none">Turmas</h1>
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
                    <p className="font-semibold">{t.nome}</p>
                    <p className="text-muted-foreground text-sm">
                      {nomeTreinador(t.treinador_id)} · {nomeCampo(t.campo_id)}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {t.dia_semana === null
                        ? "Sem dia definido"
                        : DIAS_SEMANA[t.dia_semana]}
                      {t.hora_inicio && t.hora_fim
                        ? ` · ${formatHoraSimples(t.hora_inicio)}–${formatHoraSimples(t.hora_fim)}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.escalao && (
                      <Badge variant="secondary">{t.escalao}</Badge>
                    )}
                    {!t.ativo && <Badge variant="outline">Inativa</Badge>}
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
                {t.notas && (
                  <p className="pitch-line text-muted-foreground pl-3 text-sm">
                    {t.notas}
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
            <DialogTitle className="font-display text-2xl">
              {atual ? "Editar turma" : "Nova turma"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da turma</Label>
              <Input
                id="nome"
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex.: Turma Sub-15 Terças"
                value={form.nome}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="escalao">Escalão</Label>
              <Input
                id="escalao"
                onChange={(e) => setForm({ ...form, escalao: e.target.value })}
                placeholder="Sub-15"
                value={form.escalao}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Treinador</Label>
                <Select
                  onValueChange={(v) =>
                    setForm({ ...form, treinador_id: v === SEM_VALOR ? "" : v })
                  }
                  value={form.treinador_id || SEM_VALOR}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SEM_VALOR}>Sem treinador</SelectItem>
                    {(treinadores.data ?? []).map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Campo</Label>
                <Select
                  onValueChange={(v) =>
                    setForm({ ...form, campo_id: v === SEM_VALOR ? "" : v })
                  }
                  value={form.campo_id || SEM_VALOR}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SEM_VALOR}>Sem campo</SelectItem>
                    {(campos.data ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
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
                    setForm({ ...form, dia_semana: v === SEM_VALOR ? "" : v })
                  }
                  value={form.dia_semana || SEM_VALOR}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Dia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SEM_VALOR}>Sem dia</SelectItem>
                    {DIAS_SEMANA.map((d, i) => (
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
                    setForm({ ...form, hora_inicio: e.target.value })
                  }
                  type="time"
                  value={form.hora_inicio}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hf">Fim</Label>
                <Input
                  id="hf"
                  onChange={(e) =>
                    setForm({ ...form, hora_fim: e.target.value })
                  }
                  type="time"
                  value={form.hora_fim}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                onValueChange={(v) =>
                  setForm({ ...form, ativo: v === "ativa" })
                }
                value={form.ativo ? "ativa" : "inativa"}
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
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
                value={form.notas}
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
