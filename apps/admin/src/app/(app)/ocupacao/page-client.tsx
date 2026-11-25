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
import { Label } from "@ssa/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ssa/ui/components/select";
import { toast } from "@ssa/ui/components/sonner";
import { CalendarCheck, MapPin, Sparkles, Users } from "@ssa/ui/icons";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { sugerirMarcacoes } from "@/lib/actions/sugestoes";
import {
  DAY_NAMES,
  formatTimeShort,
  listAvailability,
  listCoaches,
  listFieldAvailability,
  listFields,
  listTrainings,
  minutesFromTime,
  timeFromMinutes,
} from "@/lib/gk";
import { useAuthedAction } from "@/lib/use-authed-action";

interface Intervalo {
  fim: number;
  inicio: number;
}

function intersectar(a: Intervalo, b: Intervalo): Intervalo | null {
  const inicio = Math.max(a.inicio, b.inicio);
  const fim = Math.min(a.fim, b.fim);
  return fim - inicio > 0 ? { fim, inicio } : null;
}

function subtrair(base: Intervalo, ocupados: Intervalo[]): Intervalo[] {
  let restos: Intervalo[] = [base];
  for (const o of ocupados) {
    const novos: Intervalo[] = [];
    for (const r of restos) {
      if (o.fim <= r.inicio || o.inicio >= r.fim) {
        novos.push(r);
        continue;
      }
      if (o.inicio > r.inicio) {
        novos.push({ fim: o.inicio, inicio: r.inicio });
      }
      if (o.fim < r.fim) {
        novos.push({ fim: r.fim, inicio: o.fim });
      }
    }
    restos = novos;
  }
  return restos;
}

function isoData(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function normalizar(v: string | null | undefined) {
  return (v ?? "").trim().toLowerCase();
}

interface Vaga {
  campo: string;
  coach_id: string;
  date: string;
  diaSemana: string;
  field_id: string;
  fim: string;
  inicio: string;
  minutos: number;
  treinador: string;
}

function Ocupacao() {
  const treinos = useQuery({ queryFn: listTrainings, queryKey: ["treinos"] });
  const treinadores = useQuery({
    queryFn: listCoaches,
    queryKey: ["treinadores"],
  });
  const dispTreinadores = useQuery({
    queryFn: listAvailability,
    queryKey: ["disponibilidades"],
  });
  const campos = useQuery({ queryFn: listFields, queryKey: ["campos"] });
  const dispCampos = useQuery({
    queryFn: listFieldAvailability,
    queryKey: ["disponibilidades-campos"],
  });

  const [dias, setDias] = useState("14");
  const [filtroTreinador, setFiltroTreinador] = useState("todos");
  const [filtroCampo, setFiltroCampo] = useState("todos");
  const [duracao, setDuracao] = useState("60");
  const [sugestao, setSugestao] = useState<string | null>(null);
  const [aPensar, setAPensar] = useState(false);
  const chamarIA = useAuthedAction(sugerirMarcacoes);

  const vagas = useMemo<Vaga[]>(() => {
    if (
      !(
        treinadores.data &&
        campos.data &&
        dispTreinadores.data &&
        dispCampos.data
      )
    ) {
      return [];
    }
    const minDuracao = Number(duracao);
    const lista: Vaga[] = [];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    for (let i = 0; i < Number(dias); i++) {
      const dia = new Date(hoje);
      dia.setDate(dia.getDate() + i);
      const w = dia.getDay();
      const dataIso = isoData(dia);

      const treinosDoDia = (treinos.data ?? []).filter(
        (t) =>
          t.status !== "Cancelled" &&
          isoData(new Date(t.start_date)) === dataIso
      );
      const ocupadosPorTreinador = new Map<string, Intervalo[]>();
      const ocupadosPorCampo = new Map<string, Intervalo[]>();
      for (const t of treinosDoDia) {
        const ini = new Date(t.start_date);
        const fim = new Date(t.end_date);
        const iv = {
          fim: fim.getHours() * 60 + fim.getMinutes(),
          inicio: ini.getHours() * 60 + ini.getMinutes(),
        };
        if (t.coach_id) {
          ocupadosPorTreinador.set(t.coach_id, [
            ...(ocupadosPorTreinador.get(t.coach_id) ?? []),
            iv,
          ]);
        }
        const chaveCampo = normalizar(t.field);
        if (chaveCampo) {
          ocupadosPorCampo.set(chaveCampo, [
            ...(ocupadosPorCampo.get(chaveCampo) ?? []),
            iv,
          ]);
        }
      }

      for (const dt of dispTreinadores.data.filter(
        (d) => d.day_of_week === w
      )) {
        const treinador = treinadores.data.find((t) => t.id === dt.coach_id);
        if (!treinador?.active) {
          continue;
        }
        if (filtroTreinador !== "todos" && treinador.id !== filtroTreinador) {
          continue;
        }

        for (const dc of dispCampos.data.filter((d) => d.day_of_week === w)) {
          const campo = campos.data.find((c) => c.id === dc.field_id);
          if (!campo?.active) {
            continue;
          }
          if (filtroCampo !== "todos" && campo.id !== filtroCampo) {
            continue;
          }

          const comum = intersectar(
            {
              fim: minutesFromTime(dt.end_time),
              inicio: minutesFromTime(dt.start_time),
            },
            {
              fim: minutesFromTime(dc.end_time),
              inicio: minutesFromTime(dc.start_time),
            }
          );
          if (!comum) {
            continue;
          }

          const ocupados = [
            ...(ocupadosPorTreinador.get(treinador.id) ?? []),
            ...(ocupadosPorCampo.get(normalizar(campo.name)) ?? []),
          ];
          for (const livre of subtrair(comum, ocupados)) {
            const minutos = livre.fim - livre.inicio;
            if (minutos < minDuracao) {
              continue;
            }
            lista.push({
              campo: campo.name,
              coach_id: treinador.id,
              date: dataIso,
              diaSemana: DAY_NAMES[w] as string,
              field_id: campo.id,
              fim: timeFromMinutes(livre.fim),
              inicio: timeFromMinutes(livre.inicio),
              minutos,
              treinador: treinador.name,
            });
          }
        }
      }
    }
    return lista.sort((a, b) =>
      a.date === b.date
        ? a.inicio.localeCompare(b.inicio)
        : a.date.localeCompare(b.date)
    );
  }, [
    treinos.data,
    treinadores.data,
    campos.data,
    dispTreinadores.data,
    dispCampos.data,
    dias,
    duracao,
    filtroTreinador,
    filtroCampo,
  ]);

  const porDia = useMemo(() => {
    const mapa = new Map<string, Vaga[]>();
    for (const v of vagas) {
      mapa.set(v.date, [...(mapa.get(v.date) ?? []), v]);
    }
    return [...mapa.entries()];
  }, [vagas]);

  const horasLivres = vagas.reduce((s, v) => s + v.minutos, 0) / 60;

  async function pedirSugestoes() {
    setAPensar(true);
    try {
      const res = await chamarIA({
        vagas: vagas.slice(0, 120).map((v) => ({
          campo: v.campo,
          date: v.date,
          diaSemana: v.diaSemana,
          fim: v.fim,
          inicio: v.inicio,
          treinador: v.treinador,
        })),
      });
      setSugestao(res.texto);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Não foi possível gerar sugestões."
      );
    } finally {
      setAPensar(false);
    }
  }

  const semDados =
    (dispTreinadores.data ?? []).length === 0 ||
    (dispCampos.data ?? []).length === 0;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-5xl leading-none">Vagas para marcação</h1>
        <p className="text-muted-foreground">
          Cruzamento entre a disponibilidade dos treinadores, a disponibilidade
          dos campos e os treinos já marcados.
        </p>
      </header>

      <Card>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Período</Label>
            <Select onValueChange={setDias} value={dias}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Próximos 7 dias</SelectItem>
                <SelectItem value="14">Próximos 14 dias</SelectItem>
                <SelectItem value="30">Próximos 30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Coach</Label>
            <Select onValueChange={setFiltroTreinador} value={filtroTreinador}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {(treinadores.data ?? []).map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Field</Label>
            <Select onValueChange={setFiltroCampo} value={filtroCampo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {(campos.data ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Duração mínima</Label>
            <Select onValueChange={setDuracao} value={duracao}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="90">1h30</SelectItem>
                <SelectItem value="120">2 horas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {semDados && (
        <Card className="border-primary/40">
          <CardContent className="space-y-2 pt-6 text-sm">
            <p>
              Para ver vagas são precisos dois ingredientes: disponibilidade dos
              treinadores e disponibilidade dos campos.
            </p>
            <div className="flex gap-2">
              <Button asChild variant="secondary">
                <Link href="/horarios">
                  <Users className="size-4" /> Availability dos treinadores
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/campos">
                  <MapPin className="size-4" /> Campos e horários
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="size-5" /> Sugestões inteligentes
            </CardTitle>
            <CardDescription>
              A inteligência artificial escolhe as melhores vagas para marcar
              treinos.
            </CardDescription>
          </div>
          <Button
            disabled={aPensar || vagas.length === 0}
            onClick={pedirSugestoes}
          >
            {aPensar ? "A analisar..." : "Sugerir marcações"}
          </Button>
        </CardHeader>
        {sugestao && (
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {sugestao}
            </p>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <CalendarCheck className="size-5" /> {vagas.length} vagas livres ·{" "}
            {horasLivres.toFixed(1)}h
          </CardTitle>
          <CardDescription>
            Horas com treinador e campo livres, sem treino marcado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {porDia.map(([data, lista]) => (
            <div className="space-y-2" key={data}>
              <p className="font-semibold">
                {new Date(`${data}T12:00:00`).toLocaleDateString("pt-PT", {
                  day: "2-digit",
                  month: "long",
                  weekday: "long",
                })}
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                {lista.map((v, i) => (
                  <div
                    className="border-border flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                    key={`${data}-${i}`}
                  >
                    <span className="font-semibold">
                      {formatTimeShort(v.inicio)} – {formatTimeShort(v.fim)}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        <MapPin className="mr-1 size-3" /> {v.campo}
                      </Badge>
                      <Badge>
                        <Users className="mr-1 size-3" /> {v.treinador}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {vagas.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Sem vagas livres com estes filtros no período escolhido.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Ocupacao;
