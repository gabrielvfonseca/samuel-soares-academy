"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
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
import { toast } from "@repo/ui/components/sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { Send } from "@repo/ui/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/data/client";
import { enviarResumoFaturasAgora } from "@/lib/actions/faturas";
import { enviarLembretesAgora } from "@/lib/actions/lembretes";
import { enviarResumoMensalidadesAgora } from "@/lib/actions/mensalidades";
import { enviarResumoOrdenadosAgora } from "@/lib/actions/ordenados";
import { getNotificationSettings, listCoaches, listReminders } from "@/lib/gk";
import { useAuthedAction } from "@/lib/use-authed-action";

function Definicoes() {
  const qc = useQueryClient();
  const config = useQuery({
    queryFn: getNotificationSettings,
    queryKey: ["config"],
  });
  const historico = useQuery({
    queryFn: listReminders,
    queryKey: ["historico"],
  });
  const treinadores = useQuery({
    queryFn: listCoaches,
    queryKey: ["treinadores"],
  });
  const enviar = useAuthedAction(enviarLembretesAgora);
  const enviarFaturas = useAuthedAction(enviarResumoFaturasAgora);
  const enviarOrdenados = useAuthedAction(enviarResumoOrdenadosAgora);
  const enviarMensalidades = useAuthedAction(enviarResumoMensalidadesAgora);

  const [form, setForm] = useState({
    daily_send_time: "20:00",
    from_email: "",
    preferred_channel: "Email" as "Email" | "WhatsApp" | "Both",
    resend_api_key: "",
    whatsapp_api_key: "",
    whatsapp_phone_id: "",
  });

  useEffect(() => {
    const c = config.data;
    if (!c) {
      return;
    }
    setForm({
      daily_send_time: c.daily_send_time.slice(0, 5),
      from_email: c.from_email ?? "",
      preferred_channel: c.preferred_channel,
      resend_api_key: c.resend_api_key ?? "",
      whatsapp_api_key: c.whatsapp_api_key ?? "",
      whatsapp_phone_id: c.whatsapp_phone_id ?? "",
    });
  }, [config.data]);

  const guardar = useMutation({
    mutationFn: async () => {
      if (!config.data) {
        return;
      }
      const { error } = await supabase
        .from("notification_settings")
        .update({
          daily_send_time: form.daily_send_time,
          ...(form.daily_send_time === config.data.daily_send_time.slice(0, 5)
            ? {}
            : { last_sent_date: null }),
          from_email: form.from_email || null,
          preferred_channel: form.preferred_channel,
          resend_api_key: form.resend_api_key || null,
          whatsapp_api_key: form.whatsapp_api_key || null,
          whatsapp_phone_id: form.whatsapp_phone_id || null,
        } as never)
        .eq("id", config.data.id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["config"] });
      toast.success("Definições guardadas");
    },
  });

  const testar = useMutation({
    mutationFn: async () => await enviar(),
    onError: (e: Error) => toast.error(e.message),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["historico"] });
      toast.success(
        `Execução concluída: ${r.enviados} envio(s), ${r.erros} erro(s), ${r.treinos} treino(s) de amanhã.`
      );
    },
  });

  const testarFaturas = useMutation({
    mutationFn: async () => await enviarFaturas(),
    onError: (e: Error) => toast.error(e.message),
    onSuccess: (r) =>
      toast.success(
        `Resumo de faturas enviado (${r.mes}): ${r.total} fatura(s) em ${r.linhas} linha(s).`
      ),
  });

  const testarMensalidades = useMutation({
    mutationFn: async () => await enviarMensalidades(),
    onError: (e: Error) => toast.error(e.message),
    onSuccess: (r) =>
      toast.success(
        `Resumo de mensalidades enviado (${r.mes}): ${r.emAtraso} em atraso, ${r.valorEmFalta.toFixed(2)} EUR em falta.`
      ),
  });

  const testarOrdenados = useMutation({
    mutationFn: async () => await enviarOrdenados(),
    onError: (e: Error) => toast.error(e.message),
    onSuccess: (r) =>
      toast.success(
        `Resumo de ordenados enviado (${r.mes}): ${r.treinadores} treinador(es), total ${r.total.toFixed(2)} EUR.`
      ),
  });

  const nomeTreinador = (id: string | null) =>
    treinadores.data?.find((t) => t.id === id)?.name ?? "—";

  function handleHoraChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, daily_send_time: e.target.value });
  }

  function handleCanalChange(v: string) {
    setForm({
      ...form,
      preferred_channel: v as "Email" | "WhatsApp" | "Both",
    });
  }

  function handleResendChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, resend_api_key: e.target.value });
  }

  function handleRemetenteChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, from_email: e.target.value });
  }

  function handleWaChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, whatsapp_api_key: e.target.value });
  }

  function handleWaidChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, whatsapp_phone_id: e.target.value });
  }

  function guardarDef() {
    guardar.mutate();
  }

  function testarEnvio() {
    testar.mutate();
  }

  function testarFaturasEnvio() {
    testarFaturas.mutate();
  }

  function testarOrdenadosEnvio() {
    testarOrdenados.mutate();
  }

  function testarMensalidadesEnvio() {
    testarMensalidades.mutate();
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-5xl leading-none">Automações</h1>
        <p className="text-muted-foreground">
          Lembretes diários aos treinadores e resumos mensais de faturas e
          ordenados, enviados no antepenúltimo e penúltimo dia de cada mês.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Lembretes diários</CardTitle>
          <CardDescription>
            O sistema verifica a cada 5 minutos e dispara os envios à hora
            definida ou na primeira verificação seguinte (fuso{" "}
            {config.data?.timezone ?? "Europe/Lisbon"}).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="hora">Hora de envio diário</Label>
            <Input
              id="hora"
              onChange={handleHoraChange}
              type="time"
              value={form.daily_send_time}
            />
            <div className="space-y-2">
              {/* biome-ignore lint/a11y/noLabelWithoutControl: Radix Select trigger has implicit label association */}
              <Label>Canal preferencial</Label>
              <Select
                onValueChange={handleCanalChange}
                value={form.preferred_channel}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="resend">Chave API Resend</Label>
            <Input
              id="resend"
              onChange={handleResendChange}
              placeholder="re_..."
              type="password"
              value={form.resend_api_key}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="remetente">Email remetente</Label>
            <Input
              id="remetente"
              onChange={handleRemetenteChange}
              placeholder="treinos@aminhaescola.pt"
              value={form.from_email}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wa">Token API WhatsApp</Label>
            <Input
              id="wa"
              onChange={handleWaChange}
              type="password"
              value={form.whatsapp_api_key}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="waid">WhatsApp Phone Number ID</Label>
            <Input
              id="waid"
              onChange={handleWaidChange}
              value={form.whatsapp_phone_id}
            />
          </div>
          <div className="flex gap-2 md:col-span-2">
            <Button disabled={guardar.isPending} onClick={guardarDef}>
              Guardar definições
            </Button>
            <Button
              disabled={testar.isPending}
              onClick={testarEnvio}
              variant="outline"
            >
              <Send className="size-4" /> Enviar agora (teste)
            </Button>
            <Button
              disabled={testarFaturas.isPending}
              onClick={testarFaturasEnvio}
              variant="outline"
            >
              <Send className="size-4" /> Testar resumo de faturas
            </Button>
            <Button
              disabled={testarOrdenados.isPending}
              onClick={testarOrdenadosEnvio}
              variant="outline"
            >
              <Send className="size-4" /> Testar resumo de ordenados
            </Button>
            <Button
              disabled={testarMensalidades.isPending}
              onClick={testarMensalidadesEnvio}
              variant="outline"
            >
              <Send className="size-4" /> Testar mensalidades em atraso
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Histórico de envios</CardTitle>
          <CardDescription>Últimos 100 registos automáticos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Coach</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Detalhe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(historico.data ?? []).map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(l.sent_at).toLocaleString("pt-PT")}
                  </TableCell>
                  <TableCell>{nomeTreinador(l.coach_id)}</TableCell>
                  <TableCell>{l.channel}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        l.status === "success" ? "default" : "destructive"
                      }
                    >
                      {l.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-64 truncate">
                    {l.detail ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
              {(historico.data ?? []).length === 0 && (
                <TableRow>
                  <TableCell className="text-muted-foreground" colSpan={5}>
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
