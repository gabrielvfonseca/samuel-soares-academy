"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "@repo/ui/components/sonner";

import { supabase } from "@/integrations/supabase/client";
import {
  ESTADOS_FATURA,
  ESTADOS_PAGAMENTO,
  formatData,
  formatHora,
  formatEuros,
  formatMes,
  listAlunos,
  listClubes,
  listMensalidades,
  listTreinos,
  mesAtual,
} from "@/lib/gk";
import { Badge } from "@repo/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

function Pagamentos() {
  const qc = useQueryClient();
  const treinos = useQuery({ queryKey: ["treinos"], queryFn: listTreinos });
  const alunos = useQuery({ queryKey: ["alunos"], queryFn: listAlunos });
  const mensalidades = useQuery({ queryKey: ["mensalidades"], queryFn: listMensalidades });
  const clubes = useQuery({ queryKey: ["clubes"], queryFn: listClubes });

  const [filtro, setFiltro] = useState("todos");
  const [mes, setMes] = useState(mesAtual().slice(0, 7));

  const nomeAluno = (id: string | null) => alunos.data?.find((a) => a.id === id)?.nome ?? "—";

  const individuais = useMemo(
    () =>
      (treinos.data ?? [])
        .filter((t) => t.tipo === "Individual" && t.estado === "Concluído")
        .filter((t) => filtro === "todos" || t.estado_pagamento === filtro)
        .sort((a, b) => b.data_hora_inicio.localeCompare(a.data_hora_inicio)),
    [treinos.data, filtro],
  );

  const porReceber = (treinos.data ?? []).filter(
    (t) =>
      t.tipo === "Individual" &&
      t.estado === "Concluído" &&
      t.estado_pagamento === "A aguardar pagamento",
  ).length;

  const comFatura = (treinos.data ?? []).filter(
    (t) => t.tipo === "Individual" && t.estado_pagamento === "Pago" && t.fatura === "Com fatura",
  ).length;

  const alunosGrupo = useMemo(() => {
    const ids = new Set(
      (treinos.data ?? []).filter((t) => t.tipo === "Grupo" && t.aluno_id).map((t) => t.aluno_id),
    );
    return (alunos.data ?? []).filter((a) => a.tipo_atleta === "Grupo" || ids.has(a.id));
  }, [treinos.data, alunos.data]);

  const clubesAtivos = useMemo(() => (clubes.data ?? []).filter((c) => c.ativo), [clubes.data]);

  const { emAtraso, clubesEmAtraso } = useMemo(() => {
    const registo = (id: string) =>
      (mensalidades.data ?? []).find(
        (m) => (m.aluno_id === id || m.clube_id === id) && m.mes_referencia.slice(0, 7) === mes,
      );
    const naoPago = (id: string) => registo(id)?.estado_pagamento !== "Pago";
    return {
      emAtraso: alunosGrupo.filter((a) => naoPago(a.id)).length,
      clubesEmAtraso: clubesAtivos.filter((c) => naoPago(c.id)).length,
    };
  }, [alunosGrupo, clubesAtivos, mensalidades.data, mes]);

  const atualizarTreino = useMutation({
    mutationFn: async (v: {
      id: string;
      campo: "estado_pagamento" | "fatura" | "nif";
      valor: string;
    }) => {
      const payload =
        v.campo === "estado_pagamento"
          ? {
              estado_pagamento: v.valor,
              fatura: v.valor === "Pago" ? "Sem fatura" : null,
              ...(v.valor === "Pago" ? {} : { nif: null }),
            }
          : v.campo === "fatura"
            ? { fatura: v.valor, ...(v.valor === "Com fatura" ? {} : { nif: null }) }
            : { nif: v.valor || null };
      const { error } = await supabase
        .from("treinos")
        .update(payload as never)
        .eq("id", v.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["treinos"] });
      toast.success("Pagamento atualizado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const guardarMensalidade = useMutation({
    mutationFn: async (v: {
      alunoId?: string;
      clubeId?: string;
      campo: "estado_pagamento" | "fatura" | "valor" | "nif";
      valor: string;
    }) => {
      const base: Record<string, unknown> = {
        aluno_id: v.alunoId ?? null,
        clube_id: v.clubeId ?? null,
        mes_referencia: `${mes}-01`,
      };
      if (v.campo === "valor") base["valor"] = v.valor === "" ? null : Number(v.valor);
      else if (v.campo === "estado_pagamento") {
        base["estado_pagamento"] = v.valor;
        base["fatura"] = v.valor === "Pago" ? "Sem fatura" : null;
      } else if (v.campo === "nif") base["nif"] = v.valor || null;
      else {
        base["fatura"] = v.valor;
        if (v.valor !== "Com fatura") base["nif"] = null;
      }

      const { error } = await supabase.from("mensalidades").upsert(base as never, {
        onConflict: v.clubeId ? "clube_id,mes_referencia" : "aluno_id,mes_referencia",
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mensalidades"] });
      qc.invalidateQueries({ queryKey: ["movimentos"] });
      toast.success("Mensalidade atualizada");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mensalidadeDe = (id: string) =>
    (mensalidades.data ?? []).find(
      (m) => (m.aluno_id === id || m.clube_id === id) && m.mes_referencia.slice(0, 7) === mes,
    );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-5xl leading-none">Painel de pagamentos</h1>
        <p className="text-muted-foreground">
          Treinos individuais e mensalidades dos atletas de grupo
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Treinos por receber
            </CardTitle>
          </CardHeader>
          <CardContent className="font-display text-4xl">{porReceber}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Pagos com fatura
            </CardTitle>
          </CardHeader>
          <CardContent className="font-display text-4xl">{comFatura}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Atletas de grupo
            </CardTitle>
          </CardHeader>
          <CardContent className="font-display text-4xl">{alunosGrupo.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Mensalidades em atraso
            </CardTitle>
          </CardHeader>
          <CardContent className="font-display text-4xl text-destructive">{emAtraso}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Clubes por receber
            </CardTitle>
          </CardHeader>
          <CardContent className="font-display text-4xl text-destructive">
            {clubesEmAtraso}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="treinos">
        <TabsList>
          <TabsTrigger value="treinos">Treinos individuais</TabsTrigger>
          <TabsTrigger value="mensalidades">Mensalidades (grupo)</TabsTrigger>
          <TabsTrigger value="clubes">Clubes (B2B)</TabsTrigger>
        </TabsList>

        <TabsContent value="treinos" className="space-y-3 pt-4">
          <Select value={filtro} onValueChange={setFiltro}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os estados</SelectItem>
              {ESTADOS_PAGAMENTO.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {individuais.map((t) => (
            <Card key={t.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                <div>
                  <p className="font-semibold">{nomeAluno(t.aluno_id)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatData(t.data_hora_inicio)} · {formatHora(t.data_hora_inicio)} –{" "}
                    {formatHora(t.data_hora_fim)} · {t.campo_local ?? "—"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={t.estado_pagamento}
                    onValueChange={(v) =>
                      atualizarTreino.mutate({ id: t.id, campo: "estado_pagamento", valor: v })
                    }
                  >
                    <SelectTrigger className="w-52">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_PAGAMENTO.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {t.estado_pagamento === "Pago" && (
                    <Select
                      value={t.fatura ?? "Sem fatura"}
                      onValueChange={(v) =>
                        atualizarTreino.mutate({ id: t.id, campo: "fatura", valor: v })
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS_FATURA.map((e) => (
                          <SelectItem key={e} value={e}>
                            {e}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {t.estado_pagamento === "Pago" && t.fatura === "Com fatura" && (
                    <Input
                      className="w-40"
                      inputMode="numeric"
                      placeholder="NIF"
                      defaultValue={t.nif ?? ""}
                      onBlur={(e) => {
                        if ((e.target.value || null) !== (t.nif ?? null)) {
                          atualizarTreino.mutate({ id: t.id, campo: "nif", valor: e.target.value });
                        }
                      }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {individuais.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Sem treinos individuais concluídos para mostrar.
            </p>
          )}
        </TabsContent>

        <TabsContent value="mensalidades" className="space-y-3 pt-4">
          <div className="flex items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="mes">Mês</Label>
              <Input
                id="mes"
                type="month"
                className="w-48"
                value={mes}
                onChange={(e) => setMes(e.target.value)}
              />
            </div>
            <Badge variant="secondary" className="mb-2 capitalize">
              {formatMes(`${mes}-01`)}
            </Badge>
          </div>

          {alunosGrupo.map((a) => {
            const m = mensalidadeDe(a.id);
            return (
              <Card key={a.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                  <div>
                    <p className="font-semibold">{a.nome}</p>
                    <p className="text-sm text-muted-foreground">{a.escalao ?? "—"}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Valor €"
                      className="w-32"
                      defaultValue={m?.valor ?? ""}
                      onBlur={(e) =>
                        guardarMensalidade.mutate({
                          alunoId: a.id,
                          campo: "valor",
                          valor: e.target.value,
                        })
                      }
                    />
                    <Select
                      value={m?.estado_pagamento ?? "A aguardar pagamento"}
                      onValueChange={(v) =>
                        guardarMensalidade.mutate({
                          alunoId: a.id,
                          campo: "estado_pagamento",
                          valor: v,
                        })
                      }
                    >
                      <SelectTrigger className="w-52">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS_PAGAMENTO.map((e) => (
                          <SelectItem key={e} value={e}>
                            {e}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {m?.estado_pagamento === "Pago" && (
                      <Select
                        value={m.fatura ?? "Sem fatura"}
                        onValueChange={(v) =>
                          guardarMensalidade.mutate({ alunoId: a.id, campo: "fatura", valor: v })
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ESTADOS_FATURA.map((e) => (
                            <SelectItem key={e} value={e}>
                              {e}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {m?.estado_pagamento === "Pago" && m.fatura === "Com fatura" && (
                      <Input
                        className="w-40"
                        inputMode="numeric"
                        placeholder="NIF"
                        defaultValue={m.nif ?? ""}
                        onBlur={(e) => {
                          if ((e.target.value || null) !== (m.nif ?? null)) {
                            guardarMensalidade.mutate({
                              alunoId: a.id,
                              campo: "nif",
                              valor: e.target.value,
                            });
                          }
                        }}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {alunosGrupo.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Ainda não existem atletas associados a treinos de grupo.
            </p>
          )}
        </TabsContent>

        <TabsContent value="clubes" className="space-y-3 pt-4">
          <div className="flex items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="mes-clubes">Mês</Label>
              <Input
                id="mes-clubes"
                type="month"
                className="w-48"
                value={mes}
                onChange={(e) => setMes(e.target.value)}
              />
            </div>
            <Badge variant="secondary" className="mb-2 capitalize">
              {formatMes(`${mes}-01`)}
            </Badge>
          </div>

          {clubesAtivos.map((c) => {
            const m = mensalidadeDe(c.id);
            return (
              <Card key={c.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                  <div>
                    <p className="font-semibold">{c.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      Valor acordado: {formatEuros(Number(c.valor_mensal))}/mês
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Valor €"
                      className="w-32"
                      defaultValue={m?.valor ?? c.valor_mensal ?? ""}
                      key={`${c.id}-${mes}`}
                      onBlur={(e) =>
                        guardarMensalidade.mutate({
                          clubeId: c.id,
                          campo: "valor",
                          valor: e.target.value,
                        })
                      }
                    />
                    <Select
                      value={m?.estado_pagamento ?? "A aguardar pagamento"}
                      onValueChange={(v) =>
                        guardarMensalidade.mutate({
                          clubeId: c.id,
                          campo: "estado_pagamento",
                          valor: v,
                        })
                      }
                    >
                      <SelectTrigger className="w-52">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS_PAGAMENTO.map((e) => (
                          <SelectItem key={e} value={e}>
                            {e}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {m?.estado_pagamento === "Pago" && (
                      <Select
                        value={m.fatura ?? "Sem fatura"}
                        onValueChange={(v) =>
                          guardarMensalidade.mutate({ clubeId: c.id, campo: "fatura", valor: v })
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ESTADOS_FATURA.map((e) => (
                            <SelectItem key={e} value={e}>
                              {e}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {m?.estado_pagamento === "Pago" && m.fatura === "Com fatura" && (
                      <Input
                        className="w-40"
                        inputMode="numeric"
                        placeholder="NIF"
                        defaultValue={m.nif ?? c.nif ?? ""}
                        onBlur={(e) => {
                          if ((e.target.value || null) !== (m.nif ?? null)) {
                            guardarMensalidade.mutate({
                              clubeId: c.id,
                              campo: "nif",
                              valor: e.target.value,
                            });
                          }
                        }}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {clubesAtivos.length === 0 && (
            <p className="text-sm text-muted-foreground">Ainda não existem clubes ativos.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Pagamentos;
