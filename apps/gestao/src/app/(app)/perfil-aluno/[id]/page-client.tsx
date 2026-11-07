"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft } from "@repo/ui/icons";
import { toast } from "@repo/ui/components/sonner";

import { supabase } from "@/integrations/supabase/client";
import { MODALIDADES_INSCRICAO, TIPOS_ATLETA, formatMesAno } from "@/lib/gk";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { DocumentosPerfil } from "@/components/DocumentosPerfil";

type Perfil = {
  id: string;
  nome: string;
  escalao: string | null;
  contacto_ee: string | null;
  nome_ee: string | null;
  email_ee: string | null;
  data_nascimento: string | null;
  notas_tecnicas: string | null;
  observacoes: string | null;
  data_inscricao: string | null;
  modalidade_inscricao: string | null;
  tipo_atleta: string;
};

function PerfilAluno() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const aluno = useQuery({
    queryKey: ["aluno", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("alunos").select("*").eq("id", id).single();
      if (error) throw new Error(error.message);
      return data as unknown as Perfil;
    },
  });

  const [form, setForm] = useState({
    escalao: "",
    data_nascimento: "",
    nome_ee: "",
    contacto_ee: "",
    email_ee: "",
    notas_tecnicas: "",
    observacoes: "",
    data_inscricao: "",
    modalidade_inscricao: "",
    tipo_atleta: "Individual",
  });

  useEffect(() => {
    const a = aluno.data;
    if (!a) return;
    setForm({
      escalao: a.escalao ?? "",
      data_nascimento: a.data_nascimento ?? "",
      nome_ee: a.nome_ee ?? "",
      contacto_ee: a.contacto_ee ?? "",
      email_ee: a.email_ee ?? "",
      notas_tecnicas: a.notas_tecnicas ?? "",
      observacoes: a.observacoes ?? "",
      data_inscricao: a.data_inscricao ?? "",
      modalidade_inscricao: a.modalidade_inscricao ?? "",
      tipo_atleta: a.tipo_atleta ?? "Individual",
    });
  }, [aluno.data]);

  const guardar = useMutation({
    mutationFn: async () => {
      const payload = {
        escalao: form.escalao || null,
        data_nascimento: form.data_nascimento || null,
        nome_ee: form.nome_ee || null,
        contacto_ee: form.contacto_ee || null,
        email_ee: form.email_ee || null,
        notas_tecnicas: form.notas_tecnicas || null,
        observacoes: form.observacoes || null,
        data_inscricao: form.data_inscricao || null,
        modalidade_inscricao:
          form.tipo_atleta === "Grupo" ? form.modalidade_inscricao || null : null,
        tipo_atleta: form.tipo_atleta,
      };
      const { error } = await supabase
        .from("alunos")
        .update(payload as never)
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["aluno", id] });
      qc.invalidateQueries({ queryKey: ["alunos"] });
      toast.success("Perfil guardado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <Link href="/alunos" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> Voltar aos alunos
      </Link>

      <header className="space-y-2">
        <h1 className="font-display text-5xl leading-none">{aluno.data?.nome ?? "Perfil"}</h1>
        <p className="text-muted-foreground">
          {aluno.data?.data_inscricao
            ? `Connosco desde ${formatMesAno(aluno.data.data_inscricao)}`
            : form.tipo_atleta === "Grupo"
              ? "Atleta de treinos de grupo"
              : "Atleta de treinos individuais"}
        </p>
        {aluno.data?.modalidade_inscricao && (
          <Badge variant="secondary">{aluno.data.modalidade_inscricao}</Badge>
        )}
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">Tipo de atleta</CardTitle>
          <CardDescription>Define se o atleta treina em grupo ou individualmente.</CardDescription>
        </CardHeader>
        <CardContent className="max-w-sm">
          <Select
            value={form.tipo_atleta}
            onValueChange={(v) => setForm({ ...form, tipo_atleta: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_ATLETA.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === "Grupo" ? "Treinos de grupo" : "Treinos individuais"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {form.tipo_atleta === "Grupo" && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl">Inscrição</CardTitle>
            <CardDescription>Modalidade contratada e data de entrada na escola.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Modalidade de inscrição</Label>
              <Select
                value={form.modalidade_inscricao}
                onValueChange={(v) => setForm({ ...form, modalidade_inscricao: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar modalidade" />
                </SelectTrigger>
                <SelectContent>
                  {MODALIDADES_INSCRICAO.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inscricao">Connosco desde</Label>
              <Input
                id="inscricao"
                type="date"
                value={form.data_inscricao}
                onChange={(e) => setForm({ ...form, data_inscricao: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">Dados do atleta</CardTitle>
          <CardDescription>Informação de inscrição e contacto.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="escalao">Escalão</Label>
            <Input
              id="escalao"
              value={form.escalao}
              onChange={(e) => setForm({ ...form, escalao: e.target.value })}
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
            <Label htmlFor="nomeee">Encarregado de educação</Label>
            <Input
              id="nomeee"
              value={form.nome_ee}
              onChange={(e) => setForm({ ...form, nome_ee: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ee">Contacto do encarregado</Label>
            <Input
              id="ee"
              value={form.contacto_ee}
              onChange={(e) => setForm({ ...form, contacto_ee: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailee">Email do encarregado</Label>
            <Input
              id="emailee"
              type="email"
              value={form.email_ee}
              onChange={(e) => setForm({ ...form, email_ee: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notas">Notas técnicas</Label>
            <Textarea
              id="notas"
              value={form.notas_tecnicas}
              onChange={(e) => setForm({ ...form, notas_tecnicas: e.target.value })}
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

      <DocumentosPerfil
        prefixo={`alunos/${id}`}
        titulo="Fichas de inscrição e documentos"
        descricao="Fichas de inscrição assinadas, autorizações e outros ficheiros do atleta."
      />
    </div>
  );
}

export default PerfilAluno;
