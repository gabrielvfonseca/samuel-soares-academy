"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "@repo/ui/icons";
import { toast } from "@repo/ui/components/sonner";

import { supabase } from "@/integrations/supabase/client";
import {
  DIAS_SEMANA,
  formatEuros,
  formatHoraSimples,
  listCampos,
  listClubeSessoes,
  listClubes,
  listTreinadores,
  type Clube,
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

type SessaoForm = { dia_semana: string; hora_inicio: string; hora_fim: string };

const SESSAO_VAZIA: SessaoForm = { dia_semana: "", hora_inicio: "", hora_fim: "" };

const VAZIO = {
  nome: "",
  nif: "",
  contacto: "",
  email: "",
  valor_mensal: "",
  treinador_id: "",
  campo_id: "",
  notas: "",
  ativo: true,
};

function Clubes() {
  const qc = useQueryClient();
  const clubes = useQuery({ queryKey: ["clubes"], queryFn: listClubes });
  const treinadores = useQuery({ queryKey: ["treinadores"], queryFn: listTreinadores });
  const campos = useQuery({ queryKey: ["campos"], queryFn: listCampos });
  const sessoes = useQuery({ queryKey: ["clube_sessoes"], queryFn: listClubeSessoes });

  const [open, setOpen] = useState(false);
  const [atual, setAtual] = useState<Clube | null>(null);
  const [form, setForm] = useState(VAZIO);
  const [listaSessoes, setListaSessoes] = useState<SessaoForm[]>([]);
  const [novaSessao, setNovaSessao] = useState<SessaoForm>(SESSAO_VAZIA);

  function abrir(c?: Clube) {
    setAtual(c ?? null);
    setForm(
      c
        ? {
            nome: c.nome,
            nif: c.nif ?? "",
            contacto: c.contacto ?? "",
            email: c.email ?? "",
            valor_mensal: String(c.valor_mensal ?? ""),
            treinador_id: c.treinador_id ?? "",
            campo_id: c.campo_id ?? "",
            notas: c.notas ?? "",
            ativo: c.ativo,
          }
        : VAZIO,
    );
    const existentes = c ? (sessoes.data ?? []).filter((s) => s.clube_id === c.id) : [];
    setListaSessoes(
      existentes.map((s) => ({
        dia_semana: String(s.dia_semana),
        hora_inicio: s.hora_inicio.slice(0, 5),
        hora_fim: s.hora_fim.slice(0, 5),
      })),
    );
    setNovaSessao(SESSAO_VAZIA);
    setOpen(true);
  }

  function adicionarSessao() {
    if (novaSessao.dia_semana === "" || !novaSessao.hora_inicio || !novaSessao.hora_fim) {
      toast.error("Escolhe o dia e as horas da sessão");
      return;
    }
    if (novaSessao.hora_fim <= novaSessao.hora_inicio) {
      toast.error("A hora de fim tem de ser depois da hora de início");
      return;
    }
    if (
      listaSessoes.some(
        (s) => s.dia_semana === novaSessao.dia_semana && s.hora_inicio === novaSessao.hora_inicio,
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
      if (!form.nome.trim()) throw new Error("Indica o nome do clube");
      const primeira = listaSessoes[0];
      const payload = {
        nome: form.nome.trim(),
        nif: form.nif || null,
        contacto: form.contacto || null,
        email: form.email || null,
        valor_mensal: form.valor_mensal === "" ? 0 : Number(form.valor_mensal),
        treinador_id: form.treinador_id || null,
        campo_id: form.campo_id || null,
        dia_semana: primeira ? Number(primeira.dia_semana) : null,
        hora_inicio: primeira?.hora_inicio || null,
        hora_fim: primeira?.hora_fim || null,
        notas: form.notas || null,
        ativo: form.ativo,
      };
      let clubeId = atual?.id;
      if (atual) {
        const res = await supabase
          .from("clubes")
          .update(payload as never)
          .eq("id", atual.id);
        if (res.error) throw new Error(res.error.message);
      } else {
        const res = await supabase
          .from("clubes")
          .insert(payload as never)
          .select("id")
          .single();
        if (res.error) throw new Error(res.error.message);
        clubeId = (res.data as { id: string }).id;
      }
      if (!clubeId) throw new Error("Não foi possível identificar o clube");
      const del = await supabase.from("clube_sessoes").delete().eq("clube_id", clubeId);
      if (del.error) throw new Error(del.error.message);
      if (listaSessoes.length > 0) {
        const rows = listaSessoes.map((s) => ({
          clube_id: clubeId,
          dia_semana: Number(s.dia_semana),
          hora_inicio: s.hora_inicio,
          hora_fim: s.hora_fim,
        }));
        const ins = await supabase.from("clube_sessoes").insert(rows as never);
        if (ins.error) throw new Error(ins.error.message);
      }

      // Adapta os treinos futuros existentes em vez de os apagar e recriar.
      const agora = new Date();
      const futuros = await supabase
        .from("treinos")
        .select("id,data_hora_inicio,data_hora_fim")
        .eq("clube_id", clubeId)
        .eq("estado", "Agendado")
        .gte("data_hora_inicio", agora.toISOString())
        .order("data_hora_inicio");
      if (futuros.error) throw new Error(futuros.error.message);

      const treinosFuturos = (futuros.data ?? []) as Array<{
        id: string;
        data_hora_inicio: string;
        data_hora_fim: string;
      }>;
      const sessoesPorDia = new Map<number, SessaoForm>();
      for (const sessao of listaSessoes) sessoesPorDia.set(Number(sessao.dia_semana), sessao);

      const diasExistentes = new Set<string>();
      const idsARemover: string[] = [];
      for (const treino of treinosFuturos) {
        const inicioAtual = new Date(treino.data_hora_inicio);
        const sessao = sessoesPorDia.get(inicioAtual.getDay());
        if (!sessao || !form.ativo) {
          idsARemover.push(treino.id);
          continue;
        }

        const [horaInicio, minutoInicio] = sessao.hora_inicio.split(":").map(Number);
        const [horaFim, minutoFim] = sessao.hora_fim.split(":").map(Number);
        const novoInicio = new Date(inicioAtual);
        novoInicio.setHours(horaInicio ?? 0, minutoInicio ?? 0, 0, 0);
        const novoFim = new Date(inicioAtual);
        novoFim.setHours(horaFim ?? 0, minutoFim ?? 0, 0, 0);
        diasExistentes.add(
          `${novoInicio.getFullYear()}-${novoInicio.getMonth()}-${novoInicio.getDate()}`,
        );

        const atualizar = await supabase
          .from("treinos")
          .update({
            data_hora_inicio: novoInicio.toISOString(),
            data_hora_fim: novoFim.toISOString(),
            treinador_id: form.treinador_id || null,
            campo_local: campos.data?.find((campo) => campo.id === form.campo_id)?.nome ?? null,
          } as never)
          .eq("id", treino.id);
        if (atualizar.error) throw new Error(atualizar.error.message);
      }

      if (idsARemover.length > 0) {
        const removerTreinos = await supabase.from("treinos").delete().in("id", idsARemover);
        if (removerTreinos.error) throw new Error(removerTreinos.error.message);
      }

      // Para dias semanais agora acrescentados, mantém o mesmo horizonte já existente.
      const ultimoTreino = treinosFuturos.at(-1);
      if (form.ativo && ultimoTreino && listaSessoes.length > 0) {
        const limite = new Date(ultimoTreino.data_hora_inicio);
        const novosTreinos: Record<string, unknown>[] = [];
        const dia = new Date(agora);
        dia.setHours(0, 0, 0, 0);
        while (dia <= limite) {
          const sessao = sessoesPorDia.get(dia.getDay());
          const chaveDia = `${dia.getFullYear()}-${dia.getMonth()}-${dia.getDate()}`;
          if (sessao && !diasExistentes.has(chaveDia)) {
            const [horaInicio, minutoInicio] = sessao.hora_inicio.split(":").map(Number);
            const [horaFim, minutoFim] = sessao.hora_fim.split(":").map(Number);
            const inicio = new Date(dia);
            inicio.setHours(horaInicio ?? 0, minutoInicio ?? 0, 0, 0);
            const fim = new Date(dia);
            fim.setHours(horaFim ?? 0, minutoFim ?? 0, 0, 0);
            if (inicio >= agora) {
              novosTreinos.push({
                data_hora_inicio: inicio.toISOString(),
                data_hora_fim: fim.toISOString(),
                treinador_id: form.treinador_id || null,
                aluno_id: null,
                turma_id: null,
                clube_id: clubeId,
                tipo: "Grupo",
                estado: "Agendado",
                campo_local: campos.data?.find((campo) => campo.id === form.campo_id)?.nome ?? null,
              });
            }
          }
          dia.setDate(dia.getDate() + 1);
        }
        if (novosTreinos.length > 0) {
          const inserirTreinos = await supabase.from("treinos").insert(novosTreinos as never);
          if (inserirTreinos.error) throw new Error(inserirTreinos.error.message);
        }
      }
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["clubes"] }),
        qc.invalidateQueries({ queryKey: ["clube_sessoes"] }),
        qc.invalidateQueries({ queryKey: ["treinos"] }),
      ]);
      toast.success("Clube guardado e treinos futuros ajustados");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const limpar = await supabase
        .from("treinos")
        .delete()
        .eq("clube_id", id)
        .eq("estado", "Agendado")
        .gte("data_hora_inicio", new Date().toISOString());
      if (limpar.error) throw new Error(limpar.error.message);
      const { error } = await supabase.from("clubes").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["clubes"] }),
        qc.invalidateQueries({ queryKey: ["clube_sessoes"] }),
        qc.invalidateQueries({ queryKey: ["treinos"] }),
      ]);
      toast.success("Clube removido");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sessoesDoClube = (id: string) => (sessoes.data ?? []).filter((s) => s.clube_id === id);

  const nomeTreinador = (id: string | null) =>
    treinadores.data?.find((t) => t.id === id)?.nome ?? "Sem treinador";
  const nomeCampo = (id: string | null) =>
    campos.data?.find((c) => c.id === id)?.nome ?? "Sem campo";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl leading-none">Clubes</h1>
          <p className="text-muted-foreground">Prestação de serviços a clubes (B2B)</p>
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
                  <p className="font-semibold">{c.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    {nomeTreinador(c.treinador_id)} · {nomeCampo(c.campo_id)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {sessoesDoClube(c.id).length === 0
                      ? "Sem horário definido"
                      : sessoesDoClube(c.id)
                          .map(
                            (s) =>
                              `${DIAS_SEMANA[s.dia_semana]} ${formatHoraSimples(s.hora_inicio)}–${formatHoraSimples(s.hora_fim)}`,
                          )
                          .join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{formatEuros(Number(c.valor_mensal))}/mês</Badge>
                  {!c.ativo && <Badge variant="outline">Inativo</Badge>}
                  <Button variant="outline" size="icon" onClick={() => abrir(c)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => remover.mutate(c.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              {c.notas && (
                <p className="pitch-line pl-3 text-sm text-muted-foreground">{c.notas}</p>
              )}
            </CardContent>
          </Card>
        ))}
        {(clubes.data ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">Ainda não existem clubes registados.</p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {atual ? "Editar clube" : "Novo clube"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do clube</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nif">NIF</Label>
                <Input
                  id="nif"
                  inputMode="numeric"
                  value={form.nif}
                  onChange={(e) => setForm({ ...form, nif: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor mensal (€)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={form.valor_mensal}
                  onChange={(e) => setForm({ ...form, valor_mensal: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contacto">Contacto</Label>
                <Input
                  id="contacto"
                  value={form.contacto}
                  onChange={(e) => setForm({ ...form, contacto: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Treinador atribuído</Label>
                <Select
                  value={form.treinador_id}
                  onValueChange={(v) => setForm({ ...form, treinador_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar treinador" />
                  </SelectTrigger>
                  <SelectContent>
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
                  value={form.campo_id}
                  onValueChange={(v) => setForm({ ...form, campo_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar campo" />
                  </SelectTrigger>
                  <SelectContent>
                    {(campos.data ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
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
                      key={i}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span>
                        {DIAS_SEMANA[Number(s.dia_semana)]} {s.hora_inicio}–{s.hora_fim}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setListaSessoes(listaSessoes.filter((_, j) => j !== i))}
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
                    value={novaSessao.dia_semana}
                    onValueChange={(v) => setNovaSessao({ ...novaSessao, dia_semana: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Dia" />
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
                <div className="space-y-2">
                  <Label htmlFor="hi">Início</Label>
                  <Input
                    id="hi"
                    type="time"
                    value={novaSessao.hora_inicio}
                    onChange={(e) => setNovaSessao({ ...novaSessao, hora_inicio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hf">Fim</Label>
                  <Input
                    id="hf"
                    type="time"
                    value={novaSessao.hora_fim}
                    onChange={(e) => setNovaSessao({ ...novaSessao, hora_fim: e.target.value })}
                  />
                </div>
                <Button type="button" variant="outline" onClick={adicionarSessao}>
                  <Plus className="size-4" /> Adicionar
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={form.ativo ? "1" : "0"}
                onValueChange={(v) => setForm({ ...form, ativo: v === "1" })}
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
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
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

export default Clubes;
