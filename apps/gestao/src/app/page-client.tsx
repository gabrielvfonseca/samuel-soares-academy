"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "@repo/ui/components/sonner";
import { ShieldCheck, CalendarClock, BellRing } from "@repo/ui/icons";

import { supabase } from "@/integrations/supabase/client";
import { entrarComCodigo } from "@/lib/actions/acesso";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";

function Landing() {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const entrar = entrarComCodigo;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard");
    });
  }, [router]);

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await entrar({ codigo });
      if (!res.ok) {
        toast.error(res.erro);
        return;
      }
      const { error } = await supabase.auth.setSession({
        access_token: res.access_token,
        refresh_token: res.refresh_token,
      });
      if (error) throw error;
      router.replace("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ocorreu um erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="flex flex-col justify-center gap-8 px-8 py-16 lg:px-16">
        <img
          src={"/logo.svg"}
          alt="Emblema da Samuel Soares Academy — Escola de Guarda-Redes"
          className="size-28 rounded-full shadow-[0_0_60px_-10px] shadow-primary/40 md:size-36"
        />
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
          Samuel Soares Academy · Escola de Guarda-Redes
        </div>
        <h1 className="font-display text-6xl leading-none md:text-7xl">
          Gestão total dos <span className="text-primary">teus treinos</span>
        </h1>
        <p className="max-w-md text-muted-foreground">
          Agenda, calendário por treinador, gestão de atletas, contas da escola e lembretes diários
          enviados automaticamente.
        </p>
        <ul className="grid gap-4 text-sm">
          <li className="flex items-center gap-3">
            <CalendarClock className="size-5 text-primary" /> Calendário por mês, semana e dia
          </li>
          <li className="flex items-center gap-3">
            <BellRing className="size-5 text-primary" /> Lembretes automáticos à hora definida
          </li>
          <li className="flex items-center gap-3">
            <ShieldCheck className="size-5 text-primary" /> Acesso exclusivo à equipa interna
          </li>
        </ul>
      </section>

      <section className="flex items-center justify-center bg-card/40 px-6 py-16">
        <Card className="w-full max-w-sm border-border/60">
          <CardHeader>
            <CardTitle className="font-display text-3xl">Entrar</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submeter} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código de acesso interno</Label>
                <Input
                  id="codigo"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Plataforma interna da academia. O acesso é feito apenas com o código da equipa.
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "A entrar…" : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

export default Landing;
