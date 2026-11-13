"use client";

import { Button } from "@repo/ui/components/button";
import {
  Bot,
  Building2,
  CalendarDays,
  Clock,
  Euro,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MapPin,
  Settings2,
  Sparkles,
  Users,
  Users2,
  Wallet,
} from "@repo/ui/icons";
import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: CalendarDays, label: "Calendário", to: "/calendario" },
  { icon: Users, label: "Treinadores", to: "/treinadores" },
  { icon: GraduationCap, label: "Alunos", to: "/alunos" },
  { icon: Users2, label: "Turmas", to: "/turmas" },
  { icon: Clock, label: "Horários", to: "/horarios" },
  { icon: MapPin, label: "Campos", to: "/campos" },
  { icon: Sparkles, label: "Vagas", to: "/ocupacao" },
  { icon: Building2, label: "Clubes", to: "/clubes" },
  { icon: Wallet, label: "Pagamentos", to: "/pagamentos" },
  { icon: Euro, label: "Contas", to: "/financas" },
  { icon: Bot, label: "Assistente", to: "/assistente" },
  { icon: Settings2, label: "Automações", to: "/definicoes" },
] as const;

function isActive(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

/** Client-side auth guard (the session lives in localStorage) + navigation chrome. */
export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data, error }) => {
      if (cancelled) {
        return;
      }
      if (error || !data.user) {
        router.replace("/");
      } else {
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="border-sidebar-border bg-sidebar hidden w-60 shrink-0 flex-col border-r p-4 md:flex">
        <div className="mb-8 flex items-center gap-3 px-2">
          <img
            alt="Emblema da Samuel Soares Academy"
            className="size-12 rounded-full"
            src="/logo.svg"
          />
          <div>
            <p className="font-display text-xl leading-none">
              SAMUEL SOARES <span className="text-gold">ACADEMY</span>
            </p>
            <p className="text-muted-foreground text-[10px] tracking-widest uppercase">
              Escola de guarda-redes
            </p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive(pathname, item.to)
                  ? "bg-primary/15 text-primary font-semibold"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-medium"
              )}
              href={item.to}
              key={item.to}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <Button
          className="justify-start gap-3"
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace("/");
          }}
          variant="ghost"
        >
          <LogOut className="size-4" /> Sair
        </Button>
      </aside>

      <div className="flex-1">
        <div className="border-border bg-sidebar flex gap-1 overflow-x-auto border-b p-2 md:hidden">
          {nav.map((item) => (
            <Link
              className={cn(
                "rounded-md px-3 py-2 text-xs whitespace-nowrap",
                isActive(pathname, item.to)
                  ? "bg-primary/15 text-primary font-semibold"
                  : "text-muted-foreground font-medium"
              )}
              href={item.to}
              key={item.to}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
