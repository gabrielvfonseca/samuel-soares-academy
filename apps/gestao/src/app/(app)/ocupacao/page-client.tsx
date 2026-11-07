"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CalendarCheck, MapPin, Sparkles, Users } from "@repo/ui/icons";
import { toast } from "@repo/ui/components/sonner";

import {
  DIAS_SEMANA,
  formatHoraSimples,
  horaDeMinutos,
  listCampos,
  listDisponibilidades,
  listDisponibilidadesCampos,
  listTreinadores,
  listTreinos,
  minutosDeHora,
} from "@/lib/gk";
import { sugerirMarcacoes } from "@/lib/actions/sugestoes";
import { useAuthedAction } from "@/lib/use-authed-action";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";

type Intervalo = { inicio: number; fim: number };

function intersectar(a: Intervalo, b: Intervalo): Intervalo | null {
  const inicio = Math.max(a.inicio, b.inicio);
  const fim = Math.min(a.fim, b.fim);
  return fim - inicio > 0 ? { inicio, fim } : null;
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
      if (o.inicio > r.inicio) novos.push({ inicio: r.inicio, fim: o.inicio });
      if (o.fim < r.fim) novos.push({ inicio: o.fim, fim: r.fim });
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

type Vaga = {
  data: string;
  diaSemana: string;
  campoId: string;
  campo: string;
  treinadorId: string;
  treinador: string;
  inicio: string;
  fim: string;
  minutos: number;
};

function Ocupacao() {
  const treinos = useQuery({ queryKey: ["treinos"], queryFn: listTreinos });
  const treinadores = useQuery({ queryKey: ["treinadores"], queryFn: listTreinadores });
  const dispTreinadores = useQuery({
    queryKey: ["disponibilidades"],
    queryFn: listDisponibilidades,
  });
  const campos = useQuery({ queryKey: ["campos"], queryFn: listCampos });
  const dispCampos = useQuery({
    queryKey: ["disponibilidades-campos"],
    queryFn: listDisponibilidadesCampos,
  });

  const [dias, setDias] = useState("14");
  const [filtroTreinador, setFiltroTreinador] = useState("todos");
  const [filtroCampo, setFiltroCampo] = useState("todos");
  const [duracao, setDuracao] = useState("60");
  const [sugestao, setSugestao] = useState<string | null>(null);
  const [aPensar, setAPensar] = useState(false);
  const chamarIA = useAuthedAction(sugerirMarcacoes);

  const vagas = useMemo<Vaga[]>(() => {
    if (!treinadores.data || !campos.data || !dispTreinadores.data || !dispCampos.data) return [];
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
        (t) => t.estado !== "Cancelado" && isoData(new Date(t.data_hora_inicio)) === dataIso,
      );
      const ocupadosPorTreinador = new Map<string, Intervalo[]>();
      const ocupadosPorCampo = new Map<string, Intervalo[]>();
      for (const t of treinosDoDia) {
        const ini = new Date(t.data_hora_inicio);
        const fim = new Date(t.data_hora_fim);
        const iv = {
          inicio: ini.getHours() * 60 + ini.getMinutes(),
          fim: fim.getHours() * 60 + fim.getMinutes(),
        };
        if (t.treinador_id) {
          ocupadosPorTreinador.set(t.treinador_id, [
            ...(ocupadosPorTreinador.get(t.treinador_id) ?? []),
            iv,
          ]);
        }
        const chaveCampo = normalizar(t.campo_local);
        if (chaveCampo) {
          ocupadosPorCampo.set(chaveCampo, [...(ocupadosPorCampo.get(chaveCampo) ?? []), iv]);
        }
      }

      for (const dt of dispTreinadores.data.filter((d) => d.dia_semana === w)) {
        const treinador = treinadores.data.find((t) => t.id === dt.treinador_id);
        if (!treinador || !treinador.ativo) continue;
        if (filtroTreinador !== "todos" && treinador.id !== filtroTreinador) continue;

        for (const dc of dispCampos.data.filter((d) => d.dia_semana === w)) {
          const campo = campos.data.find((c) => c.id === dc.campo_id);
          if (!campo || !campo.ativo) continue;
          if (filtroCampo !== "todos" && campo.id !== filtroCampo) continue;

          const comum = intersectar(
            { inicio: minutosDeHora(dt.hora_inicio), fim: minutosDeHora(dt.hora_fim) },
            { inicio: minutosDeHora(dc.hora_inicio), fim: minutosDeHora(dc.hora_fim) },
          );
          if (!comum) continue;

          const ocupados = [
            ...(ocupadosPorTreinador.get(treinador.id) ?? []),
            ...(ocupadosPorCampo.get(normalizar(campo.nome)) ?? []),
          ];
          for (const livre of subtrair(comum, ocupados)) {
            const minutos = livre.fim - livre.inicio;
            if (minutos < minDuracao) continue;
            lista.push({
              data: dataIso,
              diaSemana: DIAS_SEMANA[w] as string,
              campoId: campo.id,
              campo: campo.nome,
              treinadorId: treinador.id,
              treinador: treinador.nome,
              inicio: horaDeMinutos(livre.inicio),
              fim: horaDeMinutos(livre.fim),
              minutos,
            });
          }
        }
      }
    }
    return lista.sort((a, b) =>
      a.data === b.data ? a.inicio.localeCompare(b.inicio) : a.data.localeCompare(b.data),
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
    for (const v of vagas) mapa.set(v.data, [...(mapa.get(v.data) ?? []), v]);
    return [...mapa.entries()];
  }, [vagas]);

  const horasLivres = vagas.reduce((s, v) => s + v.minutos, 0) / 60;

  async function pedirSugestoes() {
    setAPensar(true);
    try {
      const res = await chamarIA({
        vagas: vagas.slice(0, 120).map((v) => ({
          data: v.data,
          diaSemana: v.diaSemana,
          campo: v.campo,
          treinador: v.treinador,
          inicio: v.inicio,
          fim: v.fim,
        })),
      });
      setSugestao(res.texto);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível gerar sugestões.");
    } finally {
      setAPensar(false);
    }
  }

  const semDados =
    (dispTreinadores.data ?? []).length === 0 || (dispCampos.data ?? []).length === 0;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-5xl leading-none">Vagas para marcação</h1>
        <p className="text-muted-foreground">
          Cruzamento entre a disponibilidade dos treinadores, a disponibilidade dos campos e os
          treinos já marcados.
        </p>
      </header>

      <Card>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Período</Label>
            <Select value={dias} onValueChange={setDias}>
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
            <Label>Treinador</Label>
            <Select value={filtroTreinador} onValueChange={setFiltroTreinador}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {(treinadores.data ?? []).map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Campo</Label>
            <Select value={filtroCampo} onValueChange={setFiltroCampo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {(campos.data ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Duração mínima</Label>
            <Select value={duracao} onValueChange={setDuracao}>
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
              Para ver vagas são precisos dois ingredientes: disponibilidade dos treinadores e
              disponibilidade dos campos.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" asChild>
                <Link href="/horarios">
                  <Users className="size-4" /> Disponibilidade dos treinadores
                </Link>
              </Button>
              <Button variant="secondary" asChild>
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
            <CardTitle className="flex items-center gap-2 font-display text-2xl">
              <Sparkles className="size-5" /> Sugestões inteligentes
            </CardTitle>
            <CardDescription>
              A inteligência artificial escolhe as melhores vagas para marcar treinos.
            </CardDescription>
          </div>
          <Button onClick={pedirSugestoes} disabled={aPensar || vagas.length === 0}>
            {aPensar ? "A analisar..." : "Sugerir marcações"}
          </Button>
        </CardHeader>
        {sugestao && (
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{sugestao}</p>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-2xl">
            <CalendarCheck className="size-5" /> {vagas.length} vagas livres ·{" "}
            {horasLivres.toFixed(1)}h
          </CardTitle>
          <CardDescription>Horas com treinador e campo livres, sem treino marcado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {porDia.map(([data, lista]) => (
            <div key={data} className="space-y-2">
              <p className="font-semibold">
                {new Date(`${data}T12:00:00`).toLocaleDateString("pt-PT", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                })}
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                {lista.map((v, i) => (
                  <div
                    key={`${data}-${i}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <span className="font-semibold">
                      {formatHoraSimples(v.inicio)} – {formatHoraSimples(v.fim)}
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
            <p className="text-sm text-muted-foreground">
              Sem vagas livres com estes filtros no período escolhido.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Ocupacao;
