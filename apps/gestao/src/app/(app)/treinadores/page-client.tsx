"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, IdCard } from "@repo/ui/icons";
import { toast } from "@repo/ui/components/sonner";

import { supabase } from "@/integrations/supabase/client";
import { listTreinadores, type Treinador } from "@/lib/gk";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { Card, CardContent } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Switch } from "@repo/ui/components/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";

function Treinadores() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["treinadores"], queryFn: listTreinadores });
  const [open, setOpen] = useState(false);
  const [atual, setAtual] = useState<Treinador | null>(null);
  const [form, setForm] = useState({ nome: "", email: "", telefone_whatsapp: "", ativo: true });

  function abrir(t?: Treinador) {
    setAtual(t ?? null);
    setForm({
      nome: t?.nome ?? "",
      email: t?.email ?? "",
      telefone_whatsapp: t?.telefone_whatsapp ?? "",
      ativo: t?.ativo ?? true,
    });
    setOpen(true);
  }

  const guardar = useMutation({
    mutationFn: async () => {
      const payload = { ...form, telefone_whatsapp: form.telefone_whatsapp || null };
      const res = atual
        ? await supabase
            .from("treinadores")
            .update(payload as never)
            .eq("id", atual.id)
        : await supabase.from("treinadores").insert(payload as never);
      if (res.error) throw new Error(res.error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["treinadores"] });
      toast.success("Treinador guardado");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("treinadores").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["treinadores"] });
      toast.success("Treinador removido");
    },
    onError: (e: Error) => toast.error(e.message),
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
                  <Badge variant={t.ativo ? "default" : "secondary"} className="ml-2">
                    {t.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.email} {t.telefone_whatsapp ? `· ${t.telefone_whatsapp}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`/perfil-treinador/${t.id}`}>
                    <IdCard className="size-4" /> Perfil
                  </Link>
                </Button>
                <Button variant="outline" size="icon" onClick={() => abrir(t)}>
                  <Pencil className="size-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => remover.mutate(t.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {(data ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">Ainda não existem treinadores.</p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
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
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wa">Telefone WhatsApp</Label>
              <Input
                id="wa"
                placeholder="+351912345678"
                value={form.telefone_whatsapp}
                onChange={(e) => setForm({ ...form, telefone_whatsapp: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="ativo"
                checked={form.ativo}
                onCheckedChange={(v) => setForm({ ...form, ativo: v })}
              />
              <Label htmlFor="ativo">Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => guardar.mutate()} disabled={guardar.isPending}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Treinadores;
