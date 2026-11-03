import { getBackendUrl } from "@/lib/backend-url";
import { memo } from "@/lib/memo";
import type { ArticuloTienda, CatalogoWebResponse } from "@/types/tienda";

/**
 * Equivalente de servidor de hooks/useCatalogoWeb.ts (que solo corre en el
 * navegador). No hay endpoint de detalle por producto en el backend, así que
 * una ficha de producto también trae el catálogo completo y busca su id ahí
 * — igual de caro que la casa interactiva hoy, que hace lo mismo al abrir
 * una zona.
 */

const CATALOGO_PAGE_SIZE = 200;
const MAX_CATALOGO_PAGES = 10;
const REVALIDAR_SEGUNDOS = 60;

async function pedirPagina(page: number, provincia: string | null): Promise<CatalogoWebResponse | null> {
  try {
    const params = new URLSearchParams();
    if (provincia) params.set("provincia", provincia);
    params.set("page", String(page));
    params.set("limit", String(CATALOGO_PAGE_SIZE));

    const respuesta = await fetch(
      `${getBackendUrl()}/api/productos/catalogo-web?${params}`,
      {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(8000),
        next: { revalidate: REVALIDAR_SEGUNDOS },
      },
    );
    if (!respuesta.ok) return null;
    return (await respuesta.json()) as CatalogoWebResponse;
  } catch {
    return null;
  }
}

/** Catálogo nacional (sin filtrar por provincia): el que ve un buscador. */
export async function obtenerCatalogoWebPublico(): Promise<ArticuloTienda[]> {
  // Un catálogo vacío no se guarda (memo ignora null): se reintenta en la próxima.
  return (await memo("catalogo-web", REVALIDAR_SEGUNDOS * 1000, async () => {
    const articulos = await traerCatalogo();
    return articulos.length ? articulos : null;
  })) ?? [];
}

async function traerCatalogo(): Promise<ArticuloTienda[]> {
  const primera = await pedirPagina(1, null);
  if (!primera?.success || !Array.isArray(primera.data)) return [];

  const totalPaginas = Math.min(primera.meta?.totalPages ?? 1, MAX_CATALOGO_PAGES);
  let articulos = primera.data;
  if (totalPaginas > 1) {
    const resto = await Promise.all(
      Array.from({ length: totalPaginas - 1 }, (_, i) => pedirPagina(i + 2, null)),
    );
    for (const pagina of resto) {
      if (pagina?.success && Array.isArray(pagina.data)) articulos = articulos.concat(pagina.data);
    }
  }
  // El backend a veces manda el id con espacios de sobra (ej: "FLA24280-EU "):
  // sin recortarlo, la URL del producto sale con un %20 feo al final.
  return articulos.map((a) => ({ ...a, id: a.id.trim() }));
}

export async function obtenerArticuloTiendaPublico(id: string): Promise<ArticuloTienda | null> {
  const articulos = await obtenerCatalogoWebPublico();
  return articulos.find((a) => a.id === id.trim()) ?? null;
}
