import { bindings, defineConfig, defineWorker } from "@cloudflare/config";

export default defineConfig({
  worker: defineWorker({
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    compatibilityDate: "2026-11-02",
    entrypoint: "vinext/server/fetch-handler",
    env: {
      ASSETS: bindings.assets(),
      // R2 bucket `documentos` is created once R2 is enabled on the SSA
      // account (free plan requires enabling R2 in the dashboard first).
      // The S3 credentials provided by the user are used to provision it.
      BUCKET: bindings.r2({
        name: "documentos",
      }),
      DB: bindings.d1({ id: "69ad2764-ee50-487e-8816-205fbd6b512f" }),
      // Secrets set in the CF dashboard after deploy (see migration docs).
      BETTER_AUTH_SECRET: bindings.text("ssa-admin-auth-secret-2026-0123456789abcdef"),
      BETTER_AUTH_URL: bindings.text("https://admin.ssa-916.workers.dev"),
      BETTER_AUTH_TRUSTED_ORIGINS: bindings.text(
        "https://admin.ssa-916.workers.dev,http://localhost:3101,http://localhost:3001,http://127.0.0.1:3101"
      ),
      CODIGO_ACESSO_INTERNO: bindings.text(""),
      LOVABLE_API_KEY: bindings.text(""),
      TREINOS_CRON_SECRET: bindings.text(""),
    },
    name: "admin",
  }),
});
