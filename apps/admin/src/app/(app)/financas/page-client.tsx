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
import { supabase } from "@/integrations/supabase/client";
import {
  CATEGORIAS_MOVIMENTO,
  formatEuros,
  formatMes,
  listMovimentos,
  listTreinadores,
  type Movimento,
  mesAtual,
  TIPOS_MOVIMENTO,
  type TipoMovimento,
} from "@/lib/gk";

const hoje = () => new Date().toISOString().slice(0, 10);

function Financas() {
  const qc = useQueryClient();
  const movimentos = useQuery({
    queryFn: listMovimentos,
    queryKey: ["movimentos"],
  });
  const treinadores = useQuery({
    queryFn: listTreinadores,
    queryKey: ["treinadores"],
  });

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
    for (const m of movimentos.data ?? []) {
      set.add(m.data.slice(0, 7));
    }
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [movimentos.data]);

  const porMes = (mes: string) =>
    (movimentos.data ?? [])
      .filter((m) => m.data.slice(0, 7) === mes)
      .sort((a, b) => b.data.localeCompare(a.data));

  const criar = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("movimentos").insert({
        categoria,
        data,
        descricao: descricao || null,
        tipo,
        treinador_id: treinadorId === "nenhum" ? null : treinadorId,
        valor: Number(valor || 0),
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
      toast.success("Movimento registado");
    },
  });

  const atualizarValor = useMutation({
    mutationFn: async (v: { id: string; valor: number }) => {
      const { error } = await supabase
        .from("movimentos")
        .update({ valor: v.valor } as never)
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
      const { error } = await supabase.from("movimentos").delete().eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["movimentos"] });
      toast.success("Movimento apagado");
    },
  });

  const somar = (lista: Movimento[], t: TipoMovimento) =>
    lista
      .filter((m) => m.tipo === t)
      .reduce((acc, m) => acc + Number(m.valor), 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl leading-none">
            Contas da escola
          </h1>
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
              <DialogTitle className="font-display text-2xl">
                Novo movimento
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    onValueChange={(v) => setTipo(v as TipoMovimento)}
                    value={tipo}
                  >
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
                  <Select onValueChange={setCategoria} value={categoria}>
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
                <Label>Treinador (opcional)</Label>
                <Select onValueChange={setTreinadorId} value={treinadorId}>
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
              {formatMes(`${m}-01`)}
            </TabsTrigger>
          ))}
        </TabsList>

        {meses.map((m) => {
          const lista = porMes(m);
          const entradas = somar(lista, "Entrada");
          const saidas = somar(lista, "Saída");
          return (
            <TabsContent className="space-y-4 pt-4" key={m} value={m}>
              <div className="grid gap-3 sm:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-muted-foreground text-sm font-normal">
                      Entradas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="font-display text-primary text-4xl">
                    {formatEuros(entradas)}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-muted-foreground text-sm font-normal">
                      Saídas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="font-display text-destructive text-4xl">
                    {formatEuros(saidas)}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-muted-foreground text-sm font-normal">
                      Total do mês
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="font-display text-4xl">
                    {formatEuros(entradas - saidas)}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-muted-foreground text-sm font-normal">
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
                      <p className="text-muted-foreground text-sm">
                        {new Date(`${mov.data}T12:00:00`).toLocaleDateString(
                          "pt-PT"
                        )}
                        {mov.automatico ? " · automático" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          mov.tipo === "Entrada" ? "default" : "destructive"
                        }
                      >
                        {mov.tipo}
                      </Badge>
                      <Input
                        className="w-32"
                        defaultValue={mov.valor}
                        onBlur={(e) => {
                          const novo = Number(e.target.value);
                          if (novo !== Number(mov.valor)) {
                            atualizarValor.mutate({ id: mov.id, valor: novo });
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
