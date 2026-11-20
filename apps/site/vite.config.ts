import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { cloudflare } from "@cloudflare/vite-plugin";
import vinext from "vinext";
import { defineConfig, type Plugin } from "vite";

const uiRequire = createRequire(
  new URL("../../packages/ui/package.json", import.meta.url)
);

/**
 * next-themes is a dependency of @repo/ui, not of this app. In the rsc
 * environment Vite's dep optimizer injects a `?v=<browserHash>` query string
 * into node_modules file paths during resolution. The Cloudflare worker
 * runner then tries to import() that path with the query string still
 * attached, causing ENOENT at dev-server boot.
 *
 * If we externalize next-themes the worker does a bare runtime
 * `import("next-themes")`, which resolves to its own peer copy of React and
 * breaks the React dispatcher ("Cannot read properties of null (reading
 * 'useContext')").
 *
 * The fix: resolve next-themes to its absolute ESM file path AND let Vite
 * bundle it inline. No bare specifier survives into the worker, so the
 * dep-optimizer query-string issue disappears and next-themes shares the
 * app's single React copy.
 */
function inlineNextThemes(): Plugin {
  let resolvedPath: string | null = null;
  return {
    enforce: "pre",
    name: "inline-next-themes",
    resolveId(id) {
      const cleanId = id.split("?")[0] ?? id;
      if (cleanId !== "next-themes") {
        return null;
      }
      if (!resolvedPath) {
        const cjsMain = uiRequire
          .resolve("next-themes")
          .replace(/[?#].*$/u, "");
        const mjsFile = cjsMain.replace(/\.js$/u, ".mjs");
        resolvedPath = existsSync(mjsFile) ? mjsFile : cjsMain;
      }
      // No `external` flag: Vite bundles this file into the worker.
      return { id: resolvedPath };
    },
  };
}

export default defineConfig({
  plugins: [
    vinext(),
    cloudflare({
      viteEnvironment: { childEnvironments: ["ssr"], name: "rsc" },
    }),
    inlineNextThemes(),
  ],
});
