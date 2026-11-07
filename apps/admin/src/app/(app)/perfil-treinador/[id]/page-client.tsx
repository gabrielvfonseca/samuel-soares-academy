"use client";

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
import { toast } from "@repo/ui/components/sonner";
import { Textarea } from "@repo/ui/components/textarea";
import { ArrowLeft } from "@repo/ui/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DocumentosPerfil } from "@/components/documentos-perfil";
import { supabase } from "@/integrations/supabase/client";
import { formatEuros, horasTreino, listTreinos } from "@/lib/gk";

interface Perfil {
  data_nascimento: string | null;
  email: string;
  id: string;
  morada: string | null;
  nif: string | null;
  nome: string;
  observacoes: string | null;
  telefone_whatsapp: string | null;
  valor_hora_grupo: number | null;
  valor_hora_individual: number | null;
}

function PerfilTreinador() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const treinador = useQuery({
    queryFn: async () => {
      const { data, error } = await supabase
        .from("treinadores")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return data as unknown as Perfil;
    },
    queryKey: ["treinador", id],
  });

  const treinos = useQuery({ queryFn: listTreinos, queryKey: ["treinos"] });

  const [form, setForm] = useState({
    data_nascimento: "",
    morada: "",
    nif: "",
    observacoes: "",
    telefone_whatsapp: "",
    valor_hora_grupo: "0",
    valor_hora_individual: "0",
  });

  useEffect(() => {
    const t = treinador.data;
    if (!t) {
      return;
    }
    setForm({
      data_nascimento: t.data_nascimento ?? "",
      morada: t.morada ?? "",
      nif: t.nif ?? "",
      observacoes: t.observacoes ?? "",
      telefone_whatsapp: t.telefone_whatsapp ?? "",
      valor_hora_grupo: String(t.valor_hora_grupo ?? 0),
      valor_hora_individual: String(t.valor_hora_individual ?? 0),
    });
  }, [treinador.data]);

  const resumo = useMemo(() => {
    const agora = new Date();
    const mes = agora.getMonth();
    const ano = agora.getFullYear();
    let horasInd = 0;
    let horasGrupo = 0;
    for (const t of treinos.data ?? []) {
      if (t.treinador_id !== id || t.estado === "Cancelado") {
        continue;
      }
      const d = new Date(t.data_hora_inicio);
      if (d.getMonth() !== mes || d.getFullYear() !== ano) {
        continue;
      }
      if (new Date(t.data_hora_fim) > agora) {
        continue; // só treinos já dados
      }
      const h = horasTreino(t.data_hora_inicio, t.data_hora_fim);
      if (t.tipo === "Grupo") {
        horasGrupo += h;
      } else {
        horasInd += h;
      }
    }
    const vi = Number(form.valor_hora_individual) || 0;
    const vg = Number(form.valor_hora_grupo) || 0;
    return { horasGrupo, horasInd, total: horasInd * vi + horasGrupo * vg };
  }, [treinos.data, id, form.valor_hora_individual, form.valor_hora_grupo]);

  const guardar = useMutation({
    mutationFn: async () => {
      const payload = {
        data_nascimento: form.data_nascimento || null,
        morada: form.morada || null,
        nif: form.nif || null,
        observacoes: form.observacoes || null,
        telefone_whatsapp: form.telefone_whatsapp || null,
        valor_hora_grupo: Number(form.valor_hora_grupo) || 0,
        valor_hora_individual: Number(form.valor_hora_individual) || 0,
      };
      const { error } = await supabase
        .from("treinadores")
        .update(payload as never)
        .eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["treinador", id] });
      qc.invalidateQueries({ queryKey: ["treinadores"] });
      toast.success("Perfil guardado");
    },
  });

  return (
    <div className="space-y-6">
      <Link
        className="text-muted-foreground inline-flex items-center gap-2 text-sm"
        href="/treinadores"
      >
        <ArrowLeft className="size-4" /> Voltar aos treinadores
      </Link>

      <header>
        <h1 className="font-display text-5xl leading-none">
          {treinador.data?.nome ?? "Perfil"}
        </h1>
        <p className="text-muted-foreground">{treinador.data?.email}</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">
            Dados do treinador
          </CardTitle>
          <CardDescription>
            Informação interna da equipa técnica.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tel">Telefone / WhatsApp</Label>
            <Input
              id="tel"
              onChange={(e) =>
                setForm({ ...form, telefone_whatsapp: e.target.value })
              }
              value={form.telefone_whatsapp}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nasc">Data de nascimento</Label>
            <Input
              id="nasc"
              onChange={(e) =>
                setForm({ ...form, data_nascimento: e.target.value })
              }
              type="date"
              value={form.data_nascimento}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nif">NIF</Label>
            <Input
              id="nif"
              onChange={(e) => setForm({ ...form, nif: e.target.value })}
              value={form.nif}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="morada">Morada</Label>
            <Input
              id="morada"
              onChange={(e) => setForm({ ...form, morada: e.target.value })}
              value={form.morada}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="obs">Observações</Label>
            <Textarea
              id="obs"
              onChange={(e) =>
                setForm({ ...form, observacoes: e.target.value })
              }
              value={form.observacoes}
            />
          </div>
          <div className="md:col-span-2">
            <Button
              disabled={guardar.isPending}
              onClick={() => guardar.mutate()}
            >
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
            <Label htmlFor="vhi">
              Valor por hora · treinos individuais (€)
            </Label>
            <Input
              id="vhi"
              min="0"
              onChange={(e) =>
                setForm({ ...form, valor_hora_individual: e.target.value })
              }
              step="0.5"
              type="number"
              value={form.valor_hora_individual}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vhg">Valor por hora · treinos de grupo (€)</Label>
            <Input
              id="vhg"
              min="0"
              onChange={(e) =>
                setForm({ ...form, valor_hora_grupo: e.target.value })
              }
              step="0.5"
              type="number"
              value={form.valor_hora_grupo}
            />
          </div>
          <div className="grid gap-3 md:col-span-2 md:grid-cols-3">
            <div className="border-border rounded-md border p-4">
              <p className="text-muted-foreground text-xs tracking-widest uppercase">
                Horas individuais (mês)
              </p>
              <p className="font-display text-3xl">
                {resumo.horasInd.toFixed(1)}h
              </p>
            </div>
            <div className="border-border rounded-md border p-4">
              <p className="text-muted-foreground text-xs tracking-widest uppercase">
                Horas de grupo (mês)
              </p>
              <p className="font-display text-3xl">
                {resumo.horasGrupo.toFixed(1)}h
              </p>
            </div>
            <div className="border-primary/40 bg-primary/10 rounded-md border p-4">
              <p className="text-muted-foreground text-xs tracking-widest uppercase">
                Ordenado do mês
              </p>
              <p className="font-display text-primary text-3xl">
                {formatEuros(resumo.total)}
              </p>
            </div>
          </div>
          <div className="md:col-span-2">
            <Button
              disabled={guardar.isPending}
              onClick={() => guardar.mutate()}
            >
              Guardar valores
            </Button>
          </div>
        </CardContent>
      </Card>

      <DocumentosPerfil
        descricao="Contratos assinados, certificados e outros ficheiros do treinador."
        prefixo={`treinadores/${id}`}
        titulo="Contratos e documentos"
      />
    </div>
  );
}

export default PerfilTreinador;
