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
  DialogTrigger,
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
import { Plus, Trash2 } from "@repo/ui/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/data/client";
import {
  currentMonth,
  formatEuros,
  formatMonth,
  listCoaches,
  listTransactions,
  TRANSACTION_CATEGORIES,
  TRANSACTION_TYPES,
  type Transaction,
  type TransactionType,
} from "@/lib/gk";

const hoje = () => new Date().toISOString().slice(0, 10);

function Financas() {
  const qc = useQueryClient();
  const movimentos = useQuery({
    queryFn: listTransactions,
    queryKey: ["movimentos"],
  });
  const treinadores = useQuery({
    queryFn: listCoaches,
    queryKey: ["treinadores"],
  });

  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState<TransactionType>("Expense");
  const [categoria, setCategoria] = useState<string>("Ordenado treinador");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(hoje());
  const [treinadorId, setTreinadorId] = useState<string>("nenhum");
  const [mesAtivo, setMesAtivo] = useState(currentMonth().slice(0, 7));

  const meses = useMemo(() => {
    const set = new Set<string>([currentMonth().slice(0, 7)]);
    for (const m of movimentos.data ?? []) {
      set.add(m.date.slice(0, 7));
    }
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [movimentos.data]);

  const porMes = (month: string) =>
    (movimentos.data ?? [])
      .filter((m) => m.date.slice(0, 7) === month)
      .sort((a, b) => b.date.localeCompare(a.date));

  const criar = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("transactions").insert({
        amount: Number(valor || 0),
        categoria,
        coach_id: treinadorId === "nenhum" ? null : treinadorId,
        data,
        description: descricao || null,
        tipo,
      } as never);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["movimentos"] });
      setAberto(false);
      setDescricao("");
      setValor("");
      toast.success("Transaction registado");
    },
  });

  const atualizarValor = useMutation({
    mutationFn: async (v: { id: string; amount: number }) => {
      const { error } = await supabase
        .from("transactions")
        .update({ amount: v.amount } as never)
        .eq("id", v.id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["movimentos"] });
      toast.success("Valor atualizado");
    },
  });

  const apagar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["movimentos"] });
      toast.success("Transaction apagado");
    },
  });

  const somar = (lista: Transaction[], t: TransactionType) =>
    lista
      .filter((m) => m.type === t)
      .reduce((acc, m) => acc + Number(m.amount), 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl leading-none">Contas da escola</h1>
          <p className="text-muted-foreground">
            Entradas e saídas mês a mês. Cada treino individual gera uma entrada
            de 40 € assim que fica marcado como pago (editável).
          </p>
        </div>
        <Dialog onOpenChange={setAberto} open={aberto}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" /> Novo movimento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl">Novo movimento</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    onValueChange={(v) => setTipo(v as TransactionType)}
                    value={tipo}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSACTION_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select onValueChange={setCategoria} value={categoria}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSACTION_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor (€)</Label>
                  <Input
                    id="valor"
                    onChange={(e) => setValor(e.target.value)}
                    step="0.01"
                    type="number"
                    value={valor}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    onChange={(e) => setData(e.target.value)}
                    type="date"
                    value={data}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Coach (opcional)</Label>
                <Select onValueChange={setTreinadorId} value={treinadorId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Sem treinador</SelectItem>
                    {(treinadores.data ?? []).map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  onChange={(e) => setDescricao(e.target.value)}
                  value={descricao}
                />
              </div>
            </div>
            <DialogFooter>
              <Button disabled={criar.isPending} onClick={() => criar.mutate()}>
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <Tabs onValueChange={setMesAtivo} value={mesAtivo}>
        <TabsList className="flex-wrap">
          {meses.map((m) => (
            <TabsTrigger className="capitalize" key={m} value={m}>
              {formatMonth(`${m}-01`)}
            </TabsTrigger>
          ))}
        </TabsList>

        {meses.map((m) => {
          const lista = porMes(m);
          const entradas = somar(lista, "Income");
          const saidas = somar(lista, "Expense");
          return (
            <TabsContent className="space-y-4 pt-4" key={m} value={m}>
              <div className="grid gap-3 sm:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-muted-foreground text-sm font-normal">
                      Entradas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-primary text-4xl">
                    {formatEuros(entradas)}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-muted-foreground text-sm font-normal">
                      Saídas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-destructive text-4xl">
                    {formatEuros(saidas)}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-muted-foreground text-sm font-normal">
                      Total do mês
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-4xl">
                    {formatEuros(entradas - saidas)}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-muted-foreground text-sm font-normal">
                      Total sem IVA (−23%)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-4xl">
                    {formatEuros(entradas * 0.77 - saidas)}
                  </CardContent>
                </Card>
              </div>

              {lista.map((mov) => (
                <Card key={mov.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                    <div>
                      <p className="font-semibold">
                        {mov.category}
                        {mov.description ? ` · ${mov.description}` : ""}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {new Date(`${mov.date}T12:00:00`).toLocaleDateString(
                          "pt-PT"
                        )}
                        {mov.automatic ? " · automático" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          mov.type === "Income" ? "default" : "destructive"
                        }
                      >
                        {mov.type}
                      </Badge>
                      <Input
                        className="w-32"
                        defaultValue={mov.amount}
                        onBlur={(e) => {
                          const novo = Number(e.target.value);
                          if (novo !== Number(mov.amount)) {
                            atualizarValor.mutate({ amount: novo, id: mov.id });
                          }
                        }}
                        step="0.01"
                        type="number"
                      />
                      <Button
                        aria-label="Apagar movimento"
                        onClick={() => apagar.mutate(mov.id)}
                        size="icon"
                        variant="ghost"
                      >
                        <Trash2 className="text-destructive size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {lista.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Sem movimentos neste mês.
                </p>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

export default Financas;
