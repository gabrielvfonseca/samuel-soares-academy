"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          Esta página não carregou
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Algo correu mal. Pode tentar novamente ou voltar ao início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
            onClick={() => reset()}
          >
            Tentar novamente
          </button>
          <a
            className="border-input bg-background text-foreground hover:bg-accent inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors"
            href="/"
          >
            Ir para o início
          </a>
        </div>
      </div>
    </div>
  );
}
