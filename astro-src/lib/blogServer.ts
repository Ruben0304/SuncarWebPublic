// Blog para el frontmatter de los .astro (solo servidor). Mismas llamadas
// que antes hacía el navegador, ahora con una caché corta compartida: el HTML
// sale ya con los artículos y Google no ve un esqueleto vacío.
import { getBackendUrl } from "@/lib/backend-url";
import { memo } from "@/lib/memo";
import type { BlogDetalle, BlogListadoItem } from "./blog";

const TTL_MS = 60_000;
const LIMITE_MS = 5000;

async function pedir(ruta: string): Promise<{ success?: boolean; data?: unknown } | null> {
  try {
    const respuesta = await fetch(`${getBackendUrl()}${ruta}`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(LIMITE_MS),
    });
    if (respuesta.status === 404) return { success: false };
    if (!respuesta.ok) return null;
    return await respuesta.json();
  } catch {
    return null;
  }
}

/** null = el backend no respondió (la isla lo pide desde el navegador). */
export function obtenerBlogs(): Promise<BlogListadoItem[] | null> {
  return memo("blog:lista", TTL_MS, async () => {
    const r = await pedir("/api/blog/");
    return r?.success && Array.isArray(r.data) ? (r.data as BlogListadoItem[]) : null;
  });
}

export type ResultadoBlog = { estado: "ok"; blog: BlogDetalle } | { estado: "no_existe" };

/**
 * null = el backend no respondió. "no_existe" = respondió que ese slug no está
 * publicado (el backend lo devuelve como 200 con success:false): eso sí es un
 * 404 y se cachea para que un slug inventado no golpee al backend cada vez.
 *
 * Ojo: el backend suma una visita en cada GET del detalle; con la caché de un
 * minuto, un artículo suma como mucho una por minuto.
 */
export function obtenerBlog(slug: string): Promise<ResultadoBlog | null> {
  return memo(`blog:${slug}`, TTL_MS, async () => {
    const r = await pedir(`/api/blog/${encodeURIComponent(slug)}`);
    if (!r) return null;
    if (r.success && r.data) return { estado: "ok" as const, blog: r.data as BlogDetalle };
    return { estado: "no_existe" as const };
  });
}
