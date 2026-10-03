import { copyFile, writeFile } from "node:fs/promises";
import path from "node:path";

const out = path.resolve("dist-pages");
await copyFile(path.join(out, "index.pages.html"), path.join(out, "index.html")).catch(
  async () => {
    // Already named index.html
  },
);
await copyFile(path.join(out, "index.html"), path.join(out, "404.html"));
await writeFile(path.join(out, ".nojekyll"), "");
console.log("[pages] wrote index.html, 404.html, .nojekyll");
