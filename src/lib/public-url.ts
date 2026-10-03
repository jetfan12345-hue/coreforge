/** Prefix repo `public/` paths with the Vite base (Pages is `/coreforge/`). */
export function publicUrl(path: string): string {
  const normalizedPath = path.replace(/^\/+/, "");
  const mediaBase = import.meta.env.VITE_MEDIA_BASE;
  if (typeof mediaBase === "string" && mediaBase.length > 0) {
    const b = mediaBase.endsWith("/") ? mediaBase : `${mediaBase}/`;
    return `${b}${normalizedPath}`;
  }
  const base = import.meta.env.BASE_URL || "/";
  if (base === "./" || base === "." || base === "") {
    return `./${normalizedPath}`;
  }
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}${normalizedPath}`;
}

export function routerBasepath(): string {
  const base = import.meta.env.BASE_URL || "/";
  const trimmed = base.replace(/\/$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export const isPagesSpa = import.meta.env.VITE_PAGES === "true";
