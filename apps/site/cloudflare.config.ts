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
      CONTACT_EMAIL_FROM: bindings.text("geral@samuelsoares.academy"),
      CONTACT_EMAIL_TO: bindings.text("ruijmorgadomarques@gmail.com"),
      IMAGES: bindings.images(),
      KV: bindings.kv({ id: "da9b99744fed4650a2c1240a3924e230" }),
      NEXT_PUBLIC_APP_URL: bindings.text("http://localhost:9000"),
      NEXT_PUBLIC_GA_MEASUREMENT_ID: bindings.text(""),
      RESEND_API_KEY: bindings.text(""),
      VINEXT_KV_CACHE: bindings.kv({
        id: "da9b99744fed4650a2c1240a3924e230",
      }),
      WHATSAPP_ACCESS_TOKEN: bindings.text(""),
      WHATSAPP_PHONE: bindings.text("+351912345678"),
      WHATSAPP_PHONE_NUMBER_ID: bindings.text(""),
    },
    name: "site",
  }),
});
