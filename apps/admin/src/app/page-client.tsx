"use client";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { toast } from "@repo/ui/components/sonner";
import { BellRing, CalendarClock, ShieldCheck } from "@repo/ui/icons";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { entrarComCodigo } from "@/lib/actions/acesso";

function Landing() {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const entrar = entrarComCodigo;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/dashboard");
      }
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
      if (error) {
        throw error;
      }
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
          alt="Emblema da Samuel Soares Academy — Escola de Guarda-Redes"
          className="shadow-primary/40 size-28 rounded-full shadow-[0_0_60px_-10px] md:size-36"
          src={"/logo.svg"}
        />
        <div className="border-gold/40 bg-gold/10 text-gold inline-flex w-fit items-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold tracking-widest uppercase">
          Samuel Soares Academy · Escola de Guarda-Redes
        </div>
        <h1 className="font-display text-6xl leading-none md:text-7xl">
          Gestão total dos <span className="text-primary">teus treinos</span>
        </h1>
        <p className="text-muted-foreground max-w-md">
          Agenda, calendário por treinador, gestão de atletas, contas da escola
          e lembretes diários enviados automaticamente.
        </p>
        <ul className="grid gap-4 text-sm">
          <li className="flex items-center gap-3">
            <CalendarClock className="text-primary size-5" /> Calendário por
            mês, semana e dia
          </li>
          <li className="flex items-center gap-3">
            <BellRing className="text-primary size-5" /> Lembretes automáticos à
            hora definida
          </li>
          <li className="flex items-center gap-3">
            <ShieldCheck className="text-primary size-5" /> Acesso exclusivo à
            equipa interna
          </li>
        </ul>
      </section>

      <section className="bg-card/40 flex items-center justify-center px-6 py-16">
        <Card className="border-border/60 w-full max-w-sm">
          <CardHeader>
            <CardTitle className="font-display text-3xl">Entrar</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submeter}>
              <div className="space-y-2">
                <Label htmlFor="codigo">Código de acesso interno</Label>
                <Input
                  autoComplete="current-password"
                  id="codigo"
                  onChange={(e) => setCodigo(e.target.value)}
                  required
                  type="password"
                  value={codigo}
                />
                <p className="text-muted-foreground text-xs">
                  Plataforma interna da academia. O acesso é feito apenas com o
                  código da equipa.
                </p>
              </div>
              <Button className="w-full" disabled={loading} type="submit">
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
