"use client";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { toast } from "@repo/ui/components/sonner";
import { Textarea } from "@repo/ui/components/textarea";
import { Bell, Send, Trash2 } from "@repo/ui/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/data/client";
import {
  conversarAssistente,
  type MensagemChat,
} from "@/lib/actions/assistente";
import { useAuthedAction } from "@/lib/use-authed-action";

type ChatMessage = MensagemChat & { key: number };

interface Reminder {
  id: string;
  sent: boolean;
  text: string;
  when: string;
}

let chatKeyCounter = 0;

function AssistentePage() {
  const conversar = useAuthedAction(conversarAssistente);
  const qc = useQueryClient();
  const [mensagens, setMensagens] = useState<ChatMessage[]>([]);
  const [texto, setTexto] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fimRef = useRef<HTMLDivElement>(null);

  const lembretes = useQuery({
    queryFn: async () => {
      const { data, error } = await supabase
        .from("personal_reminders")
        .select("id, texto, quando, enviado")
        .order("quando");
      if (error) {
        throw new Error(error.message);
      }
      return (data ?? []) as Reminder[];
    },
    queryKey: ["lembretes-pessoais"],
  });

  const enviar = useMutation({
    mutationFn: async (pergunta: string) => {
      const novas: ChatMessage[] = [
        ...mensagens,
        { content: pergunta, key: ++chatKeyCounter, role: "user" },
      ];
      setMensagens(novas);
      const r = await conversar(novas);
      return r.resposta;
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => inputRef.current?.focus(),
    onSuccess: (resposta) => {
      setMensagens((m) => [
        ...m,
        { content: resposta, key: ++chatKeyCounter, role: "assistant" },
      ]);
      qc.invalidateQueries({ queryKey: ["lembretes-pessoais"] });
    },
  });

  const apagar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("personal_reminders")
        .delete()
        .eq("id", id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lembretes-pessoais"] });
    },
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  function submeter() {
    const t = texto.trim();
    if (!t || enviar.isPending) {
      return;
    }
    setTexto("");
    enviar.mutate(t);
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setTexto(e.target.value);
  }

  function handleTextareaKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submeter();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Assistente</h1>
        <p className="text-muted-foreground text-sm">
          Escreve como falarias: “lembra-me de ligar ao clube amanhã às 10h”. O
          aviso chega ao teu email à hora combinada.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="flex h-[70vh] flex-col">
          <CardContent className="flex-1 space-y-4 overflow-y-auto p-4">
            {mensagens.length === 0 && (
              <p className="text-muted-foreground text-sm">
                Ainda não há mensagens. Experimenta: “lembra-me de enviar as
                faturas na sexta às 18h”.
              </p>
            )}
            {mensagens.map((m) => (
              <div
                className={
                  m.role === "user" ? "flex justify-end" : "flex justify-start"
                }
                key={m.key}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-primary/15 text-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {enviar.isPending && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm">
                  a escrever…
                </div>
              </div>
            )}
            <div ref={fimRef} />
          </CardContent>
          <div className="border-border flex items-end gap-2 border-t p-3">
            <Textarea
              className="min-h-[44px] resize-none"
              onChange={handleTextareaChange}
              onKeyDown={handleTextareaKeyDown}
              placeholder="Escreve a tua mensagem…"
              ref={inputRef}
              value={texto}
            />
            <Button
              disabled={enviar.isPending || !texto.trim()}
              onClick={submeter}
            >
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
              <p className="text-muted-foreground text-sm">
                Sem lembretes agendados.
              </p>
            )}
            {(lembretes.data ?? []).map((l) => (
              <div
                className="border-border flex items-start justify-between gap-2 rounded-md border p-3"
                key={l.id}
              >
                <div>
                  <p className="text-sm font-medium">{l.text}</p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(l.when).toLocaleString("pt-PT", {
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      month: "short",
                      weekday: "short",
                    })}
                    {l.sent ? " · enviado" : ""}
                  </p>
                </div>
                <Button
                  onClick={() => apagar.mutate(l.id)}
                  size="icon"
                  variant="ghost"
                >
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
