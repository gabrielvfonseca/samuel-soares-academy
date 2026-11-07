"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Download, Eye, Trash2, Upload } from "@repo/ui/icons";
import { toast } from "@repo/ui/components/sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/components/dialog";

type Props = {
  prefixo: string;
  titulo: string;
  descricao: string;
};

export function DocumentosPerfil({ prefixo, titulo, descricao }: Props) {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [visualizar, setVisualizar] = useState<{ nome: string; url: string } | null>(null);

  useEffect(
    () => () => {
      if (visualizar?.url.startsWith("blob:")) URL.revokeObjectURL(visualizar.url);
    },
    [visualizar],
  );

  const ficheiros = useQuery({
    queryKey: ["documentos", prefixo],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("documentos")
        .list(prefixo, { sortBy: { column: "created_at", order: "desc" } });
      if (error) throw new Error(error.message);
      return (data ?? []).filter((f) => f.name !== ".emptyFolderPlaceholder");
    },
  });

  const carregar = useMutation({
    mutationFn: async (file: File) => {
      const nome = `${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
      const { error } = await supabase.storage
        .from("documentos")
        .upload(`${prefixo}/${nome}`, file, { upsert: false });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documentos", prefixo] });
      toast.success("Ficheiro carregado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const apagar = useMutation({
    mutationFn: async (nome: string) => {
      const { error } = await supabase.storage.from("documentos").remove([`${prefixo}/${nome}`]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documentos", prefixo] });
      toast.success("Ficheiro apagado");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function descarregarBlob(nome: string) {
    const { data, error } = await supabase.storage
      .from("documentos")
      .download(`${prefixo}/${nome}`);
    if (error || !data) {
      toast.error(error?.message ?? "Não foi possível abrir o ficheiro");
      return null;
    }
    const tipo = /\.pdf$/i.test(nome) ? "application/pdf" : data.type || "application/octet-stream";
    return URL.createObjectURL(data.slice(0, data.size, tipo));
  }

  async function abrirNoSite(nome: string) {
    const url = await descarregarBlob(nome);
    if (url) setVisualizar({ nome, url });
  }

  async function transferir(nome: string) {
    const url = await descarregarBlob(nome);
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = nome.replace(/^\d+-/, "");
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  const eImagem = (nome: string) => /\.(png|jpe?g|gif|webp|avif)$/i.test(nome);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="font-display text-2xl">{titulo}</CardTitle>
          <CardDescription>{descricao}</CardDescription>
        </div>
        <Button onClick={() => inputRef.current?.click()} disabled={carregar.isPending}>
          <Upload className="size-4" /> Carregar
        </Button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) carregar.mutate(file);
            e.target.value = "";
          }}
        />
      </CardHeader>
      <CardContent className="space-y-2">
        {(ficheiros.data ?? []).map((f) => (
          <div
            key={f.name}
            className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
          >
            <button
              type="button"
              onClick={() => abrirNoSite(f.name)}
              className="truncate text-left text-sm hover:text-primary"
            >
              {f.name.replace(/^\d+-/, "")}
            </button>
            <div className="flex gap-2">
              <Button variant="secondary" size="icon" onClick={() => abrirNoSite(f.name)}>
                <Eye className="size-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => transferir(f.name)}>
                <Download className="size-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={() => apagar.mutate(f.name)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        {(ficheiros.data ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">Ainda não existem ficheiros.</p>
        )}
      </CardContent>

      <Dialog open={!!visualizar} onOpenChange={(o) => !o && setVisualizar(null)}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="truncate font-display text-2xl">
              {visualizar?.nome.replace(/^\d+-/, "")}
            </DialogTitle>
          </DialogHeader>
          {visualizar &&
            (eImagem(visualizar.nome) ? (
              <img
                src={visualizar.url}
                alt={`Documento ${visualizar.nome.replace(/^\d+-/, "")}`}
                className="max-h-[75vh] w-full rounded-md object-contain"
              />
            ) : (
              <object
                data={visualizar.url}
                type="application/pdf"
                className="h-[75vh] w-full rounded-md border border-border bg-white"
              >
                <div className="p-4 text-sm">
                  Não foi possível pré-visualizar aqui.{" "}
                  <button
                    type="button"
                    className="underline"
                    onClick={() => transferir(visualizar.nome)}
                  >
                    Transferir ficheiro
                  </button>
                </div>
              </object>
            ))}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
