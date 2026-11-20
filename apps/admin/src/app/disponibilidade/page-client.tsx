"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
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
import { Plus, Send, Trash2 } from "@repo/ui/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/data/client";
import {
  DAY_NAMES,
  formatTimeShort,
  listAvailability,
  listCoaches,
} from "@/lib/gk";

interface Slot {
  day_of_week: number;
  end_time: string;
  start_time: string;
}

function DisponibilidadePublica() {
  const qc = useQueryClient();
  const { data: treinadores } = useQuery({
    queryFn: listCoaches,
    queryKey: ["treinadores"],
  });
  const { data: disp } = useQuery({
    queryFn: listAvailability,
    queryKey: ["disponibilidades"],
  });

  const [treinadorId, setTreinadorId] = useState("");
  const [diaSemana, setDiaSemana] = useState("1");
  const [horaInicio, setHoraInicio] = useState("18:00");
  const [horaFim, setHoraFim] = useState("19:00");
  const [notas, setNotas] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);

  const minhas = (disp ?? []).filter((d) => d.coach_id === treinadorId);

  const adicionarSlot = () => {
    if (!treinadorId) {
      toast.error("Escolhe primeiro o teu nome.");
      return;
    }
    if (horaFim <= horaInicio) {
      toast.error("A hora de fim tem de ser depois do início.");
      return;
    }
    const dia = Number(diaSemana);
    if (
      slots.some(
        (s) =>
          s.day_of_week === dia &&
          s.start_time === horaInicio &&
          s.end_time === horaFim
      )
    ) {
      toast.error("Esse horário já está na lista.");
      return;
    }
    setSlots([
      ...slots,
      { day_of_week: dia, end_time: horaFim, start_time: horaInicio },
    ]);
  };

  const slotsPorDia = DAY_NAMES.map((nome, i) => ({
    dia: i,
    items: slots
      .map((s, idx) => ({ ...s, idx }))
      .filter((s) => s.day_of_week === i)
      .sort((a, b) => a.start_time.localeCompare(b.start_time)) as (Slot & {
      idx: number;
    })[],
    nome,
  })).filter((g) => g.items.length > 0);

  const enviar = useMutation({
    mutationFn: async () => {
      if (!treinadorId) {
        throw new Error("Escolhe o teu nome.");
      }
      if (slots.length === 0) {
        throw new Error("Adiciona pelo menos um horário.");
      }
      const { error } = await supabase.from("availability").insert(
        slots.map((s) => ({
          coach_id: treinadorId,
          day_of_week: s.day_of_week,
          end_time: s.end_time,
          notes: notas || null,
          start_time: s.start_time,
        })) as never
      );
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      toast.success("Availability enviada. Obrigado!");
      setSlots([]);
      setNotas("");
      qc.invalidateQueries({ queryKey: ["disponibilidades"] });
    },
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-8 flex items-center gap-3">
        <img
          alt="Emblema da Samuel Soares Academy"
          className="size-14 rounded-full"
          src={"/logo.svg"}
        />
        <div>
          <h1 className="text-2xl leading-none">
            SAMUEL SOARES <span className="text-foreground">ACADEMY</span>
          </h1>
          <p className="text-muted-foreground text-xs tracking-widest uppercase">
            Availability semanal
          </p>
        </div>
      </header>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl tracking-wide">1. Quem és?</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={setTreinadorId} value={treinadorId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolhe o teu nome" />
              </SelectTrigger>
              <SelectContent>
                {(treinadores ?? []).map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl tracking-wide">
              2. Adiciona os teus horários
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Dia da semana</Label>
                <Select onValueChange={setDiaSemana} value={diaSemana}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_NAMES.map((d, i) => (
                      <SelectItem key={d} value={String(i)}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Início</Label>
                <Input
                  onChange={(e) => setHoraInicio(e.target.value)}
                  type="time"
                  value={horaInicio}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Fim</Label>
                <Input
                  onChange={(e) => setHoraFim(e.target.value)}
                  type="time"
                  value={horaFim}
                />
              </div>
            </div>
            <Button
              className="w-full"
              onClick={adicionarSlot}
              variant="secondary"
            >
              <Plus className="size-4" /> Adicionar à lista
            </Button>

            {slotsPorDia.length > 0 && (
              <div className="border-border space-y-2 rounded-md border p-3">
                <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                  A tua semana ({slots.length}{" "}
                  {slots.length === 1 ? "horário" : "horários"})
                </p>
                {slotsPorDia.map((g) => (
                  <div
                    className="flex flex-wrap items-center gap-2"
                    key={g.dia}
                  >
                    <span className="w-24 text-sm font-medium">{g.nome}</span>
                    {g.items.map((s) => (
                      <Badge
                        className="gap-1.5"
                        key={s.idx}
                        variant="secondary"
                      >
                        {formatTimeShort(s.start_time)} –{" "}
                        {formatTimeShort(s.end_time)}
                        <button
                          aria-label="Remover horário"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            setSlots(slots.filter((_, i) => i !== s.idx))
                          }
                          type="button"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl tracking-wide">3. Enviar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Notas (opcional)</Label>
              <Textarea
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ex.: só disponível de 15 em 15 dias"
                value={notas}
              />
            </div>
            <Button
              className="w-full"
              disabled={enviar.isPending || slots.length === 0}
              onClick={() => enviar.mutate()}
            >
              <Send className="size-4" /> Enviar disponibilidade ({slots.length}
              )
            </Button>
          </CardContent>
        </Card>

        {treinadorId && minhas.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-lg tracking-wide">Já registaste</h2>
            {minhas.map((d) => (
              <div
                className="border-border flex items-center justify-between rounded-md border p-3"
                key={d.id}
              >
                <span className="text-sm font-medium">
                  {DAY_NAMES[d.day_of_week]} · {formatTimeShort(d.start_time)} –{" "}
                  {formatTimeShort(d.end_time)}
                </span>
                {d.notes && <Badge variant="secondary">{d.notes}</Badge>}
              </div>
            ))}
            <p className="text-muted-foreground text-xs">
              Para corrigir ou remover um horário, fala com a organização.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

export default DisponibilidadePublica;
