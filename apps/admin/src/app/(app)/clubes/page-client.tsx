"use client";

import { Badge } from "@ssa/ui/components/badge";
import { Button } from "@ssa/ui/components/button";
import { Card, CardContent } from "@ssa/ui/components/card";
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
import { Pencil, Plus, Trash2 } from "@ssa/ui/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/data/client";
import {
  type Club,
  DAY_NAMES,
  formatEuros,
  formatTimeShort,
  listClubSessions,
  listClubs,
  listCoaches,
  listFields,
} from "@/lib/gk";

interface SessaoForm {
  day_of_week: string;
  end_time: string;
  start_time: string;
}

const SESSAO_VAZIA: SessaoForm = {
  day_of_week: "",
  end_time: "",
  start_time: "",
};

const VAZIO = {
  active: true,
  coach_id: "",
  contact: "",
  email: "",
  field_id: "",
  monthly_fee: "",
  name: "",
  notes: "",
  tax_id: "",
};

function Clubes() {
  const qc = useQueryClient();
  const clubes = useQuery({ queryFn: listClubs, queryKey: ["clubes"] });
  const treinadores = useQuery({
    queryFn: listCoaches,
    queryKey: ["treinadores"],
  });
  const campos = useQuery({ queryFn: listFields, queryKey: ["campos"] });
  const sessoes = useQuery({
    queryFn: listClubSessions,
    queryKey: ["clube_sessoes"],
  });

  const [open, setOpen] = useState(false);
  const [atual, setAtual] = useState<Club | null>(null);
  const [form, setForm] = useState(VAZIO);
  const [listaSessoes, setListaSessoes] = useState<SessaoForm[]>([]);
  const [novaSessao, setNovaSessao] = useState<SessaoForm>(SESSAO_VAZIA);

  function abrir(c?: Club) {
    setAtual(c ?? null);
    setForm(
      c
        ? {
            active: c.active,
            coach_id: c.coach_id ?? "",
            contact: c.contact ?? "",
            email: c.email ?? "",
            field_id: c.field_id ?? "",
            monthly_fee: String(c.monthly_fee ?? ""),
            name: c.name,
            notes: c.notes ?? "",
            tax_id: c.tax_id ?? "",
          }
        : VAZIO
    );
    const existentes = c
      ? (sessoes.data ?? []).filter((s) => s.club_id === c.id)
      : [];
    setListaSessoes(
      existentes.map((s) => ({
        day_of_week: String(s.day_of_week),
        end_time: s.end_time.slice(0, 5),
        start_time: s.start_time.slice(0, 5),
      }))
    );
    setNovaSessao(SESSAO_VAZIA);
    setOpen(true);
  }

  function adicionarSessao() {
    if (
      novaSessao.day_of_week === "" ||
      !novaSessao.start_time ||
      !novaSessao.end_time
    ) {
      toast.error("Escolhe o dia e as horas da sessão");
      return;
    }
    if (novaSessao.end_time <= novaSessao.start_time) {
      toast.error("A hora de fim tem de ser depois da hora de início");
      return;
    }
    if (
      listaSessoes.some(
        (s) =>
          s.day_of_week === novaSessao.day_of_week &&
          s.start_time === novaSessao.start_time
      )
    ) {
      toast.error("Essa sessão já está na lista");
      return;
    }
    setListaSessoes([...listaSessoes, novaSessao]);
    setNovaSessao(SESSAO_VAZIA);
  }

  const guardar = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) {
        throw new Error("Indica o nome do clube");
      }
      const primeira = listaSessoes[0];
      const payload = {
        active: form.active,
        coach_id: form.coach_id || null,
        contact: form.contact || null,
        day_of_week: primeira ? Number(primeira.day_of_week) : null,
        email: form.email || null,
        end_time: primeira?.end_time || null,
        field_id: form.field_id || null,
        monthly_fee: form.monthly_fee === "" ? 0 : Number(form.monthly_fee),
        name: form.name.trim(),
        notes: form.notes || null,
        start_time: primeira?.start_time || null,
        tax_id: form.tax_id || null,
      };
      let clubeId = atual?.id;
      if (atual) {
        const res = await supabase
          .from("clubs")
          .update(payload as never)
          .eq("id", atual.id);
        if (res.error) {
          throw new Error(res.error.message);
        }
      } else {
        const res = await supabase
          .from("clubs")
          .insert(payload as never)
          .select("id")
          .single();
        if (res.error) {
          throw new Error(res.error.message);
        }
        clubeId = (res.data as { id: string }).id;
      }
      if (!clubeId) {
        throw new Error("Não foi possível identificar o clube");
      }
      const del = await supabase
        .from("club_sessions")
        .delete()
        .eq("clube_id", clubeId);
      if (del.error) {
        throw new Error(del.error.message);
      }
      if (listaSessoes.length > 0) {
        const rows = listaSessoes.map((s) => ({
          club_id: clubeId,
          day_of_week: Number(s.day_of_week),
          end_time: s.end_time,
          start_time: s.start_time,
        }));
        const ins = await supabase.from("club_sessions").insert(rows as never);
        if (ins.error) {
          throw new Error(ins.error.message);
        }
      }

      // Adapta os treinos futuros existentes em vez de os apagar e recriar.
      const agora = new Date();
      const futuros = await supabase
        .from("trainings")
        .select("id,data_hora_inicio,data_hora_fim")
        .eq("clube_id", clubeId)
        .eq("estado", "Scheduled")
        .gte("data_hora_inicio", agora.toISOString())
        .order("data_hora_inicio");
      if (futuros.error) {
        throw new Error(futuros.error.message);
      }

      const treinosFuturos = (futuros.data ?? []) as Array<{
        id: string;
        start_date: string;
        end_date: string;
      }>;
      const sessoesPorDia = new Map<number, SessaoForm>();
      for (const sessao of listaSessoes) {
        sessoesPorDia.set(Number(sessao.day_of_week), sessao);
      }

      const diasExistentes = new Set<string>();
      const idsARemover: string[] = [];
      for (const treino of treinosFuturos) {
        const inicioAtual = new Date(treino.start_date);
        const sessao = sessoesPorDia.get(inicioAtual.getDay());
        if (!(sessao && form.active)) {
          idsARemover.push(treino.id);
          continue;
        }

        const [horaInicio, minutoInicio] = sessao.start_time
          .split(":")
          .map(Number);
        const [horaFim, minutoFim] = sessao.end_time.split(":").map(Number);
        const novoInicio = new Date(inicioAtual);
        novoInicio.setHours(horaInicio ?? 0, minutoInicio ?? 0, 0, 0);
        const novoFim = new Date(inicioAtual);
        novoFim.setHours(horaFim ?? 0, minutoFim ?? 0, 0, 0);
        diasExistentes.add(
          `${novoInicio.getFullYear()}-${novoInicio.getMonth()}-${novoInicio.getDate()}`
        );

        const atualizar = await supabase
          .from("trainings")
          .update({
            coach_id: form.coach_id || null,
            end_date: novoFim.toISOString(),
            field:
              campos.data?.find((campo) => campo.id === form.field_id)?.name ??
              null,
            start_date: novoInicio.toISOString(),
          } as never)
          .eq("id", treino.id);
        if (atualizar.error) {
          throw new Error(atualizar.error.message);
        }
      }

      if (idsARemover.length > 0) {
        const removerTreinos = await supabase
          .from("trainings")
          .delete()
          .in("id", idsARemover);
        if (removerTreinos.error) {
          throw new Error(removerTreinos.error.message);
        }
      }

      // Para dias semanais agora acrescentados, mantém o mesmo horizonte já existente.
      const ultimoTreino = treinosFuturos.at(-1);
      if (form.active && ultimoTreino && listaSessoes.length > 0) {
        const limite = new Date(ultimoTreino.start_date);
        const novosTreinos: Record<string, unknown>[] = [];
        const dia = new Date(agora);
        dia.setHours(0, 0, 0, 0);
        while (dia <= limite) {
          const sessao = sessoesPorDia.get(dia.getDay());
          const chaveDia = `${dia.getFullYear()}-${dia.getMonth()}-${dia.getDate()}`;
          if (sessao && !diasExistentes.has(chaveDia)) {
            const [horaInicio, minutoInicio] = sessao.start_time
              .split(":")
              .map(Number);
            const [horaFim, minutoFim] = sessao.end_time.split(":").map(Number);
            const inicio = new Date(dia);
            inicio.setHours(horaInicio ?? 0, minutoInicio ?? 0, 0, 0);
            const fim = new Date(dia);
            fim.setHours(horaFim ?? 0, minutoFim ?? 0, 0, 0);
            if (inicio >= agora) {
              novosTreinos.push({
                club_id: clubeId,
                coach_id: form.coach_id || null,
                end_date: fim.toISOString(),
                field:
                  campos.data?.find((campo) => campo.id === form.field_id)
                    ?.name ?? null,
                group_id: null,
                start_date: inicio.toISOString(),
                status: "Scheduled",
                student_id: null,
                type: "Group",
              });
            }
          }
          dia.setDate(dia.getDate() + 1);
        }
        if (novosTreinos.length > 0) {
          const inserirTreinos = await supabase
            .from("trainings")
            .insert(novosTreinos as never);
          if (inserirTreinos.error) {
            throw new Error(inserirTreinos.error.message);
          }
        }
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["clubes"] }),
        qc.invalidateQueries({ queryKey: ["clube_sessoes"] }),
        qc.invalidateQueries({ queryKey: ["treinos"] }),
      ]);
      toast.success("Clube guardado e treinos futuros ajustados");
      setOpen(false);
    },
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const limpar = await supabase
        .from("trainings")
        .delete()
        .eq("clube_id", id)
        .eq("estado", "Scheduled")
        .gte("data_hora_inicio", new Date().toISOString());
      if (limpar.error) {
        throw new Error(limpar.error.message);
      }
      const { error } = await supabase.from("clubs").delete().eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["clubes"] }),
        qc.invalidateQueries({ queryKey: ["clube_sessoes"] }),
        qc.invalidateQueries({ queryKey: ["treinos"] }),
      ]);
      toast.success("Clube removido");
    },
  });

  const sessoesDoClube = (id: string) =>
    (sessoes.data ?? []).filter((s) => s.club_id === id);

  const nomeTreinador = (id: string | null) =>
    treinadores.data?.find((t) => t.id === id)?.name ?? "Sem treinador";
  const nomeCampo = (id: string | null) =>
    campos.data?.find((c) => c.id === id)?.name ?? "Sem campo";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl leading-none">Clubes</h1>
          <p className="text-muted-foreground">
            Prestação de serviços a clubes (B2B)
          </p>
        </div>
        <Button onClick={() => abrir()}>
          <Plus className="size-4" /> Novo clube
        </Button>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        {(clubes.data ?? []).map((c) => (
          <Card key={c.id}>
            <CardContent className="space-y-2 pt-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {nomeTreinador(c.coach_id)} · {nomeCampo(c.field_id)}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {sessoesDoClube(c.id).length === 0
                      ? "Sem horário definido"
                      : sessoesDoClube(c.id)
                          .map(
                            (s) =>
                              `${DAY_NAMES[s.day_of_week]} ${formatTimeShort(s.start_time)}–${formatTimeShort(s.end_time)}`
                          )
                          .join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{formatEuros(Number(c.monthly_fee))}/mês</Badge>
                  {!c.active && <Badge variant="outline">Inativo</Badge>}
                  <Button
                    onClick={() => abrir(c)}
                    size="icon"
                    variant="outline"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    onClick={() => remover.mutate(c.id)}
                    size="icon"
                    variant="destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              {c.notes && (
                <p className="border-border text-muted-foreground border-l-4 pl-3 text-sm">
                  {c.notes}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
        {(clubes.data ?? []).length === 0 && (
          <p className="text-muted-foreground text-sm">
            Ainda não existem clubes registados.
          </p>
        )}
      </div>

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {atual ? "Editar clube" : "Novo clube"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do clube</Label>
              <Input
                id="nome"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                value={form.name}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nif">NIF</Label>
                <Input
                  id="nif"
                  inputMode="numeric"
                  onChange={(e) => setForm({ ...form, tax_id: e.target.value })}
                  value={form.tax_id}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor mensal (€)</Label>
                <Input
                  id="valor"
                  onChange={(e) =>
                    setForm({ ...form, monthly_fee: e.target.value })
                  }
                  step="0.01"
                  type="number"
                  value={form.monthly_fee}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contacto">Contacto</Label>
                <Input
                  id="contacto"
                  onChange={(e) =>
                    setForm({ ...form, contact: e.target.value })
                  }
                  value={form.contact}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  type="email"
                  value={form.email}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Coach atribuído</Label>
                <Select
                  onValueChange={(v) => setForm({ ...form, coach_id: v })}
                  value={form.coach_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar treinador" />
                  </SelectTrigger>
                  <SelectContent>
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
                  onValueChange={(v) => setForm({ ...form, field_id: v })}
                  value={form.field_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar campo" />
                  </SelectTrigger>
                  <SelectContent>
                    {(campos.data ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3">
              <Label>Treinos semanais</Label>
              {listaSessoes.length > 0 && (
                <ul className="space-y-2">
                  {listaSessoes.map((s, i) => (
                    <li
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                      key={i}
                    >
                      <span>
                        {DAY_NAMES[Number(s.day_of_week)]} {s.start_time}–
                        {s.end_time}
                      </span>
                      <Button
                        onClick={() =>
                          setListaSessoes(
                            listaSessoes.filter((_, j) => j !== i)
                          )
                        }
                        size="icon"
                        variant="ghost"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="grid items-end gap-3 sm:grid-cols-4">
                <div className="space-y-2">
                  <Label>Dia da semana</Label>
                  <Select
                    onValueChange={(v) =>
                      setNovaSessao({ ...novaSessao, day_of_week: v })
                    }
                    value={novaSessao.day_of_week}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Dia" />
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
                <div className="space-y-2">
                  <Label htmlFor="hi">Início</Label>
                  <Input
                    id="hi"
                    onChange={(e) =>
                      setNovaSessao({
                        ...novaSessao,
                        start_time: e.target.value,
                      })
                    }
                    type="time"
                    value={novaSessao.start_time}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hf">Fim</Label>
                  <Input
                    id="hf"
                    onChange={(e) =>
                      setNovaSessao({ ...novaSessao, end_time: e.target.value })
                    }
                    type="time"
                    value={novaSessao.end_time}
                  />
                </div>
                <Button
                  onClick={adicionarSessao}
                  type="button"
                  variant="outline"
                >
                  <Plus className="size-4" /> Adicionar
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                onValueChange={(v) => setForm({ ...form, active: v === "1" })}
                value={form.active ? "1" : "0"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Ativo</SelectItem>
                  <SelectItem value="0">Inativo</SelectItem>
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

export default Clubes;
