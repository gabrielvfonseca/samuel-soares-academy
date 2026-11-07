"use client";

import { useEffect } from "react";
import { BRAND_NAME } from "@/globals/constants";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="pt" suppressHydrationWarning>
      <body
        className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-slate-900 antialiased"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <main className="w-full max-w-md space-y-6 text-center">
          <p className="text-5xl font-bold">Erro</p>
          <h1 className="text-xl font-semibold tracking-tight">
            Algo correu mal
          </h1>
          <p className="text-sm text-slate-600">
            Ocorreu um erro inesperado. Tente novamente.
          </p>
          <button
            className="inline-flex items-center justify-center"
            onClick={() => reset()}
            type="button"
          >
            Tentar novamente
          </button>
          <p className="pt-4 text-sm text-slate-500">{BRAND_NAME}</p>
        </main>
      </body>
    </html>
  );
}
