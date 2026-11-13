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
import { supabase } from "@/integrations/supabase/client";
import { enviarResumoFaturasAgora } from "@/lib/actions/faturas";
import { enviarLembretesAgora } from "@/lib/actions/lembretes";
import { enviarResumoMensalidadesAgora } from "@/lib/actions/mensalidades";
import { enviarResumoOrdenadosAgora } from "@/lib/actions/ordenados";
import { getConfiguracao, listLembretes, listTreinadores } from "@/lib/gk";
import { useAuthedAction } from "@/lib/use-authed-action";

function Definicoes() {
  const qc = useQueryClient();
  const config = useQuery({ queryFn: getConfiguracao, queryKey: ["config"] });
  const historico = useQuery({
    queryFn: listLembretes,
    queryKey: ["historico"],
  });
  const treinadores = useQuery({
    queryFn: listTreinadores,
    queryKey: ["treinadores"],
  });
  const enviar = useAuthedAction(enviarLembretesAgora);
  const enviarFaturas = useAuthedAction(enviarResumoFaturasAgora);
  const enviarOrdenados = useAuthedAction(enviarResumoOrdenadosAgora);
  const enviarMensalidades = useAuthedAction(enviarResumoMensalidadesAgora);

  const [form, setForm] = useState({
    canal_preferencial: "Email",
    chave_api_resend: "",
    chave_api_whatsapp: "",
    email_remetente: "",
    hora_envio_diario: "20:00",
    whatsapp_phone_id: "",
  });

  useEffect(() => {
    const c = config.data;
    if (!c) {
      return;
    }
    setForm({
      canal_preferencial: c.canal_preferencial,
      chave_api_resend: c.chave_api_resend ?? "",
      chave_api_whatsapp: c.chave_api_whatsapp ?? "",
      email_remetente: c.email_remetente ?? "",
      hora_envio_diario: c.hora_envio_diario.slice(0, 5),
      whatsapp_phone_id: c.whatsapp_phone_id ?? "",
    });
  }, [config.data]);

  const guardar = useMutation({
    mutationFn: async () => {
      if (!config.data) {
        return;
      }
      const { error } = await supabase
        .from("configuracoes_notificacoes")
        .update({
          hora_envio_diario: form.hora_envio_diario,
          ...(form.hora_envio_diario ===
          config.data.hora_envio_diario.slice(0, 5)
            ? {}
            : { ultimo_envio_data: null }),
          canal_preferencial: form.canal_preferencial,
          chave_api_resend: form.chave_api_resend || null,
          chave_api_whatsapp: form.chave_api_whatsapp || null,
          email_remetente: form.email_remetente || null,
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
    treinadores.data?.find((t) => t.id === id)?.nome ?? "—";

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-5xl leading-none">Automações</h1>
        <p className="text-muted-foreground">
          Lembretes diários aos treinadores e resumos mensais de faturas e
          ordenados, enviados no antepenúltimo e penúltimo dia de cada mês.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">
            Lembretes diários
          </CardTitle>
          <CardDescription>
            O sistema verifica a cada 5 minutos e dispara os envios à hora
            definida ou na primeira verificação seguinte (fuso{" "}
            {config.data?.fuso_horario ?? "Europe/Lisbon"}).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="hora">Hora de envio diário</Label>
            <Input
              id="hora"
              onChange={(e) =>
                setForm({ ...form, hora_envio_diario: e.target.value })
              }
              type="time"
              value={form.hora_envio_diario}
            />
          </div>
          <div className="space-y-2">
            <Label>Canal preferencial</Label>
            <Select
              onValueChange={(v) => setForm({ ...form, canal_preferencial: v })}
              value={form.canal_preferencial}
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
              onChange={(e) =>
                setForm({ ...form, chave_api_resend: e.target.value })
              }
              placeholder="re_..."
              type="password"
              value={form.chave_api_resend}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="remetente">Email remetente</Label>
            <Input
              id="remetente"
              onChange={(e) =>
                setForm({ ...form, email_remetente: e.target.value })
              }
              placeholder="treinos@aminhaescola.pt"
              value={form.email_remetente}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wa">Token API WhatsApp</Label>
            <Input
              id="wa"
              onChange={(e) =>
                setForm({ ...form, chave_api_whatsapp: e.target.value })
              }
              type="password"
              value={form.chave_api_whatsapp}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="waid">WhatsApp Phone Number ID</Label>
            <Input
              id="waid"
              onChange={(e) =>
                setForm({ ...form, whatsapp_phone_id: e.target.value })
              }
              value={form.whatsapp_phone_id}
            />
          </div>
          <div className="flex gap-2 md:col-span-2">
            <Button
              disabled={guardar.isPending}
              onClick={() => guardar.mutate()}
            >
              Guardar definições
            </Button>
            <Button
              disabled={testar.isPending}
              onClick={() => testar.mutate()}
              variant="outline"
            >
              <Send className="size-4" /> Enviar agora (teste)
            </Button>
            <Button
              disabled={testarFaturas.isPending}
              onClick={() => testarFaturas.mutate()}
              variant="outline"
            >
              <Send className="size-4" /> Testar resumo de faturas
            </Button>
            <Button
              disabled={testarOrdenados.isPending}
              onClick={() => testarOrdenados.mutate()}
              variant="outline"
            >
              <Send className="size-4" /> Testar resumo de ordenados
            </Button>
            <Button
              disabled={testarMensalidades.isPending}
              onClick={() => testarMensalidades.mutate()}
              variant="outline"
            >
              <Send className="size-4" /> Testar mensalidades em atraso
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">
            Histórico de envios
          </CardTitle>
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
                    <Badge
                      variant={
                        l.estado_envio === "sucesso" ? "default" : "destructive"
                      }
                    >
                      {l.estado_envio}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-64 truncate">
                    {l.detalhe ?? "—"}
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
