"use client";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { toast } from "@repo/ui/components/sonner";
import { Download, Eye, Trash2, Upload } from "@repo/ui/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  descricao: string;
  prefixo: string;
  titulo: string;
}

export function DocumentosPerfil({ prefixo, titulo, descricao }: Props) {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [visualizar, setVisualizar] = useState<{
    nome: string;
    url: string;
  } | null>(null);

  useEffect(
    () => () => {
      if (visualizar?.url.startsWith("blob:")) {
        URL.revokeObjectURL(visualizar.url);
      }
    },
    [visualizar]
  );

  const ficheiros = useQuery({
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("documentos")
        .list(prefixo, { sortBy: { column: "created_at", order: "desc" } });
      if (error) {
        throw new Error(error.message);
      }
      return (data ?? []).filter((f) => f.name !== ".emptyFolderPlaceholder");
    },
    queryKey: ["documentos", prefixo],
  });

  const carregar = useMutation({
    mutationFn: async (file: File) => {
      const nome = `${Date.now()}-${file.name.replace(/[^\w.-]+/gu, "_")}`;
      const { error } = await supabase.storage
        .from("documentos")
        .upload(`${prefixo}/${nome}`, file, { upsert: false });
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documentos", prefixo] });
      toast.success("Ficheiro carregado");
    },
  });

  const apagar = useMutation({
    mutationFn: async (nome: string) => {
      const { error } = await supabase.storage
        .from("documentos")
        .remove([`${prefixo}/${nome}`]);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documentos", prefixo] });
      toast.success("Ficheiro apagado");
    },
  });

  async function descarregarBlob(nome: string) {
    const { data, error } = await supabase.storage
      .from("documentos")
      .download(`${prefixo}/${nome}`);
    if (error || !data) {
      toast.error(error?.message ?? "Não foi possível abrir o ficheiro");
      return null;
    }
    const tipo = /\.pdf$/iu.test(nome)
      ? "application/pdf"
      : data.type || "application/octet-stream";
    return URL.createObjectURL(data.slice(0, data.size, tipo));
  }

  async function abrirNoSite(nome: string) {
    const url = await descarregarBlob(nome);
    if (url) {
      setVisualizar({ nome, url });
    }
  }

  async function transferir(nome: string) {
    const url = await descarregarBlob(nome);
    if (!url) {
      return;
    }
    const a = document.createElement("a");
    a.href = url;
    a.download = nome.replace(/^\d+-/u, "");
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }

  const eImagem = (nome: string) => /\.(png|jpe?g|gif|webp|avif)$/iu.test(nome);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="font-display text-2xl">{titulo}</CardTitle>
          <CardDescription>{descricao}</CardDescription>
        </div>
        <Button
          disabled={carregar.isPending}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4" /> Carregar
        </Button>
        <input
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              carregar.mutate(file);
            }
            e.target.value = "";
          }}
          ref={inputRef}
          type="file"
        />
      </CardHeader>
      <CardContent className="space-y-2">
        {(ficheiros.data ?? []).map((f) => (
          <div
            className="border-border flex items-center justify-between gap-3 rounded-md border px-3 py-2"
            key={f.name}
          >
            <button
              className="hover:text-primary truncate text-left text-sm"
              onClick={() => abrirNoSite(f.name)}
              type="button"
            >
              {f.name.replace(/^\d+-/u, "")}
            </button>
            <div className="flex gap-2">
              <Button
                onClick={() => abrirNoSite(f.name)}
                size="icon"
                variant="secondary"
              >
                <Eye className="size-4" />
              </Button>
              <Button
                onClick={() => transferir(f.name)}
                size="icon"
                variant="outline"
              >
                <Download className="size-4" />
              </Button>
              <Button
                onClick={() => apagar.mutate(f.name)}
                size="icon"
                variant="destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        {(ficheiros.data ?? []).length === 0 && (
          <p className="text-muted-foreground text-sm">
            Ainda não existem ficheiros.
          </p>
        )}
      </CardContent>

      <Dialog
        onOpenChange={(o) => !o && setVisualizar(null)}
        open={!!visualizar}
      >
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="font-display truncate text-2xl">
              {visualizar?.nome.replace(/^\d+-/u, "")}
            </DialogTitle>
          </DialogHeader>
          {visualizar &&
            (eImagem(visualizar.nome) ? (
              <img
                alt={`Documento ${visualizar.nome.replace(/^\d+-/u, "")}`}
                className="max-h-[75vh] w-full rounded-md object-contain"
                src={visualizar.url}
              />
            ) : (
              <object
                className="border-border h-[75vh] w-full rounded-md border bg-white"
                data={visualizar.url}
                type="application/pdf"
              >
                <div className="p-4 text-sm">
                  Não foi possível pré-visualizar aqui.{" "}
                  <button
                    className="underline"
                    onClick={() => transferir(visualizar.nome)}
                    type="button"
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
