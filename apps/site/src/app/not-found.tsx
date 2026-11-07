import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Provider } from "@/components/providers/provider";
import { BRAND_DESCRIPTION, BRAND_NAME } from "@/globals/constants";
import { createMetadata } from "@/lib/metadata";
import { createViewport } from "@/lib/viewport";

export const metadata: Metadata = createMetadata({
  description: BRAND_DESCRIPTION,
  title: `${BRAND_NAME} - Defende o teu futuro!`,
});

export const viewport: Viewport = createViewport({
  themeColor: "#ffffff",
});

export default function NotFound(): React.ReactElement {
  return (
    <Provider>
      <main className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <p className="text-muted-foreground/50 text-6xl font-bold">404</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Página não encontrada
          </h1>
          <p className="text-muted-foreground">
            A página que procura não existe ou foi movida.
          </p>
          <Link
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
            href="/"
          >
            Voltar ao início
          </Link>
          <p className="text-muted-foreground pt-4 text-sm">{BRAND_NAME}</p>
        </div>
      </main>
    </Provider>
  );
}
