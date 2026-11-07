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
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  type Clube,
  DIAS_SEMANA,
  formatEuros,
  formatHoraSimples,
  listCampos,
  listClubeSessoes,
  listClubes,
  listTreinadores,
} from "@/lib/gk";

interface SessaoForm {
  dia_semana: string;
  hora_fim: string;
  hora_inicio: string;
}

const SESSAO_VAZIA: SessaoForm = {
  dia_semana: "",
  hora_fim: "",
  hora_inicio: "",
};

const VAZIO = {
  ativo: true,
  campo_id: "",
  contacto: "",
  email: "",
  nif: "",
  nome: "",
  notas: "",
  treinador_id: "",
  valor_mensal: "",
};

function Clubes() {
  const qc = useQueryClient();
  const clubes = useQuery({ queryFn: listClubes, queryKey: ["clubes"] });
  const treinadores = useQuery({
    queryFn: listTreinadores,
    queryKey: ["treinadores"],
  });
  const campos = useQuery({ queryFn: listCampos, queryKey: ["campos"] });
  const sessoes = useQuery({
    queryFn: listClubeSessoes,
    queryKey: ["clube_sessoes"],
  });

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
            ativo: c.ativo,
            campo_id: c.campo_id ?? "",
            contacto: c.contacto ?? "",
            email: c.email ?? "",
            nif: c.nif ?? "",
            nome: c.nome,
            notas: c.notas ?? "",
            treinador_id: c.treinador_id ?? "",
            valor_mensal: String(c.valor_mensal ?? ""),
          }
        : VAZIO
    );
    const existentes = c
      ? (sessoes.data ?? []).filter((s) => s.clube_id === c.id)
      : [];
    setListaSessoes(
      existentes.map((s) => ({
        dia_semana: String(s.dia_semana),
        hora_fim: s.hora_fim.slice(0, 5),
        hora_inicio: s.hora_inicio.slice(0, 5),
      }))
    );
    setNovaSessao(SESSAO_VAZIA);
    setOpen(true);
  }

  function adicionarSessao() {
    if (
      novaSessao.dia_semana === "" ||
      !novaSessao.hora_inicio ||
      !novaSessao.hora_fim
    ) {
      toast.error("Escolhe o dia e as horas da sessão");
      return;
    }
    if (novaSessao.hora_fim <= novaSessao.hora_inicio) {
      toast.error("A hora de fim tem de ser depois da hora de início");
      return;
    }
    if (
      listaSessoes.some(
        (s) =>
          s.dia_semana === novaSessao.dia_semana &&
          s.hora_inicio === novaSessao.hora_inicio
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
      if (!form.nome.trim()) {
        throw new Error("Indica o nome do clube");
      }
      const primeira = listaSessoes[0];
      const payload = {
        ativo: form.ativo,
        campo_id: form.campo_id || null,
        contacto: form.contacto || null,
        dia_semana: primeira ? Number(primeira.dia_semana) : null,
        email: form.email || null,
        hora_fim: primeira?.hora_fim || null,
        hora_inicio: primeira?.hora_inicio || null,
        nif: form.nif || null,
        nome: form.nome.trim(),
        notas: form.notas || null,
        treinador_id: form.treinador_id || null,
        valor_mensal: form.valor_mensal === "" ? 0 : Number(form.valor_mensal),
      };
      let clubeId = atual?.id;
      if (atual) {
        const res = await supabase
          .from("clubes")
          .update(payload as never)
          .eq("id", atual.id);
        if (res.error) {
          throw new Error(res.error.message);
        }
      } else {
        const res = await supabase
          .from("clubes")
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
        .from("clube_sessoes")
        .delete()
        .eq("clube_id", clubeId);
      if (del.error) {
        throw new Error(del.error.message);
      }
      if (listaSessoes.length > 0) {
        const rows = listaSessoes.map((s) => ({
          clube_id: clubeId,
          dia_semana: Number(s.dia_semana),
          hora_fim: s.hora_fim,
          hora_inicio: s.hora_inicio,
        }));
        const ins = await supabase.from("clube_sessoes").insert(rows as never);
        if (ins.error) {
          throw new Error(ins.error.message);
        }
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
      if (futuros.error) {
        throw new Error(futuros.error.message);
      }

      const treinosFuturos = (futuros.data ?? []) as Array<{
        id: string;
        data_hora_inicio: string;
        data_hora_fim: string;
      }>;
      const sessoesPorDia = new Map<number, SessaoForm>();
      for (const sessao of listaSessoes) {
        sessoesPorDia.set(Number(sessao.dia_semana), sessao);
      }

      const diasExistentes = new Set<string>();
      const idsARemover: string[] = [];
      for (const treino of treinosFuturos) {
        const inicioAtual = new Date(treino.data_hora_inicio);
        const sessao = sessoesPorDia.get(inicioAtual.getDay());
        if (!(sessao && form.ativo)) {
          idsARemover.push(treino.id);
          continue;
        }

        const [horaInicio, minutoInicio] = sessao.hora_inicio
          .split(":")
          .map(Number);
        const [horaFim, minutoFim] = sessao.hora_fim.split(":").map(Number);
        const novoInicio = new Date(inicioAtual);
        novoInicio.setHours(horaInicio ?? 0, minutoInicio ?? 0, 0, 0);
        const novoFim = new Date(inicioAtual);
        novoFim.setHours(horaFim ?? 0, minutoFim ?? 0, 0, 0);
        diasExistentes.add(
          `${novoInicio.getFullYear()}-${novoInicio.getMonth()}-${novoInicio.getDate()}`
        );

        const atualizar = await supabase
          .from("treinos")
          .update({
            campo_local:
              campos.data?.find((campo) => campo.id === form.campo_id)?.nome ??
              null,
            data_hora_fim: novoFim.toISOString(),
            data_hora_inicio: novoInicio.toISOString(),
            treinador_id: form.treinador_id || null,
          } as never)
          .eq("id", treino.id);
        if (atualizar.error) {
          throw new Error(atualizar.error.message);
        }
      }

      if (idsARemover.length > 0) {
        const removerTreinos = await supabase
          .from("treinos")
          .delete()
          .in("id", idsARemover);
        if (removerTreinos.error) {
          throw new Error(removerTreinos.error.message);
        }
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
            const [horaInicio, minutoInicio] = sessao.hora_inicio
              .split(":")
              .map(Number);
            const [horaFim, minutoFim] = sessao.hora_fim.split(":").map(Number);
            const inicio = new Date(dia);
            inicio.setHours(horaInicio ?? 0, minutoInicio ?? 0, 0, 0);
            const fim = new Date(dia);
            fim.setHours(horaFim ?? 0, minutoFim ?? 0, 0, 0);
            if (inicio >= agora) {
              novosTreinos.push({
                aluno_id: null,
                campo_local:
                  campos.data?.find((campo) => campo.id === form.campo_id)
                    ?.nome ?? null,
                clube_id: clubeId,
                data_hora_fim: fim.toISOString(),
                data_hora_inicio: inicio.toISOString(),
                estado: "Agendado",
                tipo: "Grupo",
                treinador_id: form.treinador_id || null,
                turma_id: null,
              });
            }
          }
          dia.setDate(dia.getDate() + 1);
        }
        if (novosTreinos.length > 0) {
          const inserirTreinos = await supabase
            .from("treinos")
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
        .from("treinos")
        .delete()
        .eq("clube_id", id)
        .eq("estado", "Agendado")
        .gte("data_hora_inicio", new Date().toISOString());
      if (limpar.error) {
        throw new Error(limpar.error.message);
      }
      const { error } = await supabase.from("clubes").delete().eq("id", id);
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
    (sessoes.data ?? []).filter((s) => s.clube_id === id);

  const nomeTreinador = (id: string | null) =>
    treinadores.data?.find((t) => t.id === id)?.nome ?? "Sem treinador";
  const nomeCampo = (id: string | null) =>
    campos.data?.find((c) => c.id === id)?.nome ?? "Sem campo";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl leading-none">Clubes</h1>
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
                  <p className="font-semibold">{c.nome}</p>
                  <p className="text-muted-foreground text-sm">
                    {nomeTreinador(c.treinador_id)} · {nomeCampo(c.campo_id)}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {sessoesDoClube(c.id).length === 0
                      ? "Sem horário definido"
                      : sessoesDoClube(c.id)
                          .map(
                            (s) =>
                              `${DIAS_SEMANA[s.dia_semana]} ${formatHoraSimples(s.hora_inicio)}–${formatHoraSimples(s.hora_fim)}`
                          )
                          .join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{formatEuros(Number(c.valor_mensal))}/mês</Badge>
                  {!c.ativo && <Badge variant="outline">Inativo</Badge>}
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
              {c.notas && (
                <p className="pitch-line text-muted-foreground pl-3 text-sm">
                  {c.notas}
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
            <DialogTitle className="font-display text-2xl">
              {atual ? "Editar clube" : "Novo clube"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do clube</Label>
              <Input
                id="nome"
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                value={form.nome}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nif">NIF</Label>
                <Input
                  id="nif"
                  inputMode="numeric"
                  onChange={(e) => setForm({ ...form, nif: e.target.value })}
                  value={form.nif}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor mensal (€)</Label>
                <Input
                  id="valor"
                  onChange={(e) =>
                    setForm({ ...form, valor_mensal: e.target.value })
                  }
                  step="0.01"
                  type="number"
                  value={form.valor_mensal}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contacto">Contacto</Label>
                <Input
                  id="contacto"
                  onChange={(e) =>
                    setForm({ ...form, contacto: e.target.value })
                  }
                  value={form.contacto}
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
                <Label>Treinador atribuído</Label>
                <Select
                  onValueChange={(v) => setForm({ ...form, treinador_id: v })}
                  value={form.treinador_id}
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
                  onValueChange={(v) => setForm({ ...form, campo_id: v })}
                  value={form.campo_id}
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
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                      key={i}
                    >
                      <span>
                        {DIAS_SEMANA[Number(s.dia_semana)]} {s.hora_inicio}–
                        {s.hora_fim}
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
                      setNovaSessao({ ...novaSessao, dia_semana: v })
                    }
                    value={novaSessao.dia_semana}
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
                    onChange={(e) =>
                      setNovaSessao({
                        ...novaSessao,
                        hora_inicio: e.target.value,
                      })
                    }
                    type="time"
                    value={novaSessao.hora_inicio}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hf">Fim</Label>
                  <Input
                    id="hf"
                    onChange={(e) =>
                      setNovaSessao({ ...novaSessao, hora_fim: e.target.value })
                    }
                    type="time"
                    value={novaSessao.hora_fim}
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
                onValueChange={(v) => setForm({ ...form, ativo: v === "1" })}
                value={form.ativo ? "1" : "0"}
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

export default Clubes;
