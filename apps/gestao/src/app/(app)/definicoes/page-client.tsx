"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "@repo/ui/components/sonner";
import { Send } from "@repo/ui/icons";

import { supabase } from "@/integrations/supabase/client";
import { getConfiguracao, listLembretes, listTreinadores } from "@/lib/gk";
import { enviarLembretesAgora } from "@/lib/actions/lembretes";
import { enviarResumoFaturasAgora } from "@/lib/actions/faturas";
import { enviarResumoOrdenadosAgora } from "@/lib/actions/ordenados";
import { enviarResumoMensalidadesAgora } from "@/lib/actions/mensalidades";
import { useAuthedAction } from "@/lib/use-authed-action";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";

function Definicoes() {
  const qc = useQueryClient();
  const config = useQuery({ queryKey: ["config"], queryFn: getConfiguracao });
  const historico = useQuery({ queryKey: ["historico"], queryFn: listLembretes });
  const treinadores = useQuery({ queryKey: ["treinadores"], queryFn: listTreinadores });
  const enviar = useAuthedAction(enviarLembretesAgora);
  const enviarFaturas = useAuthedAction(enviarResumoFaturasAgora);
  const enviarOrdenados = useAuthedAction(enviarResumoOrdenadosAgora);
  const enviarMensalidades = useAuthedAction(enviarResumoMensalidadesAgora);

  const [form, setForm] = useState({
    hora_envio_diario: "20:00",
    canal_preferencial: "Email",
    chave_api_resend: "",
    chave_api_whatsapp: "",
    whatsapp_phone_id: "",
    email_remetente: "",
  });

  useEffect(() => {
    const c = config.data;
    if (!c) return;
    setForm({
      hora_envio_diario: c.hora_envio_diario.slice(0, 5),
      canal_preferencial: c.canal_preferencial,
      chave_api_resend: c.chave_api_resend ?? "",
      chave_api_whatsapp: c.chave_api_whatsapp ?? "",
      whatsapp_phone_id: c.whatsapp_phone_id ?? "",
      email_remetente: c.email_remetente ?? "",
    });
  }, [config.data]);

  const guardar = useMutation({
    mutationFn: async () => {
      if (!config.data) return;
      const { error } = await supabase
        .from("configuracoes_notificacoes")
        .update({
          hora_envio_diario: form.hora_envio_diario,
          ...(form.hora_envio_diario !== config.data.hora_envio_diario.slice(0, 5)
            ? { ultimo_envio_data: null }
            : {}),
          canal_preferencial: form.canal_preferencial,
          chave_api_resend: form.chave_api_resend || null,
          chave_api_whatsapp: form.chave_api_whatsapp || null,
          whatsapp_phone_id: form.whatsapp_phone_id || null,
          email_remetente: form.email_remetente || null,
        } as never)
        .eq("id", config.data.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["config"] });
      toast.success("Definições guardadas");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const testar = useMutation({
    mutationFn: async () => await enviar(),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["historico"] });
      toast.success(
        `Execução concluída: ${r.enviados} envio(s), ${r.erros} erro(s), ${r.treinos} treino(s) de amanhã.`,
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const testarFaturas = useMutation({
    mutationFn: async () => await enviarFaturas(),
    onSuccess: (r) =>
      toast.success(
        `Resumo de faturas enviado (${r.mes}): ${r.total} fatura(s) em ${r.linhas} linha(s).`,
      ),
    onError: (e: Error) => toast.error(e.message),
  });

  const testarMensalidades = useMutation({
    mutationFn: async () => await enviarMensalidades(),
    onSuccess: (r) =>
      toast.success(
        `Resumo de mensalidades enviado (${r.mes}): ${r.emAtraso} em atraso, ${r.valorEmFalta.toFixed(2)} EUR em falta.`,
      ),
    onError: (e: Error) => toast.error(e.message),
  });

  const testarOrdenados = useMutation({
    mutationFn: async () => await enviarOrdenados(),
    onSuccess: (r) =>
      toast.success(
        `Resumo de ordenados enviado (${r.mes}): ${r.treinadores} treinador(es), total ${r.total.toFixed(2)} EUR.`,
      ),
    onError: (e: Error) => toast.error(e.message),
  });

  const nomeTreinador = (id: string | null) =>
    treinadores.data?.find((t) => t.id === id)?.nome ?? "—";

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-5xl leading-none">Automações</h1>
        <p className="text-muted-foreground">
          Lembretes diários aos treinadores e resumos mensais de faturas e ordenados, enviados no
          antepenúltimo e penúltimo dia de cada mês.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">Lembretes diários</CardTitle>
          <CardDescription>
            O sistema verifica a cada 5 minutos e dispara os envios à hora definida ou na primeira
            verificação seguinte (fuso {config.data?.fuso_horario ?? "Europe/Lisbon"}).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="hora">Hora de envio diário</Label>
            <Input
              id="hora"
              type="time"
              value={form.hora_envio_diario}
              onChange={(e) => setForm({ ...form, hora_envio_diario: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Canal preferencial</Label>
            <Select
              value={form.canal_preferencial}
              onValueChange={(v) => setForm({ ...form, canal_preferencial: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                <SelectItem value="Ambos">Ambos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="resend">Chave API Resend</Label>
            <Input
              id="resend"
              type="password"
              placeholder="re_..."
              value={form.chave_api_resend}
              onChange={(e) => setForm({ ...form, chave_api_resend: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="remetente">Email remetente</Label>
            <Input
              id="remetente"
              placeholder="treinos@aminhaescola.pt"
              value={form.email_remetente}
              onChange={(e) => setForm({ ...form, email_remetente: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wa">Token API WhatsApp</Label>
            <Input
              id="wa"
              type="password"
              value={form.chave_api_whatsapp}
              onChange={(e) => setForm({ ...form, chave_api_whatsapp: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="waid">WhatsApp Phone Number ID</Label>
            <Input
              id="waid"
              value={form.whatsapp_phone_id}
              onChange={(e) => setForm({ ...form, whatsapp_phone_id: e.target.value })}
            />
          </div>
          <div className="flex gap-2 md:col-span-2">
            <Button onClick={() => guardar.mutate()} disabled={guardar.isPending}>
              Guardar definições
            </Button>
            <Button variant="outline" onClick={() => testar.mutate()} disabled={testar.isPending}>
              <Send className="size-4" /> Enviar agora (teste)
            </Button>
            <Button
              variant="outline"
              onClick={() => testarFaturas.mutate()}
              disabled={testarFaturas.isPending}
            >
              <Send className="size-4" /> Testar resumo de faturas
            </Button>
            <Button
              variant="outline"
              onClick={() => testarOrdenados.mutate()}
              disabled={testarOrdenados.isPending}
            >
              <Send className="size-4" /> Testar resumo de ordenados
            </Button>
            <Button
              variant="outline"
              onClick={() => testarMensalidades.mutate()}
              disabled={testarMensalidades.isPending}
            >
              <Send className="size-4" /> Testar mensalidades em atraso
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">Histórico de envios</CardTitle>
          <CardDescription>Últimos 100 registos automáticos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Treinador</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Detalhe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(historico.data ?? []).map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(l.data_envio).toLocaleString("pt-PT")}
                  </TableCell>
                  <TableCell>{nomeTreinador(l.treinador_id)}</TableCell>
                  <TableCell>{l.canal}</TableCell>
                  <TableCell>
                    <Badge variant={l.estado_envio === "sucesso" ? "default" : "destructive"}>
                      {l.estado_envio}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-64 truncate text-muted-foreground">
                    {l.detalhe ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
              {(historico.data ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    Sem envios registados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default Definicoes;
