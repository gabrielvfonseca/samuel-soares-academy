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
import { supabase } from "@/integrations/data/client";

interface Props {
  description: string;
  prefix: string;
  title: string;
}

export function DocumentosPerfil({ prefix, title, description }: Props) {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [visualizar, setVisualizar] = useState<{
    name: string;
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

  interface Ficheiro {
    created_at: string;
    id: string;
    last_modified: string;
    metadata: Record<string, unknown>;
    name: string;
    size: number;
    updated_at: string;
  }

  const ficheiros = useQuery({
    queryFn: async (): Promise<Ficheiro[]> => {
      const { data, error } = await supabase.storage
        .from("documentos")
        .list(prefix, { sortBy: { column: "created_at", order: "desc" } });
      if (error) {
        throw new Error(error.message);
      }
      return ((data ?? []) as Ficheiro[]).filter(
        (f) => f.name !== ".emptyFolderPlaceholder"
      );
    },
    queryKey: ["documentos", prefix],
  });

  const carregar = useMutation({
    mutationFn: async (file: File) => {
      const fileName = `${Date.now()}-${file.name.replace(/[^\w.-]+/gu, "_")}`;
      const { error } = await supabase.storage
        .from("documentos")
        .upload(`${prefix}/${fileName}`, file, { upsert: false });
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documentos", prefix] });
      toast.success("Ficheiro carregado");
    },
  });

  const apagar = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.storage
        .from("documentos")
        .remove([`${prefix}/${name}`]);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documentos", prefix] });
      toast.success("Ficheiro apagado");
    },
  });

  async function descarregarBlob(name: string) {
    const { data } = await supabase.storage
      .from("documentos")
      .download(`${prefix}/${name}`);
    if (!data) {
      toast.error("Não foi possível abrir o ficheiro");
      return null;
    }
    return URL.createObjectURL(data);
  }

  async function abrirNoSite(name: string) {
    const url = await descarregarBlob(name);
    if (url) {
      setVisualizar({ name, url });
    }
  }

  async function transferir(name: string) {
    const url = await descarregarBlob(name);
    if (!url) {
      return;
    }
    const a = document.createElement("a");
    a.href = url;
    a.download = name.replace(/^\d+-/u, "");
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }

  const eImagem = (name: string) => /\.(png|jpe?g|gif|webp|avif)$/iu.test(name);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
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
            <DialogTitle className="truncate text-2xl">
              {visualizar?.name.replace(/^\d+-/u, "")}
            </DialogTitle>
          </DialogHeader>
          {visualizar &&
            (eImagem(visualizar.name) ? (
              <img
                alt={`Documento ${visualizar.name.replace(/^\d+-/u, "")}`}
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
                    onClick={() => transferir(visualizar.name)}
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
