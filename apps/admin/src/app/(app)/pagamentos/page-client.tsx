"use client";

import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/data/client";
import {
  centsToInputValue,
  currentMonth,
  formatDate,
  formatEuros,
  formatMonth,
  formatTime,
  INVOICE_STATUSES,
  inputValueToCents,
  listClubs,
  listMonthlyFees,
  listStudents,
  listTrainings,
  PAYMENT_STATUSES,
} from "@/lib/gk";

function Pagamentos() {
  const qc = useQueryClient();
  const treinos = useQuery({ queryFn: listTrainings, queryKey: ["treinos"] });
  const alunos = useQuery({ queryFn: listStudents, queryKey: ["alunos"] });
  const mensalidades = useQuery({
    queryFn: listMonthlyFees,
    queryKey: ["mensalidades"],
  });
  const clubes = useQuery({ queryFn: listClubs, queryKey: ["clubes"] });

  const [filtro, setFiltro] = useState("todos");
  const [mes, setMes] = useState(currentMonth().slice(0, 7));

  const nomeAluno = (id: string | null) =>
    alunos.data?.find((a) => a.id === id)?.name ?? "—";

  const individuais = useMemo(
    () =>
      (treinos.data ?? [])
        .filter((t) => t.type === "Individual" && t.status === "Completed")
        .filter((t) => filtro === "todos" || t.payment_status === filtro)
        .sort((a, b) => b.start_date.localeCompare(a.start_date)),
    [treinos.data, filtro]
  );

  const porReceber = (treinos.data ?? []).filter(
    (t) =>
      t.type === "Individual" &&
      t.status === "Completed" &&
      t.payment_status === "Pending"
  ).length;

  const comFatura = (treinos.data ?? []).filter(
    (t) =>
      t.type === "Individual" &&
      t.payment_status === "Paid" &&
      t.invoice === "Invoiced"
  ).length;

  const alunosGrupo = useMemo(() => {
    const ids = new Set(
      (treinos.data ?? [])
        .filter((t) => t.type === "Group" && t.student_id)
        .map((t) => t.student_id)
    );
    return (alunos.data ?? []).filter(
      (a) => a.athlete_type === "Group" || ids.has(a.id)
    );
  }, [treinos.data, alunos.data]);

  const clubesAtivos = useMemo(
    () => (clubes.data ?? []).filter((c) => c.active),
    [clubes.data]
  );

  const { emAtraso, clubesEmAtraso } = useMemo(() => {
    const registo = (id: string) =>
      (mensalidades.data ?? []).find(
        (m) =>
          (m.student_id === id || m.club_id === id) &&
          m.month.slice(0, 7) === mes
      );
    const naoPago = (id: string) => registo(id)?.payment_status !== "Paid";
    return {
      clubesEmAtraso: clubesAtivos.filter((c) => naoPago(c.id)).length,
      emAtraso: alunosGrupo.filter((a) => naoPago(a.id)).length,
    };
  }, [alunosGrupo, clubesAtivos, mensalidades.data, mes]);

  const atualizarTreino = useMutation({
    mutationFn: async (v: {
      id: string;
      campo: "estado_pagamento" | "fatura" | "nif";
      amount: string;
    }) => {
      const payload =
        v.campo === "estado_pagamento"
          ? {
              invoice: v.amount === "Paid" ? "No invoice" : null,
              payment_status: v.amount,
              ...(v.amount === "Paid" ? {} : { tax_id: null }),
            }
          : v.campo === "fatura"
            ? {
                invoice: v.amount,
                ...(v.amount === "Invoiced" ? {} : { tax_id: null }),
              }
            : { tax_id: v.amount || null };
      const { error } = await supabase
        .from("trainings")
        .update(payload as never)
        .eq("id", v.id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["treinos"] });
      toast.success("Pagamento atualizado");
    },
  });

  const guardarMensalidade = useMutation({
    mutationFn: async (v: {
      student_id?: string;
      club_id?: string;
      campo: "estado_pagamento" | "fatura" | "valor" | "nif";
      amount: string;
    }) => {
      const base: Record<string, unknown> = {
        club_id: v.club_id ?? null,
        month: `${mes}-01`,
        student_id: v.student_id ?? null,
      };
      if (v.campo === "valor") {
        base.amount = inputValueToCents(v.amount);
      } else if (v.campo === "estado_pagamento") {
        base.payment_status = v.amount;
        base.invoice = v.amount === "Paid" ? "No invoice" : null;
      } else if (v.campo === "nif") {
        base.tax_id = v.amount || null;
      } else {
        base.invoice = v.amount;
        if (v.amount !== "Invoiced") {
          base.tax_id = null;
        }
      }

      const { error } = await supabase
        .from("monthly_fees")
        .upsert(base as never, {
          onConflict: v.club_id ? "club_id,month" : "student_id,month",
        });
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mensalidades"] });
      qc.invalidateQueries({ queryKey: ["movimentos"] });
      toast.success("MonthlyFee atualizada");
    },
  });

  const mensalidadeDe = (id: string) =>
    (mensalidades.data ?? []).find(
      (m) =>
        (m.student_id === id || m.club_id === id) && m.month.slice(0, 7) === mes
    );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-5xl leading-none">Painel de pagamentos</h1>
        <p className="text-muted-foreground">
          Treinos individuais e mensalidades dos atletas de grupo
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-normal">
              Treinos por receber
            </CardTitle>
          </CardHeader>
          <CardContent className="text-4xl">{porReceber}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-normal">
              Pagos com fatura
            </CardTitle>
          </CardHeader>
          <CardContent className="text-4xl">{comFatura}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-normal">
              Atletas de grupo
            </CardTitle>
          </CardHeader>
          <CardContent className="text-4xl">{alunosGrupo.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-normal">
              Mensalidades em atraso
            </CardTitle>
          </CardHeader>
          <CardContent className="text-destructive text-4xl">
            {emAtraso}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-normal">
              Clubes por receber
            </CardTitle>
          </CardHeader>
          <CardContent className="text-destructive text-4xl">
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

        <TabsContent className="space-y-3 pt-4" value="treinos">
          <Select onValueChange={setFiltro} value={filtro}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os estados</SelectItem>
              {PAYMENT_STATUSES.map((e) => (
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
                  <p className="font-semibold">{nomeAluno(t.student_id)}</p>
                  <p className="text-muted-foreground text-sm">
                    {formatDate(t.start_date)} · {formatTime(t.start_date)} –{" "}
                    {formatTime(t.end_date)} · {t.field ?? "—"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    onValueChange={(v) =>
                      atualizarTreino.mutate({
                        amount: v,
                        campo: "estado_pagamento",
                        id: t.id,
                      })
                    }
                    value={t.payment_status}
                  >
                    <SelectTrigger className="w-52">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_STATUSES.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {t.payment_status === "Paid" && (
                    <Select
                      onValueChange={(v) =>
                        atualizarTreino.mutate({
                          amount: v,
                          campo: "fatura",
                          id: t.id,
                        })
                      }
                      value={t.invoice ?? "No invoice"}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INVOICE_STATUSES.map((e) => (
                          <SelectItem key={e} value={e}>
                            {e}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {t.payment_status === "Paid" && t.invoice === "Invoiced" && (
                    <Input
                      className="w-40"
                      defaultValue={t.tax_id ?? ""}
                      inputMode="numeric"
                      onBlur={(e) => {
                        if ((e.target.value || null) !== (t.tax_id ?? null)) {
                          atualizarTreino.mutate({
                            amount: e.target.value,
                            campo: "nif",
                            id: t.id,
                          });
                        }
                      }}
                      placeholder="NIF"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {individuais.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Sem treinos individuais concluídos para mostrar.
            </p>
          )}
        </TabsContent>

        <TabsContent className="space-y-3 pt-4" value="mensalidades">
          <div className="flex items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="mes">Mês</Label>
              <Input
                className="w-48"
                id="mes"
                onChange={(e) => setMes(e.target.value)}
                type="month"
                value={mes}
              />
            </div>
            <Badge className="mb-2 capitalize" variant="secondary">
              {formatMonth(`${mes}-01`)}
            </Badge>
          </div>

          {alunosGrupo.map((a) => {
            const m = mensalidadeDe(a.id);
            return (
              <Card key={a.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                  <div>
                    <p className="font-semibold">{a.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {a.level ?? "—"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      className="w-32"
                      defaultValue={centsToInputValue(m?.amount)}
                      key={`${a.id}-${mes}`}
                      onBlur={(e) =>
                        guardarMensalidade.mutate({
                          amount: e.target.value,
                          campo: "valor",
                          student_id: a.id,
                        })
                      }
                      placeholder="Valor €"
                      step="0.01"
                      type="number"
                    />
                    <Select
                      onValueChange={(v) =>
                        guardarMensalidade.mutate({
                          amount: v,
                          campo: "estado_pagamento",
                          student_id: a.id,
                        })
                      }
                      value={m?.payment_status ?? "Pending"}
                    >
                      <SelectTrigger className="w-52">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_STATUSES.map((e) => (
                          <SelectItem key={e} value={e}>
                            {e}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {m?.payment_status === "Paid" && (
                      <Select
                        onValueChange={(v) =>
                          guardarMensalidade.mutate({
                            amount: v,
                            campo: "fatura",
                            student_id: a.id,
                          })
                        }
                        value={m.invoice ?? "No invoice"}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {INVOICE_STATUSES.map((e) => (
                            <SelectItem key={e} value={e}>
                              {e}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {m?.payment_status === "Paid" &&
                      m.invoice === "Invoiced" && (
                        <Input
                          className="w-40"
                          defaultValue={m.tax_id ?? ""}
                          inputMode="numeric"
                          onBlur={(e) => {
                            if (
                              (e.target.value || null) !== (m.tax_id ?? null)
                            ) {
                              guardarMensalidade.mutate({
                                amount: e.target.value,
                                campo: "nif",
                                student_id: a.id,
                              });
                            }
                          }}
                          placeholder="NIF"
                        />
                      )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {alunosGrupo.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Ainda não existem atletas associados a treinos de grupo.
            </p>
          )}
        </TabsContent>

        <TabsContent className="space-y-3 pt-4" value="clubes">
          <div className="flex items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="mes-clubes">Mês</Label>
              <Input
                className="w-48"
                id="mes-clubes"
                onChange={(e) => setMes(e.target.value)}
                type="month"
                value={mes}
              />
            </div>
            <Badge className="mb-2 capitalize" variant="secondary">
              {formatMonth(`${mes}-01`)}
            </Badge>
          </div>

          {clubesAtivos.map((c) => {
            const m = mensalidadeDe(c.id);
            return (
              <Card key={c.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-muted-foreground text-sm">
                      Valor acordado: {formatEuros(Number(c.monthly_fee))}/mês
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      className="w-32"
                      defaultValue={centsToInputValue(
                        m?.amount ?? c.monthly_fee
                      )}
                      key={`${c.id}-${mes}`}
                      onBlur={(e) =>
                        guardarMensalidade.mutate({
                          amount: e.target.value,
                          campo: "valor",
                          club_id: c.id,
                        })
                      }
                      placeholder="Valor €"
                      step="0.01"
                      type="number"
                    />
                    <Select
                      onValueChange={(v) =>
                        guardarMensalidade.mutate({
                          amount: v,
                          campo: "estado_pagamento",
                          club_id: c.id,
                        })
                      }
                      value={m?.payment_status ?? "Pending"}
                    >
                      <SelectTrigger className="w-52">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_STATUSES.map((e) => (
                          <SelectItem key={e} value={e}>
                            {e}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {m?.payment_status === "Paid" && (
                      <Select
                        onValueChange={(v) =>
                          guardarMensalidade.mutate({
                            amount: v,
                            campo: "fatura",
                            club_id: c.id,
                          })
                        }
                        value={m.invoice ?? "No invoice"}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {INVOICE_STATUSES.map((e) => (
                            <SelectItem key={e} value={e}>
                              {e}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {m?.payment_status === "Paid" &&
                      m.invoice === "Invoiced" && (
                        <Input
                          className="w-40"
                          defaultValue={m.tax_id ?? c.tax_id ?? ""}
                          inputMode="numeric"
                          onBlur={(e) => {
                            if (
                              (e.target.value || null) !== (m.tax_id ?? null)
                            ) {
                              guardarMensalidade.mutate({
                                amount: e.target.value,
                                campo: "nif",
                                club_id: c.id,
                              });
                            }
                          }}
                          placeholder="NIF"
                        />
                      )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {clubesAtivos.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Ainda não existem clubes ativos.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Pagamentos;
