"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "@repo/ui/icons";
import { toast } from "@repo/ui/components/sonner";

import { supabase } from "@/integrations/supabase/client";
import { formatEuros, horasTreino, listTreinos } from "@/lib/gk";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import { DocumentosPerfil } from "@/components/DocumentosPerfil";

type Perfil = {
  id: string;
  nome: string;
  email: string;
  telefone_whatsapp: string | null;
  data_nascimento: string | null;
  morada: string | null;
  nif: string | null;
  observacoes: string | null;
  valor_hora_individual: number | null;
  valor_hora_grupo: number | null;
};

function PerfilTreinador() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const treinador = useQuery({
    queryKey: ["treinador", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("treinadores").select("*").eq("id", id).single();
      if (error) throw new Error(error.message);
      return data as unknown as Perfil;
    },
  });

  const treinos = useQuery({ queryKey: ["treinos"], queryFn: listTreinos });

  const [form, setForm] = useState({
    telefone_whatsapp: "",
    data_nascimento: "",
    morada: "",
    nif: "",
    observacoes: "",
    valor_hora_individual: "0",
    valor_hora_grupo: "0",
  });

  useEffect(() => {
    const t = treinador.data;
    if (!t) return;
    setForm({
      telefone_whatsapp: t.telefone_whatsapp ?? "",
      data_nascimento: t.data_nascimento ?? "",
      morada: t.morada ?? "",
      nif: t.nif ?? "",
      observacoes: t.observacoes ?? "",
      valor_hora_individual: String(t.valor_hora_individual ?? 0),
      valor_hora_grupo: String(t.valor_hora_grupo ?? 0),
    });
  }, [treinador.data]);

  const resumo = useMemo(() => {
    const agora = new Date();
    const mes = agora.getMonth();
    const ano = agora.getFullYear();
    let horasInd = 0;
    let horasGrupo = 0;
    for (const t of treinos.data ?? []) {
      if (t.treinador_id !== id || t.estado === "Cancelado") continue;
      const d = new Date(t.data_hora_inicio);
      if (d.getMonth() !== mes || d.getFullYear() !== ano) continue;
      if (new Date(t.data_hora_fim) > agora) continue; // só treinos já dados
      const h = horasTreino(t.data_hora_inicio, t.data_hora_fim);
      if (t.tipo === "Grupo") horasGrupo += h;
      else horasInd += h;
    }
    const vi = Number(form.valor_hora_individual) || 0;
    const vg = Number(form.valor_hora_grupo) || 0;
    return { horasInd, horasGrupo, total: horasInd * vi + horasGrupo * vg };
  }, [treinos.data, id, form.valor_hora_individual, form.valor_hora_grupo]);

  const guardar = useMutation({
    mutationFn: async () => {
      const payload = {
        telefone_whatsapp: form.telefone_whatsapp || null,
        data_nascimento: form.data_nascimento || null,
        morada: form.morada || null,
        nif: form.nif || null,
        observacoes: form.observacoes || null,
        valor_hora_individual: Number(form.valor_hora_individual) || 0,
        valor_hora_grupo: Number(form.valor_hora_grupo) || 0,
      };
      const { error } = await supabase
        .from("treinadores")
        .update(payload as never)
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["treinador", id] });
      qc.invalidateQueries({ queryKey: ["treinadores"] });
      toast.success("Perfil guardado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <Link
        href="/treinadores"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft className="size-4" /> Voltar aos treinadores
      </Link>

      <header>
        <h1 className="font-display text-5xl leading-none">{treinador.data?.nome ?? "Perfil"}</h1>
        <p className="text-muted-foreground">{treinador.data?.email}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">Dados do treinador</CardTitle>
          <CardDescription>Informação interna da equipa técnica.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tel">Telefone / WhatsApp</Label>
            <Input
              id="tel"
              value={form.telefone_whatsapp}
              onChange={(e) => setForm({ ...form, telefone_whatsapp: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nasc">Data de nascimento</Label>
            <Input
              id="nasc"
              type="date"
              value={form.data_nascimento}
              onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nif">NIF</Label>
            <Input
              id="nif"
              value={form.nif}
              onChange={(e) => setForm({ ...form, nif: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="morada">Morada</Label>
            <Input
              id="morada"
              value={form.morada}
              onChange={(e) => setForm({ ...form, morada: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="obs">Observações</Label>
            <Textarea
              id="obs"
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Button onClick={() => guardar.mutate()} disabled={guardar.isPending}>
              Guardar perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">Ordenado</CardTitle>
          <CardDescription>
            Valores por hora e cálculo automático do ordenado do mês atual.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="vhi">Valor por hora · treinos individuais (€)</Label>
            <Input
              id="vhi"
              type="number"
              min="0"
              step="0.5"
              value={form.valor_hora_individual}
              onChange={(e) => setForm({ ...form, valor_hora_individual: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vhg">Valor por hora · treinos de grupo (€)</Label>
            <Input
              id="vhg"
              type="number"
              min="0"
              step="0.5"
              value={form.valor_hora_grupo}
              onChange={(e) => setForm({ ...form, valor_hora_grupo: e.target.value })}
            />
          </div>
          <div className="grid gap-3 md:col-span-2 md:grid-cols-3">
            <div className="rounded-md border border-border p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Horas individuais (mês)
              </p>
              <p className="font-display text-3xl">{resumo.horasInd.toFixed(1)}h</p>
            </div>
            <div className="rounded-md border border-border p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Horas de grupo (mês)
              </p>
              <p className="font-display text-3xl">{resumo.horasGrupo.toFixed(1)}h</p>
            </div>
            <div className="rounded-md border border-primary/40 bg-primary/10 p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Ordenado do mês
              </p>
              <p className="font-display text-3xl text-primary">{formatEuros(resumo.total)}</p>
            </div>
          </div>
          <div className="md:col-span-2">
            <Button onClick={() => guardar.mutate()} disabled={guardar.isPending}>
              Guardar valores
            </Button>
          </div>
        </CardContent>
      </Card>

      <DocumentosPerfil
        prefixo={`treinadores/${id}`}
        titulo="Contratos e documentos"
        descricao="Contratos assinados, certificados e outros ficheiros do treinador."
      />
    </div>
  );
}

export default PerfilTreinador;
