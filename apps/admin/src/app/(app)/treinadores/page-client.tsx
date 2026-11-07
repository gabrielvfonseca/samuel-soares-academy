"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { toast } from "@repo/ui/components/sonner";
import { Switch } from "@repo/ui/components/switch";
import { IdCard, Pencil, Plus, Trash2 } from "@repo/ui/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { listTreinadores, type Treinador } from "@/lib/gk";

function Treinadores() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryFn: listTreinadores,
    queryKey: ["treinadores"],
  });
  const [open, setOpen] = useState(false);
  const [atual, setAtual] = useState<Treinador | null>(null);
  const [form, setForm] = useState({
    ativo: true,
    email: "",
    nome: "",
    telefone_whatsapp: "",
  });

  function abrir(t?: Treinador) {
    setAtual(t ?? null);
    setForm({
      ativo: t?.ativo ?? true,
      email: t?.email ?? "",
      nome: t?.nome ?? "",
      telefone_whatsapp: t?.telefone_whatsapp ?? "",
    });
    setOpen(true);
  }

  const guardar = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        telefone_whatsapp: form.telefone_whatsapp || null,
      };
      const res = atual
        ? await supabase
            .from("treinadores")
            .update(payload as never)
            .eq("id", atual.id)
        : await supabase.from("treinadores").insert(payload as never);
      if (res.error) {
        throw new Error(res.error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["treinadores"] });
      toast.success("Treinador guardado");
      setOpen(false);
    },
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("treinadores")
        .delete()
        .eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["treinadores"] });
      toast.success("Treinador removido");
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl leading-none">Treinadores</h1>
          <p className="text-muted-foreground">Equipa técnica da escola</p>
        </div>
        <Button onClick={() => abrir()}>
          <Plus className="size-4" /> Novo treinador
        </Button>
      </header>

      <div className="grid gap-3">
        {(data ?? []).map((t) => (
          <Card key={t.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
              <div>
                <p className="font-semibold">
                  {t.nome}{" "}
                  <Badge
                    className="ml-2"
                    variant={t.ativo ? "default" : "secondary"}
                  >
                    {t.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </p>
                <p className="text-muted-foreground text-sm">
                  {t.email}{" "}
                  {t.telefone_whatsapp ? `· ${t.telefone_whatsapp}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/perfil-treinador/${t.id}`}>
                    <IdCard className="size-4" /> Perfil
                  </Link>
                </Button>
                <Button onClick={() => abrir(t)} size="icon" variant="outline">
                  <Pencil className="size-4" />
                </Button>
                <Button
                  onClick={() => remover.mutate(t.id)}
                  size="icon"
                  variant="destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {(data ?? []).length === 0 && (
          <p className="text-muted-foreground text-sm">
            Ainda não existem treinadores.
          </p>
        )}
      </div>

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {atual ? "Editar treinador" : "Novo treinador"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                value={form.nome}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                type="email"
                value={form.email}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wa">Telefone WhatsApp</Label>
              <Input
                id="wa"
                onChange={(e) =>
                  setForm({ ...form, telefone_whatsapp: e.target.value })
                }
                placeholder="+351912345678"
                value={form.telefone_whatsapp}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.ativo}
                id="ativo"
                onCheckedChange={(v) => setForm({ ...form, ativo: v })}
              />
              <Label htmlFor="ativo">Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={guardar.isPending}
              onClick={() => guardar.mutate()}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Treinadores;
