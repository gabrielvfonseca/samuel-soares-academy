import { cloudflare } from "@cloudflare/vite-plugin";
import vinext from "vinext";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    vinext(),
    cloudflare({
      inspectorPort: 9230,
      viteEnvironment: { childEnvironments: ["ssr"], name: "rsc" },
    }),
  ],
});
