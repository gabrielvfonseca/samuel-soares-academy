"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "@repo/ui/components/sonner";
import { Trash2, Plus } from "@repo/ui/icons";

import { supabase } from "@/integrations/supabase/client";
import {
  CATEGORIAS_MOVIMENTO,
  TIPOS_MOVIMENTO,
  formatEuros,
  formatMes,
  listMovimentos,
  listTreinadores,
  mesAtual,
  type Movimento,
  type TipoMovimento,
} from "@/lib/gk";
import { Button } from "@repo/ui/components/button";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";

const hoje = () => new Date().toISOString().slice(0, 10);

function Financas() {
  const qc = useQueryClient();
  const movimentos = useQuery({ queryKey: ["movimentos"], queryFn: listMovimentos });
  const treinadores = useQuery({ queryKey: ["treinadores"], queryFn: listTreinadores });

  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState<TipoMovimento>("Saída");
  const [categoria, setCategoria] = useState<string>("Ordenado treinador");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(hoje());
  const [treinadorId, setTreinadorId] = useState<string>("nenhum");
  const [mesAtivo, setMesAtivo] = useState(mesAtual().slice(0, 7));

  const meses = useMemo(() => {
    const set = new Set<string>([mesAtual().slice(0, 7)]);
    for (const m of movimentos.data ?? []) set.add(m.data.slice(0, 7));
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [movimentos.data]);

  const porMes = (mes: string) =>
    (movimentos.data ?? [])
      .filter((m) => m.data.slice(0, 7) === mes)
      .sort((a, b) => b.data.localeCompare(a.data));

  const criar = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("movimentos").insert({
        tipo,
        categoria,
        descricao: descricao || null,
        valor: Number(valor || 0),
        data,
        treinador_id: treinadorId === "nenhum" ? null : treinadorId,
      } as never);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["movimentos"] });
      setAberto(false);
      setDescricao("");
      setValor("");
      toast.success("Movimento registado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const atualizarValor = useMutation({
    mutationFn: async (v: { id: string; valor: number }) => {
      const { error } = await supabase
        .from("movimentos")
        .update({ valor: v.valor } as never)
        .eq("id", v.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["movimentos"] });
      toast.success("Valor atualizado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const apagar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("movimentos").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["movimentos"] });
      toast.success("Movimento apagado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const somar = (lista: Movimento[], t: TipoMovimento) =>
    lista.filter((m) => m.tipo === t).reduce((acc, m) => acc + Number(m.valor), 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl leading-none">Contas da escola</h1>
          <p className="text-muted-foreground">
            Entradas e saídas mês a mês. Cada treino individual gera uma entrada de 40 € assim que
            fica marcado como pago (editável).
          </p>
        </div>
        <Dialog open={aberto} onOpenChange={setAberto}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" /> Novo movimento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Novo movimento</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={tipo} onValueChange={(v) => setTipo(v as TipoMovimento)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_MOVIMENTO.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={categoria} onValueChange={setCategoria}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_MOVIMENTO.map((c) => (
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
                    type="number"
                    step="0.01"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Treinador (opcional)</Label>
                <Select value={treinadorId} onValueChange={setTreinadorId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Sem treinador</SelectItem>
                    {(treinadores.data ?? []).map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => criar.mutate()} disabled={criar.isPending}>
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <Tabs value={mesAtivo} onValueChange={setMesAtivo}>
        <TabsList className="flex-wrap">
          {meses.map((m) => (
            <TabsTrigger key={m} value={m} className="capitalize">
              {formatMes(`${m}-01`)}
            </TabsTrigger>
          ))}
        </TabsList>

        {meses.map((m) => {
          const lista = porMes(m);
          const entradas = somar(lista, "Entrada");
          const saidas = somar(lista, "Saída");
          return (
            <TabsContent key={m} value={m} className="space-y-4 pt-4">
              <div className="grid gap-3 sm:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-normal text-muted-foreground">
                      Entradas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="font-display text-4xl text-primary">
                    {formatEuros(entradas)}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-normal text-muted-foreground">
                      Saídas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="font-display text-4xl text-destructive">
                    {formatEuros(saidas)}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-normal text-muted-foreground">
                      Total do mês
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="font-display text-4xl">
                    {formatEuros(entradas - saidas)}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-normal text-muted-foreground">
                      Total sem IVA (−23%)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="font-display text-4xl">
                    {formatEuros(entradas * 0.77 - saidas)}
                  </CardContent>
                </Card>
              </div>

              {lista.map((mov) => (
                <Card key={mov.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                    <div>
                      <p className="font-semibold">
                        {mov.categoria}
                        {mov.descricao ? ` · ${mov.descricao}` : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(`${mov.data}T12:00:00`).toLocaleDateString("pt-PT")}
                        {mov.automatico ? " · automático" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={mov.tipo === "Entrada" ? "default" : "destructive"}>
                        {mov.tipo}
                      </Badge>
                      <Input
                        type="number"
                        step="0.01"
                        className="w-32"
                        defaultValue={mov.valor}
                        onBlur={(e) => {
                          const novo = Number(e.target.value);
                          if (novo !== Number(mov.valor)) {
                            atualizarValor.mutate({ id: mov.id, valor: novo });
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => apagar.mutate(mov.id)}
                        aria-label="Apagar movimento"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {lista.length === 0 && (
                <p className="text-sm text-muted-foreground">Sem movimentos neste mês.</p>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

export default Financas;
