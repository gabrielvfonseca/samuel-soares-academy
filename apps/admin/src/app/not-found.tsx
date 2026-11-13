import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-foreground text-7xl font-bold">404</h1>
        <h2 className="text-foreground mt-4 text-xl font-semibold">
          Página não encontrada
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          A página que procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
            href="/"
          >
            Ir para o início
          </Link>
        </div>
      </div>
    </div>
  );
}
