/** Prefix repo `public/` paths with the Vite base (Pages is `/coreforge/`). */
export function publicUrl(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

export function routerBasepath(): string {
  const base = import.meta.env.BASE_URL || "/";
  const trimmed = base.replace(/\/$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export const isPagesSpa = import.meta.env.VITE_PAGES === "true";
