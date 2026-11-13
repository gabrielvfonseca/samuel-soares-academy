"use client";

import { Button } from "@repo/ui/components/button";
import { Menu, X } from "@repo/ui/icons";
import Link from "next/link";
import { type JSX, useState } from "react";
import type { Header as HeaderData } from "@/models/header";
import { Logo } from "./logo";

interface HeaderClientProps {
  data: HeaderData;
}

export function HeaderClient({ data }: HeaderClientProps): JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const { nav, cta } = data;

  return (
    <header className="bg-background/95 border-border fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            className="text-foreground text-lg font-semibold tracking-tight"
            href="/"
          >
            <Logo size={45} />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {nav.map((link) => (
              <Link
                className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                href={link.href}
                key={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.querySelector(link.href);
                  if (target) {
                    target.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            <Button asChild>
              <a href="#contact">{cta}</a>
            </Button>
          </div>

          <button
            aria-label="Toggle menu"
            className="text-muted-foreground hover:text-foreground p-2 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
          >
            {mobileMenuOpen ? (
              <X className="size-6" />
            ) : (
              <Menu className="size-6" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-border border-t py-4 md:hidden">
            <nav className="flex flex-col gap-4">
              {nav.map((link) => (
                <Link
                  className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                  href={link.href}
                  key={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    const target = document.querySelector(link.href);
                    if (target) {
                      target.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <Button asChild className="mt-2 w-full">
                <Link href="#contact" onClick={() => setMobileMenuOpen(false)}>
                  {cta}
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
