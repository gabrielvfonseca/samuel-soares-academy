import "@/styles/globals.css";
import Link from "next/link";
import type { Metadata, Viewport } from "next";
import { Provider } from "@/components/providers/provider";
import { BRAND_DESCRIPTION, BRAND_NAME } from "@/globals/constants";
import { fonts } from "@/lib/fonts";
import { createMetadata } from "@/lib/metadata";
import { createViewport } from "@/lib/viewport";

export const metadata: Metadata = createMetadata({
  title: `${BRAND_NAME} - Defende o teu futuro!`,
  description: BRAND_DESCRIPTION,
});

export const viewport: Viewport = createViewport({
  themeColor: "#ffffff",
});

export default function NotFound(): React.ReactElement {
  return (
    <Provider>
      <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-background text-foreground">
        <div className="max-w-md w-full text-center space-y-6">
          <p className="text-6xl font-bold text-muted-foreground/50">404</p>
          <h1 className="text-2xl font-semibold tracking-tight">Página não encontrada</h1>
          <p className="text-muted-foreground">A página que procura não existe ou foi movida.</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Voltar ao início
          </Link>
          <p className="text-sm text-muted-foreground pt-4">{BRAND_NAME}</p>
        </div>
      </main>
    </Provider>
  );
}
