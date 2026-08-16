import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

const root = path.dirname(fileURLToPath(import.meta.url));

function pagesSpaFallback(): Plugin {
  return {
    name: "coreforge-pages-fallback",
    closeBundle: {
      sequential: true,
      async handler() {
        const { copyFile, writeFile } = await import("node:fs/promises");
        const out = path.join(root, "dist-pages");
        await copyFile(path.join(out, "index.pages.html"), path.join(out, "index.html"));
        await copyFile(path.join(out, "index.html"), path.join(out, "404.html"));
        await writeFile(path.join(out, ".nojekyll"), "");
      },
    },
  };
}

/**
 * Static SPA for GitHub Pages at /coreforge/.
 * Relative base so the same build also works on a CDN (jsDelivr / statically)
 * before project Pages is enabled, and still resolves under
 * https://jetfan12345-hue.github.io/coreforge/ once Pages is on.
 * Does not use nitro / TanStack Start SSR — `npm run dev` and `npm run build` stay as they are.
 */
export default defineConfig({
  base: "./",
  publicDir: path.join(root, "public"),
  envPrefix: ["VITE_"],
  define: {
    "import.meta.env.VITE_PAGES": JSON.stringify("true"),
  },
  resolve: {
    tsconfigPaths: true,
    alias: { "@": path.join(root, "src") },
  },
  plugins: [
    tanstackRouter({
      target: "react",
      routesDirectory: path.join(root, "src/routes"),
      generatedRouteTree: path.join(root, "src/routeTree.gen.ts"),
      autoCodeSplitting: true,
    }),
    tailwindcss(),
    viteReact(),
    pagesSpaFallback(),
  ],
  build: {
    outDir: path.join(root, "dist-pages"),
    emptyOutDir: true,
    rollupOptions: {
      input: path.join(root, "index.pages.html"),
    },
  },
});
