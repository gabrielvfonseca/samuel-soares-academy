"use client";

import { Badge } from "@ssa/ui/components/badge";
import { Button } from "@ssa/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ssa/ui/components/card";
import { Input } from "@ssa/ui/components/input";
import { Label } from "@ssa/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ssa/ui/components/select";
import { toast } from "@ssa/ui/components/sonner";
import { Textarea } from "@ssa/ui/components/textarea";
import { ArrowLeft } from "@ssa/ui/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DocumentosPerfil } from "@/components/documentos-perfil";
import { supabase } from "@/integrations/data/client";
import { ATHLETE_TYPES, ENROLLMENT_TYPES, formatMonthYear } from "@/lib/gk";

interface Perfil {
  athlete_type: string;
  birthDate: string | null;
  email_ee: string | null;
  enroll_date: string | null;
  enrollment_type: string | null;
  id: string;
  level: string | null;
  name: string;
  nome_ee: string | null;
  observacoes: string | null;
  parent_contact: string | null;
  technical_notes: string | null;
}

function PerfilAluno() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const aluno = useQuery({
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
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
    athlete_type: "Individual",
    birthDate: "",
    email_ee: "",
    enroll_date: "",
    enrollment_type: "",
    level: "",
    nome_ee: "",
    observacoes: "",
    parent_contact: "",
    technical_notes: "",
  });

  useEffect(() => {
    const a = aluno.data;
    if (!a) {
      return;
    }
    setForm({
      athlete_type: a.athlete_type ?? "Individual",
      birthDate: a.birthDate ?? "",
      email_ee: a.email_ee ?? "",
      enroll_date: a.enroll_date ?? "",
      enrollment_type: a.enrollment_type ?? "",
      level: a.level ?? "",
      nome_ee: a.nome_ee ?? "",
      observacoes: a.observacoes ?? "",
      parent_contact: a.parent_contact ?? "",
      technical_notes: a.technical_notes ?? "",
    });
  }, [aluno.data]);

  const guardar = useMutation({
    mutationFn: async () => {
      const payload = {
        athlete_type: form.athlete_type,
        birthDate: form.birthDate || null,
        email_ee: form.email_ee || null,
        enroll_date: form.enroll_date || null,
        enrollment_type:
          form.athlete_type === "Group" ? form.enrollment_type || null : null,
        level: form.level || null,
        nome_ee: form.nome_ee || null,
        observacoes: form.observacoes || null,
        parent_contact: form.parent_contact || null,
        technical_notes: form.technical_notes || null,
      };
      const { error } = await supabase
        .from("students")
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
        <h1 className="text-5xl leading-none">
          {aluno.data?.name ?? "Perfil"}
        </h1>
        <p className="text-muted-foreground">
          {aluno.data?.enroll_date
            ? `Connosco desde ${formatMonthYear(aluno.data.enroll_date)}`
            : form.athlete_type === "Group"
              ? "Atleta de treinos de grupo"
              : "Atleta de treinos individuais"}
        </p>
        {aluno.data?.enrollment_type && (
          <Badge variant="secondary">{aluno.data.enrollment_type}</Badge>
        )}
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Tipo de atleta</CardTitle>
          <CardDescription>
            Define se o atleta treina em grupo ou individualmente.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-sm">
          <Select
            onValueChange={(v) => setForm({ ...form, athlete_type: v })}
            value={form.athlete_type}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ATHLETE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === "Group" ? "Treinos de grupo" : "Treinos individuais"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {form.athlete_type === "Group" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Inscrição</CardTitle>
            <CardDescription>
              Modalidade contratada e data de entrada na escola.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Modalidade de inscrição</Label>
              <Select
                onValueChange={(v) => setForm({ ...form, enrollment_type: v })}
                value={form.enrollment_type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar modalidade" />
                </SelectTrigger>
                <SelectContent>
                  {ENROLLMENT_TYPES.map((m) => (
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
                  setForm({ ...form, enroll_date: e.target.value })
                }
                type="date"
                value={form.enroll_date}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Dados do atleta</CardTitle>
          <CardDescription>Informação de inscrição e contacto.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="level">Escalão</Label>
            <Input
              id="level"
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              value={form.level}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nasc">Data de nascimento</Label>
            <Input
              id="nasc"
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              type="date"
              value={form.birthDate}
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
                setForm({ ...form, parent_contact: e.target.value })
              }
              value={form.parent_contact}
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
                setForm({ ...form, technical_notes: e.target.value })
              }
              value={form.technical_notes}
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
        description="Fichas de inscrição assinadas, autorizações e outros ficheiros do atleta."
        prefix={`students/${id}`}
        title="Fichas de inscrição e documentos"
      />
    </div>
  );
}

export default PerfilAluno;
