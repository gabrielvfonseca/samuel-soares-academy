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
        className="min-h-screen flex flex-col items-center justify-center px-4 bg-white text-slate-900 antialiased"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <main className="max-w-md w-full text-center space-y-6">
          <p className="text-5xl font-bold text-red-600">Erro</p>
          <h1 className="text-xl font-semibold tracking-tight">
            Algo correu mal
          </h1>
          <p className="text-slate-600 text-sm">
            Ocorreu um erro inesperado. Tente novamente.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
          <p className="text-sm text-slate-500 pt-4">{BRAND_NAME}</p>
        </main>
      </body>
    </html>
  );
}
