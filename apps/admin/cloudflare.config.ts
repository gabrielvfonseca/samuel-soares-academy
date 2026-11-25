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
      // Secrets set in the CF dashboard after deploy (see migration docs).
      // BETTER_AUTH_SECRET must be 32+ random chars — generate with
      // `openssl rand -hex 32`. Never commit a real value here.
      BETTER_AUTH_SECRET: bindings.text(""),
      BETTER_AUTH_TRUSTED_ORIGINS: bindings.text(
        "https://admin.ssa-916.workers.dev,http://localhost:9001,http://127.0.0.1:9001"
      ),
      BETTER_AUTH_URL: bindings.text("https://admin.ssa-916.workers.dev"),
      // R2 bucket `documentos` is created once R2 is enabled on the SSA
      // account (free plan requires enabling R2 in the dashboard first).
      // The S3 credentials provided by the user are used to provision it.
      BUCKET: bindings.r2({
        name: "documentos",
      }),
      CRON_SECRET: bindings.text(""),
      DB: bindings.d1({ id: "69ad2764-ee50-487e-8816-205fbd6b512f" }),
      INTERNAL_ACCESS_CODE: bindings.text(""),
      LOVABLE_API_KEY: bindings.text(""),
    },
    name: "admin",
    // Cron schedules (UTC) — invoked by an external scheduler that POSTs to
    // /api/public/cron/*. Each endpoint is protected by CRON_SECRET
    // (see src/lib/cron-route.ts). The vinext worker entry only exposes
    // `fetch()`, so Cloudflare Cron Triggers (which invoke a `scheduled()`
    // handler) cannot target these routes directly. Use an external scheduler
    // (e.g., a CF Worker with a `scheduled()` handler, GitHub Actions cron,
    // or similar) to POST to each endpoint with a Bearer token.
    //   ordenados          0 5 * * *
    //   faturas            0 6 1 * *
    //   mensalidades       30 6 1 * *
    //   lembretes          0 7 * * *
    //   lembretes-pessoais 15 7 * * *
  }),
});
