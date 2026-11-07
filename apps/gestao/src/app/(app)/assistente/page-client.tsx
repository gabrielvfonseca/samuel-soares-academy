"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Bell, Send, Trash2 } from "@repo/ui/icons";
import { toast } from "@repo/ui/components/sonner";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Textarea } from "@repo/ui/components/textarea";
import { conversarAssistente, type MensagemChat } from "@/lib/actions/assistente";
import { useAuthedAction } from "@/lib/use-authed-action";
import { supabase } from "@/integrations/supabase/client";

type Lembrete = {
  id: string;
  texto: string;
  quando: string;
  enviado: boolean;
};

function AssistentePage() {
  const conversar = useAuthedAction(conversarAssistente);
  const qc = useQueryClient();
  const [mensagens, setMensagens] = useState<MensagemChat[]>([]);
  const [texto, setTexto] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fimRef = useRef<HTMLDivElement>(null);

  const lembretes = useQuery({
    queryKey: ["lembretes-pessoais"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lembretes_pessoais")
        .select("id, texto, quando, enviado")
        .order("quando");
      if (error) throw new Error(error.message);
      return (data ?? []) as Lembrete[];
    },
  });

  const enviar = useMutation({
    mutationFn: async (pergunta: string) => {
      const novas: MensagemChat[] = [...mensagens, { role: "user", content: pergunta }];
      setMensagens(novas);
      const r = await conversar(novas);
      return r.resposta;
    },
    onSuccess: (resposta) => {
      setMensagens((m) => [...m, { role: "assistant", content: resposta }]);
      void qc.invalidateQueries({ queryKey: ["lembretes-pessoais"] });
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => inputRef.current?.focus(),
  });

  const apagar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lembretes_pessoais").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["lembretes-pessoais"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, enviar.isPending]);

  function submeter() {
    const t = texto.trim();
    if (!t || enviar.isPending) return;
    setTexto("");
    enviar.mutate(t);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Assistente</h1>
        <p className="text-sm text-muted-foreground">
          Escreve como falarias: “lembra-me de ligar ao clube amanhã às 10h”. O aviso chega ao teu
          email à hora combinada.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="flex h-[70vh] flex-col">
          <CardContent className="flex-1 space-y-4 overflow-y-auto p-4">
            {mensagens.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Ainda não há mensagens. Experimenta: “lembra-me de enviar as faturas na sexta às
                18h”.
              </p>
            )}
            {mensagens.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                    m.role === "user" ? "bg-primary/15 text-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {enviar.isPending && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                  a escrever…
                </div>
              </div>
            )}
            <div ref={fimRef} />
          </CardContent>
          <div className="flex items-end gap-2 border-t border-border p-3">
            <Textarea
              ref={inputRef}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submeter();
                }
              }}
              placeholder="Escreve a tua mensagem…"
              className="min-h-[44px] resize-none"
            />
            <Button onClick={submeter} disabled={enviar.isPending || !texto.trim()}>
              <Send className="size-4" />
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="size-4" /> Lembretes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(lembretes.data ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">Sem lembretes agendados.</p>
            )}
            {(lembretes.data ?? []).map((l) => (
              <div
                key={l.id}
                className="flex items-start justify-between gap-2 rounded-md border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{l.texto}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(l.quando).toLocaleString("pt-PT", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {l.enviado ? " · enviado" : ""}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => apagar.mutate(l.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AssistentePage;
