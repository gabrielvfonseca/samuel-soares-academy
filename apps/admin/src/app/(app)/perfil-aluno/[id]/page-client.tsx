"use client";

import { Badge } from "@repo/ui/components/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { toast } from "@repo/ui/components/sonner";
import { Textarea } from "@repo/ui/components/textarea";
import { ArrowLeft } from "@repo/ui/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DocumentosPerfil } from "@/components/documentos-perfil";
import { supabase } from "@/integrations/supabase/client";
import { formatMesAno, MODALIDADES_INSCRICAO, TIPOS_ATLETA } from "@/lib/gk";

interface Perfil {
  contacto_ee: string | null;
  data_inscricao: string | null;
  data_nascimento: string | null;
  email_ee: string | null;
  escalao: string | null;
  id: string;
  modalidade_inscricao: string | null;
  nome: string;
  nome_ee: string | null;
  notas_tecnicas: string | null;
  observacoes: string | null;
  tipo_atleta: string;
}

function PerfilAluno() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const aluno = useQuery({
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alunos")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        throw new Error(error.message);
      }
      return data as unknown as Perfil;
    },
    queryKey: ["aluno", id],
  });

  const [form, setForm] = useState({
    contacto_ee: "",
    data_inscricao: "",
    data_nascimento: "",
    email_ee: "",
    escalao: "",
    modalidade_inscricao: "",
    nome_ee: "",
    notas_tecnicas: "",
    observacoes: "",
    tipo_atleta: "Individual",
  });

  useEffect(() => {
    const a = aluno.data;
    if (!a) {
      return;
    }
    setForm({
      contacto_ee: a.contacto_ee ?? "",
      data_inscricao: a.data_inscricao ?? "",
      data_nascimento: a.data_nascimento ?? "",
      email_ee: a.email_ee ?? "",
      escalao: a.escalao ?? "",
      modalidade_inscricao: a.modalidade_inscricao ?? "",
      nome_ee: a.nome_ee ?? "",
      notas_tecnicas: a.notas_tecnicas ?? "",
      observacoes: a.observacoes ?? "",
      tipo_atleta: a.tipo_atleta ?? "Individual",
    });
  }, [aluno.data]);

  const guardar = useMutation({
    mutationFn: async () => {
      const payload = {
        contacto_ee: form.contacto_ee || null,
        data_inscricao: form.data_inscricao || null,
        data_nascimento: form.data_nascimento || null,
        email_ee: form.email_ee || null,
        escalao: form.escalao || null,
        modalidade_inscricao:
          form.tipo_atleta === "Grupo"
            ? form.modalidade_inscricao || null
            : null,
        nome_ee: form.nome_ee || null,
        notas_tecnicas: form.notas_tecnicas || null,
        observacoes: form.observacoes || null,
        tipo_atleta: form.tipo_atleta,
      };
      const { error } = await supabase
        .from("alunos")
        .update(payload as never)
        .eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["aluno", id] });
      qc.invalidateQueries({ queryKey: ["alunos"] });
      toast.success("Perfil guardado");
    },
  });

  return (
    <div className="space-y-6">
      <Link
        className="text-muted-foreground inline-flex items-center gap-2 text-sm"
        href="/alunos"
      >
        <ArrowLeft className="size-4" /> Voltar aos alunos
      </Link>

      <header className="space-y-2">
        <h1 className="font-display text-5xl leading-none">
          {aluno.data?.nome ?? "Perfil"}
        </h1>
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
          <CardTitle className="font-display text-2xl">
            Tipo de atleta
          </CardTitle>
          <CardDescription>
            Define se o atleta treina em grupo ou individualmente.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-sm">
          <Select
            onValueChange={(v) => setForm({ ...form, tipo_atleta: v })}
            value={form.tipo_atleta}
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
            <CardDescription>
              Modalidade contratada e data de entrada na escola.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Modalidade de inscrição</Label>
              <Select
                onValueChange={(v) =>
                  setForm({ ...form, modalidade_inscricao: v })
                }
                value={form.modalidade_inscricao}
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
                onChange={(e) =>
                  setForm({ ...form, data_inscricao: e.target.value })
                }
                type="date"
                value={form.data_inscricao}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">
            Dados do atleta
          </CardTitle>
          <CardDescription>Informação de inscrição e contacto.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="escalao">Escalão</Label>
            <Input
              id="escalao"
              onChange={(e) => setForm({ ...form, escalao: e.target.value })}
              value={form.escalao}
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
            <Label htmlFor="nomeee">Encarregado de educação</Label>
            <Input
              id="nomeee"
              onChange={(e) => setForm({ ...form, nome_ee: e.target.value })}
              value={form.nome_ee}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ee">Contacto do encarregado</Label>
            <Input
              id="ee"
              onChange={(e) =>
                setForm({ ...form, contacto_ee: e.target.value })
              }
              value={form.contacto_ee}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailee">Email do encarregado</Label>
            <Input
              id="emailee"
              onChange={(e) => setForm({ ...form, email_ee: e.target.value })}
              type="email"
              value={form.email_ee}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notas">Notas técnicas</Label>
            <Textarea
              id="notas"
              onChange={(e) =>
                setForm({ ...form, notas_tecnicas: e.target.value })
              }
              value={form.notas_tecnicas}
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

      <DocumentosPerfil
        descricao="Fichas de inscrição assinadas, autorizações e outros ficheiros do atleta."
        prefixo={`alunos/${id}`}
        titulo="Fichas de inscrição e documentos"
      />
    </div>
  );
}

export default PerfilAluno;
