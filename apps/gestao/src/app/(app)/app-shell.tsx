"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  CalendarDays,
  LayoutDashboard,
  Users,
  Users2,
  GraduationCap,
  Settings2,
  LogOut,
  Wallet,
  Building2,
  Clock,
  Euro,
  MapPin,
  Sparkles,
  Bot,
} from "@repo/ui/icons";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/calendario", label: "Calendário", icon: CalendarDays },
  { to: "/treinadores", label: "Treinadores", icon: Users },
  { to: "/alunos", label: "Alunos", icon: GraduationCap },
  { to: "/turmas", label: "Turmas", icon: Users2 },
  { to: "/horarios", label: "Horários", icon: Clock },
  { to: "/campos", label: "Campos", icon: MapPin },
  { to: "/ocupacao", label: "Vagas", icon: Sparkles },
  { to: "/clubes", label: "Clubes", icon: Building2 },
  { to: "/pagamentos", label: "Pagamentos", icon: Wallet },
  { to: "/financas", label: "Contas", icon: Euro },
  { to: "/assistente", label: "Assistente", icon: Bot },
  { to: "/definicoes", label: "Automações", icon: Settings2 },
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
      if (cancelled) return;
      if (error || !data.user) router.replace("/");
      else setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 md:flex">
        <div className="mb-8 flex items-center gap-3 px-2">
          <img
            src="/logo.svg"
            alt="Emblema da Samuel Soares Academy"
            className="size-12 rounded-full"
          />
          <div>
            <p className="font-display text-xl leading-none">
              SAMUEL SOARES <span className="text-gold">ACADEMY</span>
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Escola de guarda-redes
            </p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.to}
              href={item.to}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive(pathname, item.to)
                  ? "bg-primary/15 font-semibold text-primary"
                  : "font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <Button
          variant="ghost"
          className="justify-start gap-3"
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace("/");
          }}
        >
          <LogOut className="size-4" /> Sair
        </Button>
      </aside>

      <div className="flex-1">
        <div className="flex gap-1 overflow-x-auto border-b border-border bg-sidebar p-2 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.to}
              href={item.to}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-2 text-xs",
                isActive(pathname, item.to)
                  ? "bg-primary/15 font-semibold text-primary"
                  : "font-medium text-muted-foreground",
              )}
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
